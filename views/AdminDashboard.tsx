
import React, { useState, useMemo } from 'react';
import { User, AttendanceLog, CompanySettings, AttendanceStatus } from '../types';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import { formatDate } from '../utils';

interface AdminDashboardProps {
  user: User;
  logs: AttendanceLog[];
  settings: CompanySettings;
  onUpdateLog: (logId: string, updates: Partial<AttendanceLog>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, logs, settings, onUpdateLog 
}) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date.startsWith(today));
    return {
      total: todayLogs.length,
      flagged: todayLogs.filter(l => l.status === AttendanceStatus.FLAGGED).length,
      present: todayLogs.filter(l => l.status === AttendanceStatus.PRESENT).length
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.userName.toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, filter, statusFilter]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Name,Check In,Check Out,Status,Flagged\n"
      + filteredLogs.map(l => `${l.date},${l.userName},${l.checkInTime},${l.checkOutTime},${l.status},${l.flagged}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Admin Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClayCard className="flex flex-col items-center text-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Present Today</p>
          <p className="text-4xl font-extrabold text-blue-500">{stats.present}</p>
        </ClayCard>
        <ClayCard className="flex flex-col items-center text-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Flagged Today</p>
          <p className="text-4xl font-extrabold text-orange-500">{stats.flagged}</p>
        </ClayCard>
        <ClayCard className="flex flex-col items-center text-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Activity</p>
          <p className="text-4xl font-extrabold text-slate-700">{logs.length}</p>
        </ClayCard>
      </div>

      {/* Controls */}
      <ClayCard className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full">
          <input 
            type="text" 
            placeholder="Search employee..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#E0E9F5] border border-white/40 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select 
            className="px-4 py-3 rounded-xl bg-[#E0E9F5] border border-white/40 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value={AttendanceStatus.PRESENT}>Present</option>
            <option value={AttendanceStatus.PARTIAL}>Partial</option>
            <option value={AttendanceStatus.FLAGGED}>Flagged</option>
          </select>
        </div>
        <ClayButton onClick={handleExport} variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </ClayButton>
      </ClayCard>

      {/* Log Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 ml-1">Attendance Logs</h3>
        {filteredLogs.map(log => (
          <ClayCard key={log.id} padding="p-4" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                <img src={`https://picsum.photos/seed/${log.userName}/200`} alt={log.userName} />
              </div>
              <div>
                <p className="font-bold text-slate-700">{log.userName}</p>
                <p className="text-xs text-slate-400">{formatDate(new Date(log.date))}</p>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Check In</p>
                <p className="font-semibold">{log.checkInTime}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Check Out</p>
                <p className="font-semibold">{log.checkOutTime || '--:--'}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Location</p>
                <p className="font-semibold truncate max-w-[150px]">{log.checkInAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                log.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-600' : 
                log.status === AttendanceStatus.FLAGGED ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {log.status}
              </span>
              {log.status === AttendanceStatus.FLAGGED && (
                <ClayButton 
                  variant="ghost" 
                  className="px-2 py-1 text-xs" 
                  onClick={() => onUpdateLog(log.id, { status: AttendanceStatus.PRESENT, flagged: false })}
                >
                  Approve
                </ClayButton>
              )}
            </div>
          </ClayCard>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No logs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
