
import React, { useState, useEffect } from 'react';
import { User, CompanySettings, AttendanceLog, AttendanceStatus } from '../types';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { calculateDistance, formatTime, formatDate } from '../utils';
import { getAttendanceInsights } from '../services/geminiService';
import { sendAttendanceToWebhook } from '../services/attendanceService';

interface EmployeeDashboardProps {
  user: User;
  logs: AttendanceLog[];
  settings: CompanySettings;
  onAddLog: (log: AttendanceLog) => void;
  onUpdateLog: (logId: string, updates: Partial<AttendanceLog>) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  user, logs, settings, onAddLog, onUpdateLog
}) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.userId === user.id && l.date.startsWith(todayStr));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logs.length > 0 && !insight) {
      getAttendanceInsights(logs.filter(l => l.userId === user.id), user.name).then(setInsight);
    }
  }, [logs, user]);

  const handleAction = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, settings.officeLat, settings.officeLng);
        const isFlagged = distance > settings.allowedRadiusMeters;
        const currentDateTime = new Date();
        const currentTimeFormatted = formatTime(currentDateTime);
        const locationString = `${latitude},${longitude}`;

        if (!todayLog) {
          // Check-In
          const newLog: AttendanceLog = {
            id: `log-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            date: currentDateTime.toISOString(),
            checkInTime: currentTimeFormatted,
            checkOutTime: null,
            checkInLat: latitude,
            checkInLng: longitude,
            checkOutLat: null,
            checkOutLng: null,
            checkInAddress: isFlagged ? 'Remote Area' : 'Office Premises',
            checkOutAddress: null,
            status: isFlagged ? AttendanceStatus.FLAGGED : AttendanceStatus.PARTIAL,
            flagged: isFlagged
          };
          onAddLog(newLog);

          // Send check-in data to webhook
          console.log('📍 Check-In: About to send webhook for user:', user.email);
          sendAttendanceToWebhook({
            Email: user.email,
            Role: user.role,
            Department: user.department,
            Name: user.name,
            ClockIn: currentTimeFormatted,
            ClockOut: null,
            Location: locationString,
            Date: currentDateTime.toISOString()
          }, 'checkin');
        } else {
          // Check-Out
          const checkOutTime = currentTimeFormatted;
          onUpdateLog(todayLog.id, {
            checkOutTime: checkOutTime,
            checkOutLat: latitude,
            checkOutLng: longitude,
            checkOutAddress: isFlagged ? 'Remote Area' : 'Office Premises',
            status: todayLog.flagged || isFlagged ? AttendanceStatus.FLAGGED : AttendanceStatus.PRESENT
          });

          // Send check-out data to webhook (includes both check-in and check-out times)
          console.log('📍 Check-Out: About to send webhook for user:', user.email);
          sendAttendanceToWebhook({
            Email: user.email,
            Role: user.role,
            Department: user.department,
            Name: user.name,
            ClockIn: todayLog.checkInTime,
            ClockOut: checkOutTime,
            Location: locationString,
            Date: todayLog.date
          }, 'checkout');
        }
        setLoading(false);
      },
      (error) => {
        alert("Failed to get location: " + error.message);
        setLoading(false);
      }
    );
  };

  const isCheckedIn = !!todayLog;
  const isCheckedOut = !!todayLog?.checkOutTime;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ClayCard className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img src={user.avatar} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-white" alt={user.name} />
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#E0E9F5]"></div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-800">Hi, {user.name}!</h2>
          <p className="text-slate-500">{user.department} • {user.role}</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-3xl font-bold text-blue-500 tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">{formatDate(currentTime)}</p>
        </div>
      </ClayCard>

      {/* Main Action */}
      <ClayCard className="text-center py-10 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-700">Attendance Desk</h3>
          <p className="text-sm text-slate-400">Automatic GPS check-in ensures secure logging.</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <ClayButton
            variant={isCheckedOut ? "ghost" : (isCheckedIn ? "danger" : "primary")}
            disabled={isCheckedOut || loading}
            onClick={handleAction}
            className="w-48 h-48 rounded-full text-xl flex-col"
          >
            {loading ? (
              <span className="animate-spin text-3xl">⌛</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                {isCheckedOut ? "Done" : (isCheckedIn ? "Check Out" : "Check In")}
              </>
            )}
          </ClayButton>

          {todayLog && (
            <div className="flex gap-8 mt-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">In</p>
                <p className="text-lg font-bold text-slate-700">{todayLog.checkInTime}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">Out</p>
                <p className="text-lg font-bold text-slate-700">{todayLog.checkOutTime || '--:--'}</p>
              </div>
            </div>
          )}
        </div>
      </ClayCard>

      {/* AI Insight */}
      {insight && (
        <ClayCard className="bg-blue-50/50 border-blue-200">
          <div className="flex gap-3">
            <div className="text-2xl">✨</div>
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-1">AI Assistant Insights</p>
              <p className="text-sm text-blue-800 leading-relaxed italic">"{insight}"</p>
            </div>
          </div>
        </ClayCard>
      )}

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 ml-1">Recent Activity</h3>
        {logs.filter(l => l.userId === user.id).slice(0, 5).map(log => (
          <ClayCard key={log.id} padding="p-4" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-600' :
                log.status === AttendanceStatus.FLAGGED ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-700">{formatDate(new Date(log.date))}</p>
                <p className="text-xs text-slate-400">{log.checkInAddress || 'No address'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700">{log.status}</p>
              <p className="text-xs text-slate-400">{log.checkInTime} - {log.checkOutTime || '...'}</p>
            </div>
          </ClayCard>
        ))}
      </div>
    </div>
  );
};
