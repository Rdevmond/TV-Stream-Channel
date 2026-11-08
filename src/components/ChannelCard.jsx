import React, { useState } from 'react';
import { Play, Tv, Star, Trash2 } from 'lucide-react';

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
    if (window.confirm(`Hapus saluran "${channel.name}"?`)) {
      onDeleteChannel(channel.id);
    }
  };

  return (
    <div className="relative group">
      
      {/* Main Channel Card */}
      <div
        onClick={() => onSelect(channel)}
        className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg overflow-hidden cursor-pointer transition flex flex-col h-full select-none"
      >
        {/* Logo Container with pale blue background */}
        <div className="relative h-28 bg-blue-50/70 flex items-center justify-center p-3 border-b border-slate-100">
          
          {/* Favorite Star */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 z-10 p-1 rounded transition ${
              isFavorite 
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                : 'bg-black/20 hover:bg-black/40 text-white'
            }`}
            title={isFavorite ? 'Hapus Favorit' : 'Tambah Favorit'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Admin Delete Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="absolute top-2 left-8 z-10 p-1 rounded bg-red-600/80 hover:bg-red-700 text-white transition"
              title="Hapus Saluran"
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
              className="max-h-16 max-w-[80%] object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
              <Tv className="w-5 h-5" />
            </div>
          )}

          {/* Category Tag */}
          <span className="absolute bottom-1.5 right-2 text-[10px] text-slate-500">
            {channel.category}
          </span>
        </div>

        {/* Body Info */}
        <div className="p-2.5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-1">
              {channel.name}
            </h3>
            {channel.description && (
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                {channel.description}
              </p>
            )}
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>{channel.country || 'Global'}</span>
            <span className="font-medium text-slate-600">
              {channel.language === 'Bahasa Indonesia' ? 'ID' : 'EN'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip (Full Name & Details) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white rounded-lg p-3 shadow-lg border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-40 hidden sm:block">
        <h4 className="font-semibold text-xs text-white">
          {channel.name}
        </h4>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          {channel.description || 'Siaran langsung TV.'}
        </p>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>{channel.country || 'Global'}</span>
          <span>{channel.language}</span>
        </div>
      </div>

    </div>
  );
}
