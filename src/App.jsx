import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ChannelCard from './components/ChannelCard';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import { CATEGORIES } from './data/channels';
import { 
  getStoredUser, 
  setStoredUser, 
  getAllChannels, 
  updatePresence,
  getFavoriteIds,
  toggleFavorite,
  deleteChannel,
} from './services/storageService';
import { Tv, Filter } from 'lucide-react';

// Inject "Favorit" after "Semua" in category tabs
const ALL_CATEGORIES = ['Semua', 'Favorit', ...CATEGORIES.filter(c => c !== 'Semua')];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [channels, setChannels] = useState(() => getAllChannels());
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteIds());

  // Keep channels fresh (called after add/delete/restore)
  const refreshChannels = () => {
    setChannels(getAllChannels());
  };

  // Heartbeat to keep presence alive every 5 seconds
  useEffect(() => {
    if (!currentUser) return;

    updatePresence(
      currentUser.username, 
      currentUser.role, 
      selectedChannel ? 'Menonton Siaran' : 'Menjelajah Channel',
      selectedChannel
    );

    const interval = setInterval(() => {
      updatePresence(
        currentUser.username, 
        currentUser.role, 
        selectedChannel ? 'Menonton Siaran' : 'Menjelajah Channel',
        selectedChannel
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, selectedChannel]);

  // Login handler (guest or admin)
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setStoredUser(user);
  };

  // Logout handler
  const handleLogout = () => {
    if (currentUser) {
      updatePresence(currentUser.username, currentUser.role, 'Offline', null);
    }
    setCurrentUser(null);
    setStoredUser(null);
    setSelectedChannel(null);
  };

  // Channel select
  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle favorite
  const handleToggleFavorite = (channelId) => {
    const updated = toggleFavorite(channelId);
    setFavoriteIds([...updated]);
  };

  // Admin: soft-delete a channel
  const handleDeleteChannel = (channelId) => {
    deleteChannel(channelId);
    refreshChannels();
  };

  // Filter channels based on Category & Search Query
  const filteredChannels = channels.filter((ch) => {
    let matchesCategory = selectedCategory === 'Semua';

    if (!matchesCategory) {
      const catLower = selectedCategory.toLowerCase();
      if (catLower === 'favorit') {
        matchesCategory = favoriteIds.includes(ch.id);
      } else if (catLower === 'indonesia') {
        matchesCategory = 
          ch.category?.toLowerCase() === 'indonesia' || 
          ch.country?.toLowerCase() === 'indonesia' || 
          ch.language?.toLowerCase().includes('indonesia');
      } else {
        matchesCategory = 
          ch.category?.toLowerCase() === catLower ||
          ch.category?.toLowerCase().includes(catLower);
      }
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      ch.name.toLowerCase().includes(q) ||
      ch.category?.toLowerCase().includes(q) ||
      ch.country?.toLowerCase().includes(q) ||
      ch.language?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // If user is not logged in, display the clean Home Login Screen
  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onLogout={handleLogout}
        onLogoClick={() => setSelectedChannel(null)}
      />

      {/* Main Content Area */}
      {selectedChannel ? (
        // Jellyfin Style Video Player View
        <VideoPlayer
          channel={selectedChannel}
          onBack={() => setSelectedChannel(null)}
          allChannels={channels}
          onSelectChannel={handleSelectChannel}
          isFavorite={favoriteIds.includes(selectedChannel?.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        // Channel Catalog & Category Explorer View
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Welcome & Banner (Navy Theme) */}
          <div className="bg-navy-900 rounded-xl p-6 text-white mb-6 border border-navy-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white uppercase tracking-wider">
                  Siaran Langsung
                </span>
                <span className="text-xs text-slate-300">Prioritas Saluran Indonesia &amp; Internasional</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Pilih Saluran TV Favorit Anda
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Klik saluran untuk langsung menonton siaran live. Format HLS diputar seketika tanpa perlu mendownload video ke perangkat Anda.
              </p>
            </div>

            <div className="bg-navy-950/80 px-4 py-3 rounded-lg border border-navy-700/80 text-right shrink-0">
              <span className="text-[11px] text-slate-400 block">Total Saluran Aktif</span>
              <span className="text-xl font-bold text-blue-400">{channels.length} Saluran</span>
              {favoriteIds.length > 0 && (
                <span className="text-[10px] text-amber-400 block mt-0.5">
                  ★ {favoriteIds.length} Favorit
                </span>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Kategori:
            </span>
            {ALL_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const isFavCat = cat === 'Favorit';
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? isFavCat
                        ? 'bg-amber-500 text-white shadow-xs font-semibold'
                        : 'bg-navy-900 text-white shadow-xs font-semibold'
                      : isFavCat
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isFavCat ? `★ ${cat}` : cat}
                  {isFavCat && favoriteIds.length > 0 && (
                    <span className="ml-1 text-[10px] opacity-75">({favoriteIds.length})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Channel Grid */}
          {filteredChannels.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
              <Tv className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              {selectedCategory === 'Favorit' ? (
                <>
                  <h3 className="text-sm font-semibold text-slate-700">Belum ada saluran favorit</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Klik ikon ★ pada kartu saluran mana saja untuk menambahkannya ke favorit Anda.
                  </p>
                  <button
                    onClick={() => setSelectedCategory('Semua')}
                    className="mt-4 px-3.5 py-1.5 bg-navy-800 text-white text-xs font-medium rounded-lg hover:bg-navy-900 transition"
                  >
                    Lihat Semua Saluran
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-slate-700">Tidak ada saluran ditemukan</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba sesuaikan kata kunci pencarian atau ganti pilihan kategori Anda.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}
                    className="mt-4 px-3.5 py-1.5 bg-navy-800 text-white text-xs font-medium rounded-lg hover:bg-navy-900 transition"
                  >
                    Reset Filter
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onSelect={handleSelectChannel}
                  isFavorite={favoriteIds.includes(channel.id)}
                  onToggleFavorite={handleToggleFavorite}
                  isAdmin={currentUser?.role === 'admin'}
                  onDeleteChannel={handleDeleteChannel}
                />
              ))}
            </div>
          )}

        </main>
      )}

      {/* Admin Panel Modal */}
      {currentUser.role === 'admin' && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          onChannelChanged={refreshChannels}
          allChannels={channels}
        />
      )}

      {/* Minimalist Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          StreamTV • Web IPTV Media Player • Siaran Indonesia &amp; Internasional
        </div>
      </footer>
    </div>
  );
}
