import { DEFAULT_CHANNELS } from '../data/channels';

const SESSIONS_KEY = 'iptv_active_sessions';
const CUSTOM_CHANNELS_KEY = 'iptv_custom_channels';
const DELETED_CHANNELS_KEY = 'iptv_deleted_channels';
const FAVORITES_KEY = 'iptv_favorite_channels';
const CURRENT_USER_KEY = 'iptv_current_user';

// BroadcastChannel for cross-tab real-time sync
const broadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('iptv_live_sync') 
  : null;

// User Credentials
export const USERS = {
  admin: {
    username: 'admin',
    password: 'indonesia',
    name: 'Administrator',
    role: 'admin',
  },
  guest: {
    username: 'guest',
    password: 'indonesia',
    name: 'Tamu (Guest)',
    role: 'guest',
  }
};

export const getStoredUser = () => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    updatePresence(user.username, user.role, 'Menu Utama', null);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Update active presence / status
export const updatePresence = (username, role, action, channel = null) => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions = raw ? JSON.parse(raw) : {};

    sessions[username] = {
      username,
      role,
      action: action || 'Menjelajah Channel',
      watchingChannel: channel ? {
        id: channel.id,
        name: channel.name,
        category: channel.category,
        logo: channel.logo
      } : null,
      lastActive: Date.now(),
      status: 'online'
    };

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    if (broadcast) {
      broadcast.postMessage({ type: 'PRESENCE_UPDATE', sessions });
    }
  } catch (err) {
    console.error('Error updating presence:', err);
  }
};

// Retrieve all user sessions for Admin dashboard
export const getActiveSessions = () => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    const result = [];

    // Ensure our known accounts appear in the list
    Object.keys(USERS).forEach(username => {
      const sess = sessions[username];
      const isOnline = sess && (now - sess.lastActive < 20000);
      result.push({
        username,
        name: USERS[username].name,
        role: USERS[username].role,
        isOnline: Boolean(isOnline),
        lastActive: sess ? sess.lastActive : null,
        watchingChannel: isOnline ? sess.watchingChannel : null,
        action: isOnline ? sess.action : 'Offline'
      });
    });

    return result;
  } catch (err) {
    console.error('Error getting sessions:', err);
    return [];
  }
};

// Subscribe to live presence changes
export const subscribeToPresence = (callback) => {
  if (!broadcast) return () => {};

  const handler = (event) => {
    if (event.data?.type === 'PRESENCE_UPDATE') {
      callback(getActiveSessions());
    }
  };

  broadcast.addEventListener('message', handler);
  return () => broadcast.removeEventListener('message', handler);
};

// --- FAVORITES MANAGEMENT ---
export const getFavoriteIds = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleFavorite = (channelId) => {
  try {
    const favorites = getFavoriteIds();
    let updated;
    if (favorites.includes(channelId)) {
      updated = favorites.filter(id => id !== channelId);
    } else {
      updated = [...favorites, channelId];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return [];
  }
};

// --- DELETED CHANNELS (ADMIN FEATURE) ---
export const getDeletedChannelIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_CHANNELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const deleteChannel = (channelId) => {
  try {
    const deleted = getDeletedChannelIds();
    if (!deleted.includes(channelId)) {
      deleted.push(channelId);
      localStorage.setItem(DELETED_CHANNELS_KEY, JSON.stringify(deleted));
    }
    // Also remove from custom channels if it's there
    deleteCustomChannel(channelId);
  } catch (err) {
    console.error('Error deleting channel:', err);
  }
};

export const restoreAllChannels = () => {
  try {
    localStorage.removeItem(DELETED_CHANNELS_KEY);
  } catch (err) {
    console.error('Error restoring channels:', err);
  }
};

// --- CHANNEL MANAGEMENT ---
export const getAllChannels = () => {
  try {
    const rawCustom = localStorage.getItem(CUSTOM_CHANNELS_KEY);
    const custom = rawCustom ? JSON.parse(rawCustom) : [];
    const deletedIds = new Set(getDeletedChannelIds());

    const combined = [...DEFAULT_CHANNELS, ...custom];
    // Filter out channels deleted by admin
    return combined.filter(c => !deletedIds.has(c.id));
  } catch {
    return DEFAULT_CHANNELS;
  }
};

export const addCustomChannel = (channel) => {
  try {
    const raw = localStorage.getItem(CUSTOM_CHANNELS_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    const newChannel = {
      ...channel,
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      isCustom: true
    };
    custom.unshift(newChannel);
    localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(custom));
    return newChannel;
  } catch (err) {
    console.error('Error adding channel:', err);
    return null;
  }
};

export const deleteCustomChannel = (id) => {
  try {
    const raw = localStorage.getItem(CUSTOM_CHANNELS_KEY);
    if (!raw) return;
    const custom = JSON.parse(raw);
    const filtered = custom.filter(c => c.id !== id);
    localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting custom channel:', err);
  }
};

// Parse simple M3U text
export const parseM3U = (content) => {
  const lines = content.split('\n');
  const channels = [];
  let currentInfo = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const parts = line.split(',');
      const channelName = parts.length > 1 ? parts[parts.length - 1].trim() : 'Channel Tanpa Nama';

      currentInfo = {
        name: channelName,
        category: groupMatch ? groupMatch[1].trim() : 'Entertainment',
        logo: logoMatch ? logoMatch[1].trim() : '',
      };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentInfo) {
        channels.push({
          id: 'imported-' + Date.now() + '-' + channels.length,
          name: currentInfo.name,
          category: currentInfo.category || 'Entertainment',
          country: 'Global',
          language: 'Bahasa Inggris',
          logo: currentInfo.logo || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=100&auto=format&fit=crop&q=60',
          description: 'Saluran siaran langsung hasil impor dari playlist M3U.',
          streamUrl: line,
          isCustom: true
        });
        currentInfo = null;
      }
    }
  }

  return channels;
};
