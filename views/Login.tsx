
import React, { useState } from 'react';
import { ClayCard } from '../components/ClayCard';
import { ClayButton } from '../components/ClayButton';
import Silk from '../components/Silk';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError("Invalid credentials or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#E0E9F5] overflow-hidden">
      {/* Background Silk Animation */}
      <Silk color="#93C5FD" speed={1.5} scale={1.2} noiseIntensity={0.8} />

      <div className="w-full max-w-md space-y-8 text-center relative z-10">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500">Sign in to track your attendance</p>
        </div>

        <ClayCard className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="text-left">
              <label className="block text-sm font-medium text-slate-600 ml-1 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#E0E9F5] border border-white/40 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="email@company.com"
                required
                disabled={loading}
              />
            </div>

            <div className="text-left">
              <label className="block text-sm font-medium text-slate-600 ml-1 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#E0E9F5] border border-white/40 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <ClayButton fullWidth variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : "Sign In"}
            </ClayButton>
          </form>

          <div className="mt-6 flex justify-between items-center text-sm">
            <button className="text-blue-500 hover:underline">Forgot password?</button>
            <span className="text-slate-400">v1.1.0</span>
          </div>
        </ClayCard>

        <p className="text-slate-400 text-xs mt-8">
          HAVE A NICE DAY 😀
        </p>
      </div>
    </div>
  );
};
