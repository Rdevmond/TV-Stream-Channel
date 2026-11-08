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
import { Tv } from 'lucide-react';

const ALL_CATEGORIES = ['Semua', 'Favorit', ...CATEGORIES.filter(c => c !== 'Semua')];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [channels, setChannels] = useState(() => getAllChannels());
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteIds());

  // Keep channels fresh
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

  // Login handler
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
        <VideoPlayer
          channel={selectedChannel}
          onBack={() => setSelectedChannel(null)}
          allChannels={channels}
          onSelectChannel={handleSelectChannel}
          isFavorite={favoriteIds.includes(selectedChannel?.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
          
          {/* Header & Category Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {ALL_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                const isFavCat = cat === 'Favorit';
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-navy-900 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isFavCat ? `★ Favorit (${favoriteIds.length})` : cat}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 shrink-0 self-end sm:self-center">
              {filteredChannels.length} Saluran
            </div>
          </div>

          {/* Channel Grid */}
          {filteredChannels.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200 p-8">
              <Tv className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Tidak ada saluran ditemukan</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}
                className="mt-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-900 transition"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          StreamTV
        </div>
      </footer>
    </div>
  );
}
