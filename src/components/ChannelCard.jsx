import React, { useState } from 'react';
import { Play, Tv, Star, Trash2, Globe, Info } from 'lucide-react';

export default function ChannelCard({ 
  channel, 
  onSelect, 
  isFavorite, 
  onToggleFavorite, 
  isAdmin, 
  onDeleteChannel 
}) {
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Hapus saluran "${channel.name}" dari katalog?`)) {
      onDeleteChannel(channel.id);
    }
  };

  return (
    <div className="relative group">
      
      {/* Main Channel Card */}
      <div
        onClick={() => onSelect(channel)}
        className="bg-white border border-slate-200 hover:border-blue-600 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col h-full select-none"
      >
        {/* Top Banner / Channel Logo Box */}
        <div className="relative h-28 sm:h-32 bg-blue-100 flex items-center justify-center p-3 border-b border-blue-200 overflow-hidden">
          
          {/* Favorite Button (Star) */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg backdrop-blur-xs transition shadow-xs ${
              isFavorite 
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
            title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Admin Delete Button (Trash) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="absolute top-2 left-9 z-10 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-xs transition shadow-xs"
              title="Hapus Saluran (Khusus Admin)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Logo or Fallback */}
          {channel.logo && !imgError ? (
            <img
              src={channel.logo}
              alt={channel.name}
              onError={() => setImgError(true)}
              className="max-h-16 sm:max-h-20 max-w-[80%] object-contain transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-lg">
              <Tv className="w-6 h-6" />
            </div>
          )}

          {/* Live Badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-navy-900/90 text-[9px] font-semibold text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE</span>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-white/95 border border-slate-200 text-[10px] font-medium text-slate-700 shadow-2xs">
            {channel.category}
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white text-navy-900 flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 ml-0.5 fill-current text-blue-700" />
            </div>
          </div>
        </div>

        {/* Body Info */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition line-clamp-1">
              {channel.name}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {channel.description || 'Siaran langsung berkualitas tinggi.'}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1 truncate max-w-[65%]">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{channel.country || 'Internasional'}</span>
            </span>
            <span className="font-medium text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
              {channel.language === 'Bahasa Indonesia' ? 'ID' : 'EN'}
            </span>
          </div>
        </div>
      </div>

      {/* --- HOVER POPUP TOOLTIP (FULL NAME & DETAILED INFO) --- */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-navy-950 text-white rounded-xl p-3.5 shadow-2xl border border-navy-700 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-40 transform translate-y-1 group-hover:translate-y-0 hidden sm:block">
        
        {/* Pointer Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-950"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="font-bold text-xs text-white leading-snug">
            {channel.name}
          </h4>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-600/30 text-blue-300 border border-blue-500/30 shrink-0">
            {channel.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
          {channel.description || 'Saluran siaran langsung terverifikasi aktif tanpa gangguan.'}
        </p>

        {/* Meta badges */}
        <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Negara: <strong className="text-slate-200">{channel.country || 'Global'}</strong></span>
          <span>Bahasa: <strong className="text-blue-300">{channel.language}</strong></span>
        </div>

        <div className="mt-2 text-center text-[10px] text-blue-400 font-medium">
          ▶ Klik kartu untuk menonton siaran langsung
        </div>
      </div>

    </div>
  );
}
