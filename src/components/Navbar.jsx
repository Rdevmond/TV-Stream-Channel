import React from 'react';
import { Tv, Search, Shield, User, LogOut } from 'lucide-react';

export default function Navbar({
  user,
  searchQuery,
  setSearchQuery,
  onOpenAdmin,
  onLogout,
  onLogoClick
}) {
  return (
    <header className="sticky top-0 z-30 bg-navy-900 text-white border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Logo */}
          <div 
            onClick={onLogoClick} 
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">StreamTV</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari saluran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 mr-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.name}</span>
                </div>

                {user.role === 'admin' && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-white border border-navy-700 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
