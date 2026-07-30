'use client';

import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Music,
  Repeat,
  Sparkles,
} from 'lucide-react';

interface LiquidGlassAudioPlayerProps {
  audioUrl: string;
  artistName: string;
  trackTitle?: string | null;
  category?: string | null;
  isLight?: boolean;
}

export function LiquidGlassAudioPlayer({
  audioUrl,
  artistName,
  trackTitle,
  category,
  isLight = false,
}: LiquidGlassAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [, setIsHovered] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
    }
  };

  // Skip time (-10s / +10s)
  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Seek audio via timeline click/drag
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Volume slider change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  // Toggle Loop
  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const displayTitle = trackTitle || `${artistName} — Stage Reel Demo Track`;
  const displayCategory = category
    ? category.replace('_', ' ').toUpperCase()
    : 'FEATURED AUDIO DEMO';

  return (
    <div
      className="relative w-full group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowVolumeSlider(false);
      }}
    >
      {/* Real HTML Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Dynamic Ambient Background Glow Mesh */}
      <div
        className={`absolute -inset-2.5 rounded-[38px] blur-3xl transition-opacity duration-1000 pointer-events-none ${
          isPlaying ? 'opacity-90' : 'opacity-40 group-hover:opacity-75'
        }`}
        style={{
          background: isLight
            ? 'radial-gradient(circle at 20% 50%, rgba(124,92,255,0.18), rgba(242,90,43,0.12) 50%, rgba(29,185,84,0.15) 100%)'
            : 'radial-gradient(circle at 20% 50%, rgba(124,92,255,0.35), rgba(242,90,43,0.2) 50%, rgba(29,185,84,0.25) 100%)',
        }}
      />

      {/* Main Liquid Glass Shell */}
      <div
        className={`relative w-full rounded-[30px] p-6 md:p-8 backdrop-blur-3xl border transition-all duration-500 overflow-hidden ${
          isLight
            ? 'bg-white/70 border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.09)]'
            : 'bg-[#0b0c14]/75 border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/20'
        }`}
      >
        {/* Specular Liquid Top Sheen Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Section: Vinyl Artwork + Track Meta + Animated Equalizer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Spinning Liquid Glass Vinyl Record Artwork */}
              <div className="relative shrink-0">
                {/* Concentric Audio Pulse Aura */}
                {isPlaying && (
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#F25A2B]/30 via-[#7C5CFF]/30 to-[#1DB954]/30 animate-ping opacity-50 pointer-events-none" />
                )}

                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border shadow-xl relative flex items-center justify-center transition-transform duration-700 ${
                    isLight
                      ? 'bg-gradient-to-tr from-zinc-200 via-white to-zinc-100 border-black/10'
                      : 'bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 border-white/15'
                  } ${isPlaying ? 'scale-105' : 'scale-100'}`}
                >
                  {/* Outer Grooves */}
                  <div
                    className={`w-full h-full rounded-full border border-dashed flex items-center justify-center relative ${
                      isLight ? 'border-zinc-300' : 'border-white/10'
                    } ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center ${
                        isLight ? 'border-zinc-300 bg-zinc-100' : 'border-white/15 bg-white/5'
                      }`}
                    >
                      {/* Center Label Badge */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F25A2B] via-[#7C5CFF] to-[#1DB954] flex items-center justify-center shadow-md">
                        <Music className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Title & Artist Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase border backdrop-blur-md ${
                      isLight
                        ? 'bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/20'
                        : 'bg-[#7C5CFF]/15 text-[#9d85ff] border-[#7C5CFF]/30'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {displayCategory}
                  </span>

                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" />
                      PLAYING
                    </span>
                  )}
                </div>

                <h3
                  className={`text-base sm:text-lg font-bold tracking-tight truncate ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}
                >
                  {displayTitle}
                </h3>
                <p
                  className={`text-xs font-mono tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/45'
                  }`}
                >
                  {artistName}
                </p>
              </div>
            </div>

            {/* Dynamic Equalizer Visualizer */}
            <div
              className={`flex items-end gap-1.5 h-8 px-4 py-2 rounded-2xl border backdrop-blur-xl shrink-0 ${
                isLight
                  ? 'bg-zinc-100/80 border-black/5'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {[
                { color: '#F25A2B', speed: '0.5s', max: 'h-full', min: 'h-2' },
                { color: '#7C5CFF', speed: '0.8s', max: 'h-4/5', min: 'h-3' },
                { color: '#1DB954', speed: '0.4s', max: 'h-full', min: 'h-1.5' },
                { color: '#D4567A', speed: '0.7s', max: 'h-3/4', min: 'h-2.5' },
                { color: '#6B7CDB', speed: '0.6s', max: 'h-full', min: 'h-2' },
                { color: '#1DB954', speed: '0.9s', max: 'h-4/5', min: 'h-1' },
              ].map((bar, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? `${bar.max} animate-bounce` : `${bar.min}`
                  }`}
                  style={{
                    backgroundColor: bar.color,
                    animationDuration: bar.speed,
                    boxShadow: isPlaying ? `0 0 8px ${bar.color}aa` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Middle Section: Scrubbable Progress Timeline */}
          <div className="space-y-1.5">
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className={`relative w-full h-3 rounded-full cursor-pointer group/bar overflow-hidden backdrop-blur-xl border transition-all duration-300 ${
                isLight
                  ? 'bg-black/5 border-black/5 hover:bg-black/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {/* Progress Fill with Liquid Glow */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#F25A2B] via-[#7C5CFF] to-[#1DB954] rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Glowing Thumb Dot */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-0 group-hover/bar:scale-100 transition-transform duration-200" />
              </div>
            </div>

            {/* Time Stamp Counters */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider">
              <span className={isLight ? 'text-zinc-500' : 'text-white/40'}>
                {formatTime(currentTime)}
              </span>
              <span className={isLight ? 'text-zinc-500' : 'text-white/40'}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Bottom Section: Media Controls & Volume */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Left side: Loop & Volume toggles */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={toggleLoop}
                title="Toggle Repeat"
                className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                  isLooping
                    ? 'bg-[#7C5CFF]/20 text-[#7C5CFF] border-[#7C5CFF]/40 shadow-sm'
                    : isLight
                    ? 'bg-zinc-100 border-black/5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Mute & Volume Popup */}
              <div className="relative">
                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                    isMuted || volume === 0
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : isLight
                      ? 'bg-zinc-100 border-black/5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {/* Hover/Click Volume Slider Popup */}
                {showVolumeSlider && (
                  <div
                    className={`absolute bottom-full left-0 mb-2 p-3 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-center gap-2 z-30 animate-in fade-in zoom-in-95 duration-150 ${
                      isLight
                        ? 'bg-white/90 border-black/10 shadow-black/10 text-zinc-800'
                        : 'bg-[#0f1019]/95 border-white/15 shadow-black/80 text-white'
                    }`}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
                    />
                    <span className="text-[10px] font-mono w-7 text-right">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Main Playback Controls */}
            <div className="flex items-center gap-3">
              {/* Skip Back 10s */}
              <button
                onClick={() => skipTime(-10)}
                title="Rewind 10s"
                className={`p-3 rounded-full border transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
                  isLight
                    ? 'bg-zinc-100 border-black/5 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Main Glowing Play / Pause Orb */}
              <button
                onClick={togglePlay}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F25A2B] via-[#7C5CFF] to-[#1DB954] text-white flex items-center justify-center shadow-[0_0_30px_rgba(124,92,255,0.4)] hover:shadow-[0_0_45px_rgba(124,92,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group/play overflow-hidden"
              >
                {/* Liquid Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/25 to-white/40 opacity-70 pointer-events-none" />

                {isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white relative z-10" />
                ) : (
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-1 relative z-10" />
                )}
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={() => skipTime(10)}
                title="Forward 10s"
                className={`p-3 rounded-full border transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
                  isLight
                    ? 'bg-zinc-100 border-black/5 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right side: Audio Quality Badge */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border uppercase backdrop-blur-md ${
                  isLight
                    ? 'bg-zinc-100 text-zinc-600 border-black/5'
                    : 'bg-white/5 text-white/50 border-white/10'
                }`}
              >
                HD AUDIO 320K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
