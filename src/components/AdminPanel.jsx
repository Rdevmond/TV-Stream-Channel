import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Tv, 
  Plus, 
  Upload, 
  Trash2, 
  Radio, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Search,
  RotateCcw,
  X
} from 'lucide-react';
import { 
  getActiveSessions, 
  subscribeToPresence, 
  addCustomChannel, 
  deleteChannel,
  restoreAllChannels,
  getDeletedChannelIds,
  parseM3U 
} from '../services/storageService';

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  onChannelChanged, 
  allChannels 
}) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'manage-delete' | 'add-single' | 'import-m3u'
  const [sessions, setSessions] = useState(getActiveSessions());
  const [channelSearch, setChannelSearch] = useState('');
  const [deletedCount, setDeletedCount] = useState(() => getDeletedChannelIds().length);

  // Form states for adding single channel
  const [channelName, setChannelName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [category, setCategory] = useState('Animation');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');

  // Form states for M3U / GitHub repo playlist import
  const [m3uSource, setM3uSource] = useState('https://iptv-org.github.io/iptv/countries/id.m3u');
  const [m3uText, setM3uText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // Subscribe to live user updates
  useEffect(() => {
    if (!isOpen) return;

    setSessions(getActiveSessions());
    setDeletedCount(getDeletedChannelIds().length);

    const timer = setInterval(() => {
      setSessions(getActiveSessions());
    }, 3000);

    const unsubscribe = subscribeToPresence((newSessions) => {
      setSessions(newSessions);
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSingleChannel = (e) => {
    e.preventDefault();
    if (!channelName.trim() || !streamUrl.trim()) return;

    const newChan = addCustomChannel({
      name: channelName.trim(),
      streamUrl: streamUrl.trim(),
      category: category.trim() || 'Entertainment',
      country: category === 'Indonesia' ? 'Indonesia' : 'Global',
      language: category === 'Indonesia' ? 'Bahasa Indonesia' : 'Bahasa Inggris',
      logo: logoUrl.trim() || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=100&auto=format&fit=crop&q=60',
      description: description.trim() || 'Saluran kustom yang ditambahkan oleh Administrator.'
    });

    if (newChan) {
      onChannelChanged();
      setChannelName('');
      setStreamUrl('');
      setLogoUrl('');
      setDescription('');
      setImportStatus('Saluran berhasil ditambahkan!');
      setTimeout(() => setImportStatus(''), 4000);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus saluran "${name}"?`)) {
      deleteChannel(id);
      setDeletedCount(getDeletedChannelIds().length);
      onChannelChanged();
    }
  };

  const handleRestoreAll = () => {
    if (window.confirm('Pulihkan semua saluran yang pernah dihapus?')) {
      restoreAllChannels();
      setDeletedCount(0);
      onChannelChanged();
      setImportStatus('Semua saluran yang dihapus berhasil dipulihkan!');
      setTimeout(() => setImportStatus(''), 4000);
    }
  };

  const handleImportM3UUrl = async () => {
    if (!m3uSource.trim()) return;
    setIsImporting(true);
    setImportStatus('Mengunduh playlist dari URL...');

    try {
      const res = await fetch(m3uSource);
      if (!res.ok) throw new Error('Gagal mengunduh URL playlist');
      const text = await res.text();
      const parsed = parseM3U(text);

      if (parsed.length === 0) {
        setImportStatus('Tidak ada channel yang dapat diparse.');
      } else {
        const toSave = parsed.slice(0, 40);
        toSave.forEach(c => addCustomChannel(c));
        onChannelChanged();
        setImportStatus(`Berhasil mengimpor ${toSave.length} channel baru!`);
      }
    } catch (err) {
      setImportStatus('Gagal: ' + err.message);
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportStatus(''), 5000);
    }
  };

  const handleImportM3UText = () => {
    if (!m3uText.trim()) return;
    const parsed = parseM3U(m3uText);
    if (parsed.length === 0) {
      setImportStatus('Format M3U tidak valid.');
      return;
    }
    const toSave = parsed.slice(0, 40);
    toSave.forEach(c => addCustomChannel(c));
    onChannelChanged();
    setM3uText('');
    setImportStatus(`Berhasil mengimpor ${toSave.length} channel dari teks M3U!`);
    setTimeout(() => setImportStatus(''), 5000);
  };

  // Filter channels in manage tab
  const filteredForManage = allChannels.filter(c => {
    const q = channelSearch.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Panel Administrator</h2>
              <p className="text-xs text-slate-300">Monitoring User Real-time & Manajemen Saluran TV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'users'
                ? 'border-navy-800 text-navy-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Aktif & Monitoring</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-delete')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'manage-delete'
                ? 'border-navy-800 text-navy-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Kelola & Hapus Channel ({allChannels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add-single')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'add-single'
                ? 'border-navy-800 text-navy-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Channel Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('import-m3u')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'import-m3u'
                ? 'border-navy-800 text-navy-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Playlist M3U</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {importStatus && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* TAB 1: USERS MONITORING */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Status Aktivitas Pengguna Real-time</h3>
                  <p className="text-xs text-slate-500">Melihat siapa yang sedang online dan siaran apa yang sedang mereka tonton.</p>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.username}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 font-bold text-xs flex items-center justify-center">
                            {sess.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{sess.name} ({sess.username})</p>
                            <span className="text-[10px] text-slate-400 capitalize">{sess.role}</span>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sess.isOnline 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sess.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          {sess.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-700 mb-1">Aktivitas Saat Ini:</p>
                        {sess.watchingChannel ? (
                          <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span>Sedang Nonton: <strong>{sess.watchingChannel.name}</strong></span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {sess.watchingChannel.category}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            {sess.isOnline ? 'Sedang di menu utama / memilih channel' : 'Tidak aktif'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Terakhir aktif: {sess.lastActive ? new Date(sess.lastActive).toLocaleTimeString() : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE & DELETE CHANNELS */}
          {activeTab === 'manage-delete' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar & Hapus Saluran TV</h3>
                  <p className="text-xs text-slate-500">
                    Admin dapat menghapus saluran yang tidak diinginkan secara instan dari katalog.
                  </p>
                </div>

                {deletedCount > 0 && (
                  <button
                    onClick={handleRestoreAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pulihkan {deletedCount} Saluran yang Dihapus</span>
                  </button>
                )}
              </div>

              {/* Search channel filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari saluran untuk dihapus..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                />
              </div>

              {/* Channels List */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-96 overflow-y-auto bg-slate-50/50">
                {filteredForManage.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Tidak ada saluran yang cocok dengan pencarian.
                  </div>
                ) : (
                  filteredForManage.map((c) => (
                    <div key={c.id} className="p-3 flex items-center justify-between hover:bg-white transition">
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {c.logo ? (
                            <img src={c.logo} alt={c.name} className="w-7 h-7 object-contain" />
                          ) : (
                            <Tv className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">{c.category}</span>
                            <span>{c.country}</span>
                            <span>•</span>
                            <span>{c.language}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition shrink-0"
                        title="Hapus saluran ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAMBAH CHANNEL MANUAL */}
          {activeTab === 'add-single' && (
            <form onSubmit={handleAddSingleChannel} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Tambah Saluran TV Baru (Link .m3u8)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Channel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Trans7 / GTV / Disney XD"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                  >
                    <option value="Animation">Animation</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Music">Music</option>
                    <option value="News">News</option>
                    <option value="Movies">Movies</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Siaran Langsung (HLS .m3u8) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://domain.com/live/channel.m3u8"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Logo Channel (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://domain.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Saluran siaran animasi anak dan hiburan keluarga..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-navy-800 hover:bg-navy-900 text-white font-medium py-2.5 rounded-lg text-xs transition shadow-xs"
              >
                Simpan Saluran Baru
              </button>
            </form>
          )}

          {/* TAB 4: IMPORT M3U */}
          {activeTab === 'import-m3u' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Impor dari Playlist M3U Online / GitHub</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Masukkan link file .m3u dari GitHub repo atau penyedia siaran lainnya.
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={m3uSource}
                    onChange={(e) => setM3uSource(e.target.value)}
                    placeholder="https://domain.com/playlist.m3u"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-navy-800"
                  />
                  <button
                    onClick={handleImportM3UUrl}
                    disabled={isImporting}
                    className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    {isImporting ? 'Mengimpor...' : 'Tarik Playlist'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Atau Paste Langsung Teks Playlist M3U</h4>
                <textarea
                  rows={4}
                  value={m3uText}
                  onChange={(e) => setM3uText(e.target.value)}
                  placeholder={'#EXTINF:-1 tvg-logo="https://..." group-title="Animation",Kartun TV\nhttps://domain.com/live.m3u8'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono focus:bg-white focus:outline-none focus:border-navy-800"
                ></textarea>
                <button
                  onClick={handleImportM3UText}
                  className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
                >
                  Ekstrak & Simpan Teks M3U
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
