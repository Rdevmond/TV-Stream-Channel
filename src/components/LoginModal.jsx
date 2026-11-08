import React, { useState } from 'react';
import { Tv, Shield, User, Lock, AlertCircle, ArrowRight, PlayCircle } from 'lucide-react';
import { USERS } from '../services/storageService';

export default function LoginModal({ onLoginSuccess }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  // Handle Guest Login (No password required)
  const handleGuestLogin = () => {
    onLoginSuccess(USERS.guest);
  };

  // Handle Admin Login (Password required)
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');

    if (password !== USERS.admin.password) {
      setError('Password administrator salah! Gunakan: admin123');
      return;
    }

    onLoginSuccess(USERS.admin);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Banner - Deep Navy */}
        <div className="bg-navy-900 px-6 py-8 text-white text-center border-b border-navy-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-navy-800 border border-navy-700 text-blue-400 mb-3 shadow-inner">
            <Tv className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StreamTV Portal</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Portal streaming siaran TV langsung • Saluran Indonesia & Bahasa Inggris
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          
          {!isAdminMode ? (
            /* --- GUEST MODE (NO PASSWORD) --- */
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-700">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-navy-900">Masuk Langsung sebagai Penonton (Guest)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tidak perlu mendaftar atau memasukkan kata sandi. Anda bisa langsung menjelajahi ratusan siaran TV dan menandai favorit.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Mulai Nonton Sekarang (Gratis)</span>
              </button>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsAdminMode(true); setError(''); }}
                  className="text-xs text-slate-500 hover:text-navy-900 font-medium inline-flex items-center gap-1.5 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Apakah Anda Administrator? Klik untuk Masuk Admin</span>
                </button>
              </div>
            </div>
          ) : (
            /* --- ADMIN MODE (PASSWORD REQUIRED) --- */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span>Login Administrator</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAdminMode(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  ← Kembali ke Guest
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value="admin"
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Admin
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan admin123"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-navy-800 hover:bg-navy-900 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Masuk Panel Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Putih & Biru Tua • Bebas Siaran Bahasa Latin & Arab
        </div>

      </div>
    </div>
  );
}
