import React, { useState } from 'react';
import { Tv, Lock, User, AlertCircle } from 'lucide-react';
import { USERS } from '../services/storageService';

export default function LoginModal({ onLoginSuccess }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle Guest Login (Locked with password 'indonesia')
  const handleGuestLogin = (e) => {
    e.preventDefault();
    setError('');

    if (password !== USERS.guest.password) {
      setError('Kata sandi akses salah.');
      return;
    }

    onLoginSuccess(USERS.guest);
  };

  // Handle Admin Login (Username 'admin' & Password 'indonesia')
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    if (trimmedUser !== USERS.admin.username || password !== USERS.admin.password) {
      setError('Username atau password salah.');
      return;
    }

    onLoginSuccess(USERS.admin);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-lg bg-navy-900 text-white flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">StreamTV</h1>
            <p className="text-xs text-slate-500 mt-0.5">Pemutar Siaran Televisi</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(false);
              setPassword('');
              setError('');
            }}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition -mb-px ${
              !isAdminMode
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tamu (Guest)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setUsername('');
              setPassword('');
              setError('');
            }}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition -mb-px ${
              isAdminMode
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Administrator
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isAdminMode ? (
          /* --- GUEST FORM --- */
          <form onSubmit={handleGuestLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata Sandi Akses
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition mt-1"
            >
              Masuk
            </button>
          </form>
        ) : (
          /* --- ADMIN FORM --- */
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username admin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password admin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition mt-1"
            >
              Masuk
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
