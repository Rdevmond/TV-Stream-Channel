import React from 'react';
import { Tv, Search, Shield, User, LogOut, Radio } from 'lucide-react';

export default function Navbar({
  user,
  searchQuery,
  setSearchQuery,
  onOpenAdmin,
  onLogout,
  onLogoClick
}) {
  return (
    <header className="sticky top-0 z-30 bg-navy-900 border-b border-navy-700 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            onClick={onLogoClick} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-lg bg-navy-800 border border-navy-600 flex items-center justify-center text-blue-400 group-hover:bg-navy-700 transition">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
                <span>Stream</span>
                <span className="text-blue-400">TV</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-600/30 text-red-300 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">IPTV Streaming Portal</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari channel siaran, berita, negara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-950/80 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* User info & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-blue-300 capitalize">{user.role === 'admin' ? 'Administrator' : 'Penonton'}</span>
                </div>

                {user.role === 'admin' && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 transition shadow-sm"
                    title="Panel Monitoring Admin"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </header>
  );
}

