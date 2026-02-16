
import React, { useState, useEffect } from 'react';
import { User, UserRole, AttendanceLog, CompanySettings, AttendanceStatus } from './types';
import { MOCK_USERS, DEFAULT_COMPANY_SETTINGS, INITIAL_LOGS } from './constants';
import { Login } from './views/Login';
import { EmployeeDashboard } from './views/EmployeeDashboard';
import { AdminDashboard } from './views/AdminDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('bluemark_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);

  useEffect(() => {
    localStorage.setItem('bluemark_logs', JSON.stringify(logs));
  }, [logs]);

  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      // Endpoint for n8n webhook
      const response = await fetch('https://n8n.kishoren8n.in/webhook/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Server connection error.');
      }

      let data = await response.json();

      // Verify response from n8n - handle both object and array responses
      if (data.status === 'unsuccess') {
        throw new Error(data.message || 'Login unsuccessful');
      }

      // If n8n returns an array (like your example), extract the first user
      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new Error('Invalid credentials - no user found');
        }
        data = data[0]; // Get the first user object from array
      }

      // Validate that we have actual user data (not just an empty object)
      // Check for required fields: Email or Name or Role
      if (!data.Email && !data.Name && !data.Role && !data.user_role && !data.email) {
        throw new Error('Invalid credentials');
      }

      // Extract user details from the response
      // Support both formats: {Email, Password, Role, Name, Department} and {user_role, user_name, etc.}
      const userEmail = data.Email || data.email || email;
      const userName = data.Name || data.user_name || email.split('@')[0];
      const userRole = data.Role || data.user_role || 'EMPLOYEE';
      const userDepartment = data.Department || data.department || 'General';

      // Map role to UserRole enum
      const assignedRole = userRole.toUpperCase() === 'ADMIN'
        ? UserRole.ADMIN
        : UserRole.EMPLOYEE;

      setUser({
        id: data.user_id || data.id || `user-${Date.now()}`,
        name: userName,
        email: userEmail,
        role: assignedRole,
        department: userDepartment,
        avatar: data.avatar || `https://picsum.photos/seed/${userEmail}/200`
      });

    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const addLog = (newLog: AttendanceLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const updateLog = (logId: string, updates: Partial<AttendanceLog>) => {
    setLogs(prev => prev.map(log => log.id === logId ? { ...log, ...updates } : log));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <nav className="p-4 md:p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="GAL Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">GAL Login</h1>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        {user.role === UserRole.ADMIN ? (
          <AdminDashboard
            user={user}
            logs={logs}
            settings={settings}
            onUpdateLog={updateLog}
          />
        ) : (
          <EmployeeDashboard
            user={user}
            logs={logs}
            settings={settings}
            onAddLog={addLog}
            onUpdateLog={updateLog}
          />
        )}
      </main>
    </div>
  );
};

export default App;
