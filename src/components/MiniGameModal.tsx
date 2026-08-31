'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Volume2, VolumeX, Trophy, Zap, Radio, Sliders, Music } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Web Audio API Pentatonic Synthesizer Engine ──
class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pentatonic musical frequencies (C minor: C4, Eb4, F4, G4, Bb4, C5)
  private readonly NOTES = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25];

  playHit(lane: number, isPerfect: boolean) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freq = this.NOTES[(lane * 2 + (isPerfect ? 1 : 0)) % this.NOTES.length];

      // Primary synth oscillator (warm triangle wave)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isPerfect ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Filter for analog synth warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isPerfect ? 3200 : 2000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.28);

      // Envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(isPerfect ? 0.25 : 0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);

      // If perfect, add a sub-harmonic layer
      if (isPerfect) {
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(freq / 2, now);
        subGain.gain.setValueAtTime(0.12, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.28);
      }
    } catch (e) {}
  }

  playMiss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(65, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }
}

const audio = new StudioAudioEngine();

interface Note {
  id: number;
  lane: number; // 0, 1, 2
  y: number; // 0% to 100%
  speed: number;
  color: string;
  hit: boolean;
  missed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export default function MiniGameModal({ isOpen, onClose }: MiniGameModalProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [activeLaneIndex, setActiveLaneIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; color: string; key: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const notesRef = useRef<Note[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  const LANE_COLORS = ['#F25A2B', '#D4567A', '#7C5CFF'];
  const LANE_KEYS = ['A', 'S', 'D'];

  // Load High Score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artistant_rhythm_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Lane Hit Trigger
  const triggerLaneHit = useCallback((laneIndex: number) => {
    if (!isPlayingRef.current) return;

    setActiveLaneIndex(laneIndex);
    setTimeout(() => setActiveLaneIndex(null), 120);

    const hitZoneY = 82; // Hit bar is at 82% height
    const threshold = 9.5; // Window of hit in percentage

    let closestNote: Note | null = null;
    let minDistance = Infinity;

    for (const note of notesRef.current) {
      if (note.lane === laneIndex && !note.hit && !note.missed) {
        const dist = Math.abs(note.y - hitZoneY);
        if (dist < minDistance && dist < threshold) {
          minDistance = dist;
          closestNote = note;
        }
      }
    }

    if (closestNote) {
      closestNote.hit = true;
      const isPerfect = minDistance < 4.2;
      const points = isPerfect ? 150 : 80;

      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current;
        setMaxCombo(maxComboRef.current);
      }
      setCombo(comboRef.current);

      const multiplier = comboRef.current >= 15 ? 3 : comboRef.current >= 8 ? 2 : 1;
      scoreRef.current += points * multiplier;
      setScore(scoreRef.current);

      audio.playHit(laneIndex, isPerfect);

      // Visual feedback
      setFeedback({
        text: isPerfect ? 'PERFECT' : 'GREAT',
        color: isPerfect ? '#F25A2B' : '#7C5CFF',
        key: Date.now(),
      });

      // Spawn burst particles on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const laneW = canvas.width / 3;
        const hitX = laneIndex * laneW + laneW / 2;
        const hitY = (hitZoneY / 100) * canvas.height;

        for (let i = 0; i < (isPerfect ? 16 : 8); i++) {
          particlesRef.current.push({
            x: hitX,
            y: hitY,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 6 - 2,
            life: 22,
            color: LANE_COLORS[laneIndex],
            size: Math.random() * 3.5 + 1.5,
          });
        }
      }
    } else {
      // Miss penalty on bad timing
      comboRef.current = 0;
      setCombo(0);
      audio.playMiss();
      setFeedback({ text: 'MISS', color: '#EF4444', key: Date.now() });
    }
  }, []);

  // Keyboard controls (A, S, D or Left, Down, Right or 1, 2, 3)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === 'a' || key === 'arrowleft' || key === '1') {
        e.preventDefault();
        triggerLaneHit(0);
      } else if (key === 's' || key === 'arrowdown' || key === ' ' || key === '2') {
        e.preventDefault();
        triggerLaneHit(1);
      } else if (key === 'd' || key === 'arrowright' || key === '3') {
        e.preventDefault();
        triggerLaneHit(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, triggerLaneHit]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (!isOpen) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const laneW = W / 3;
    const hitZoneY = H * 0.82;

    let noteIdCounter = 0;
    let missedCount = 0;
    const MAX_MISSES = 5;

    const gameLoop = (timestamp: number) => {
      ctx.clearRect(0, 0, W, H);

      // 1. Draw Obsidian Studio Backdrop
      ctx.fillStyle = '#08080C';
      ctx.fillRect(0, 0, W, H);

      // 2. Draw 3 Precision Lanes
      for (let i = 0; i < 3; i++) {
        const laneX = i * laneW;

        // Lane divider lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, H);
        ctx.stroke();

        // Active lane flash highlight
        if (activeLaneIndex === i) {
          const flashGrad = ctx.createLinearGradient(0, 0, 0, H);
          flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          flashGrad.addColorStop(0.8, LANE_COLORS[i] + '33');
          flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = flashGrad;
          ctx.fillRect(laneX, 0, laneW, H);
        }
      }

      // 3. Draw Neon Hit Target Zone
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, hitZoneY);
      ctx.lineTo(W, hitZoneY);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const targetX = i * laneW + laneW / 2;
        ctx.strokeStyle = activeLaneIndex === i ? LANE_COLORS[i] : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetX, hitZoneY, 14, 0, Math.PI * 2);
        ctx.stroke();

        if (activeLaneIndex === i) {
          ctx.fillStyle = LANE_COLORS[i] + '44';
          ctx.beginPath();
          ctx.arc(targetX, hitZoneY, 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Update Game State & Spawning
      if (isPlayingRef.current) {
        // Spawn notes at tempo
        if (timestamp - lastSpawnRef.current > 420 - Math.min(180, scoreRef.current / 40)) {
          lastSpawnRef.current = timestamp;
          const lane = Math.floor(Math.random() * 3);
          notesRef.current.push({
            id: noteIdCounter++,
            lane,
            y: 0,
            speed: 0.85 + Math.min(0.6, scoreRef.current / 3000),
            color: LANE_COLORS[lane],
            hit: false,
            missed: false,
          });
        }

        // Move notes
        for (let i = notesRef.current.length - 1; i >= 0; i--) {
          const note = notesRef.current[i];
          note.y += note.speed;

          // Check if missed below hit zone
          if (note.y > 92 && !note.hit && !note.missed) {
            note.missed = true;
            comboRef.current = 0;
            setCombo(0);
            missedCount++;

            if (missedCount >= MAX_MISSES) {
              // Game Over
              isPlayingRef.current = false;
              setGameState('gameover');

              const finalScore = scoreRef.current;
              if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('artistant_rhythm_highscore');
                const currHi = saved ? parseInt(saved, 10) : 0;
                if (finalScore > currHi) {
                  localStorage.setItem('artistant_rhythm_highscore', finalScore.toString());
                  setHighScore(finalScore);
                }
              }
            }
          }

          if (note.y > 105 || note.hit) {
            notesRef.current.splice(i, 1);
          }
        }
      }

      // 5. Draw Falling Notes (Precision Neon Glow Capsules)
      for (const note of notesRef.current) {
        if (note.hit) continue;

        const noteX = note.lane * laneW + laneW / 2;
        const noteY = (note.y / 100) * H;

        // Glowing outer halo
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = note.color;

        // Capsule Body
        const noteWidth = Math.min(laneW * 0.65, 52);
        const noteHeight = 14;
        ctx.beginPath();
        ctx.roundRect(noteX - noteWidth / 2, noteY - noteHeight / 2, noteWidth, noteHeight, 7);
        ctx.fill();

        // White core reflection
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(noteX - noteWidth / 4, noteY - 2, noteWidth / 2, 4, 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      // 6. Draw Particles
      for (let p = particlesRef.current.length - 1; p >= 0; p--) {
        const pt = particlesRef.current[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / 22);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (pt.life <= 0) particlesRef.current.splice(p, 1);
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isOpen, activeLaneIndex]);

  // Start / Restart Game
  const startGame = () => {
    notesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setFeedback(null);
    isPlayingRef.current = true;
    setGameState('playing');
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    audio.enabled = !next;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg rounded-3xl bg-[#09090E] border border-white/15 p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-white overflow-hidden flex flex-col"
          >
            {/* Header: Studio Telemetry */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-[#F25A2B] animate-pulse" />
                <div>
                  <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                    <span>BEAT COOKER</span>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-[#7C5CFF] bg-[#7C5CFF]/15 px-2 py-0.5 rounded-full border border-[#7C5CFF]/30">
                      128 BPM
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title={soundMuted ? 'Unmute Synthesizer' : 'Mute Synthesizer'}
                >
                  {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Score & Combo HUD */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl mb-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 uppercase">SCORE:</span>
                <span className="font-bold text-white tracking-wider">{score}</span>
              </div>

              {combo > 1 && (
                <div className="flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] font-black uppercase tracking-wider animate-pulse">
                  <span>{combo}X COMBO</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>HI: {highScore}</span>
              </div>
            </div>

            {/* Rhythm Canvas Arena */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl border border-white/10 bg-[#08080C] overflow-hidden shadow-inner flex flex-col justify-end">
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Floating Timing Feedback (PERFECT / GREAT / MISS) */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    key={feedback.key}
                    initial={{ opacity: 0, scale: 0.6, y: 0 }}
                    animate={{ opacity: 1, scale: 1.1, y: -20 }}
                    exit={{ opacity: 0, scale: 0.8, y: -35 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono font-black text-lg sm:text-xl tracking-widest px-3 py-1 rounded-full backdrop-blur-md"
                    style={{ color: feedback.color, textShadow: `0 0 16px ${feedback.color}` }}
                  >
                    {feedback.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start Screen Overlay */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center mb-3 shadow-lg">
                    <Music className="w-6 h-6 text-[#F25A2B]" />
                  </div>
                  
                  <h4 className="font-display text-lg sm:text-xl font-bold text-white mb-1.5">
                    Drop The Beat
                  </h4>
                  
                  <p className="text-xs text-zinc-400 max-w-xs mb-5 leading-relaxed">
                    Hit the falling neon notes when they cross the trigger zone. Every successful beat synthesizes real music.
                  </p>

                  <button
                    type="button"
                    onClick={startGame}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(242,90,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Session</span>
                  </button>
                </div>
              )}

              {/* Game Over Screen Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 bg-white/10 px-3 py-1 rounded-full mb-2">
                    Session Complete
                  </span>
                  
                  <div className="text-3xl sm:text-4xl font-display font-black text-white mb-1">
                    {score} <span className="text-xs font-mono text-zinc-500 font-normal">PTS</span>
                  </div>

                  <p className="text-xs font-mono text-zinc-400 mb-5">
                    Max Combo: <span className="text-white font-bold">{maxCombo}x</span>
                  </p>

                  <button
                    type="button"
                    onClick={startGame}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(242,90,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cook Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3 Mobile & Desktop Touch / Keyboard Pads */}
            <div className="grid grid-cols-3 gap-2.5 pt-3">
              {[0, 1, 2].map((laneIndex) => (
                <button
                  key={laneIndex}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    triggerLaneHit(laneIndex);
                  }}
                  className={`relative py-3.5 sm:py-4 rounded-xl border transition-all duration-100 flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 touch-none ${
                    activeLaneIndex === laneIndex
                      ? 'bg-white/15 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mb-1"
                    style={{ backgroundColor: LANE_COLORS[laneIndex] }}
                  />
                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-200">
                    {LANE_KEYS[laneIndex]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2.5 text-[10px] font-mono text-zinc-500">
              <span>Keys: [A] [S] [D] or [◀] [▼] [▶]</span>
              <span>Tap pads on mobile</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
