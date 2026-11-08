import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  ExternalLink, 
  Tv, 
  Radio, 
  AlertTriangle,
  ChevronRight,
  List,
  Star,
  Info
} from 'lucide-react';

export default function VideoPlayer({ 
  channel, 
  onBack, 
  allChannels, 
  onSelectChannel,
  isFavorite,
  onToggleFavorite
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showChannelList, setShowChannelList] = useState(false);

  // Initialize and load HLS stream whenever channel changes
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    setIsLoading(true);
    setErrorMsg('');
    setIsPlaying(false);

    const video = videoRef.current;

    // Destroy previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Auto-play might be blocked by browser without user gesture or mute
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS stream notice/error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg('Koneksi siaran terputus atau dibatasi oleh kebijakan CORS penyedia siaran.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMsg('Terjadi kesalahan decode media siaran. Mencoba memulihkan...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('Tidak dapat memuat siaran langsung ini. Siaran mungkin sedang offline.');
              hls.destroy();
              break;
          }
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setErrorMsg('Gagal memutar siaran langsung.');
      });
    } else {
      setIsLoading(false);
      setErrorMsg('Browser Anda tidak mendukung pemutar HLS.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Video Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const handleRetry = () => {
    if (!channel || !videoRef.current) return;
    setIsLoading(true);
    setErrorMsg('');
    const video = videoRef.current;
    if (hlsRef.current) {
      hlsRef.current.loadSource(channel.streamUrl);
      hlsRef.current.attachMedia(video);
    } else {
      video.src = channel.streamUrl;
      video.load();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-950 text-white flex flex-col">
      {/* Top Bar Navigation */}
      <div className="bg-navy-900 border-b border-navy-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white text-xs font-medium border border-navy-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Daftar Channel</span>
          </button>

          <div className="flex items-center gap-2 border-l border-navy-700 pl-3">
            <span className="font-semibold text-sm text-slate-100">{channel.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {channel.category}
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-600/20 text-red-400 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              LIVE
            </span>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(channel.id)}
                className={`p-1.5 rounded-lg text-xs transition ml-1 ${
                  isFavorite 
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                    : 'bg-navy-800 text-slate-400 hover:text-white'
                }`}
                title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Channel Drawer Toggle */}
        <button
          onClick={() => setShowChannelList(!showChannelList)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            showChannelList 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-navy-800 hover:bg-navy-700 border-navy-700 text-slate-300'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Ganti Channel</span>
        </button>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Video Canvas Container */}
        <div 
          ref={containerRef} 
          className="flex-1 bg-black flex items-center justify-center relative select-none group min-h-[400px] lg:min-h-0"
        >
          <video
            ref={videoRef}
            onClick={togglePlay}
            playsInline
            className="w-full h-full max-h-[82vh] object-contain cursor-pointer"
          />

          {/* Loading Spinner */}
          {isLoading && !errorMsg && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mb-3"></div>
              <p className="text-xs text-slate-300">Menghubungkan ke siaran langsung {channel.name}...</p>
            </div>
          )}

          {/* Error Message & Recovery Box */}
          {errorMsg && (
            <div className="absolute inset-0 bg-navy-950/90 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Siaran Tidak Dapat Dimuat</h3>
              <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                {errorMsg}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Muat Ulang</span>
                </button>
                <a
                  href={channel.streamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-medium border border-navy-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka URL Langsung</span>
                </a>
              </div>
            </div>
          )}

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  title={isPlaying ? 'Jeda' : 'Putar'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-slate-300 hover:text-white"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-24 accent-blue-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-300 hidden sm:inline-block">
                  Live Stream HLS
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-slate-200 hover:text-white"
                  title="Layar Penuh"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Side Channel Switcher (like Jellyfin / TV Guide) */}
        {showChannelList && (
          <div className="w-full lg:w-80 bg-navy-900 border-t lg:border-t-0 lg:border-l border-navy-800 flex flex-col max-h-[50vh] lg:max-h-none overflow-y-auto">
            <div className="p-3 bg-navy-950 border-b border-navy-800 sticky top-0 z-10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Saluran Lainnya</span>
              <span className="text-[10px] text-slate-400">{allChannels.length} channel</span>
            </div>

            <div className="divide-y divide-navy-800/60 p-1">
              {allChannels.map((c) => {
                const isActive = c.id === channel.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectChannel(c)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition ${
                      isActive 
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300' 
                        : 'hover:bg-navy-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-navy-950 flex items-center justify-center shrink-0 border border-navy-800 overflow-hidden">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Tv className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{c.category}</p>
                    </div>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Channel Info & Description Footer */}
      <div className="bg-navy-900 border-t border-navy-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-300">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{channel.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/40">
              {channel.language} • {channel.country}
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {channel.description || 'Saluran siaran langsung terverifikasi aktif.'}
          </p>
        </div>
      </div>
    </div>
  );
}

