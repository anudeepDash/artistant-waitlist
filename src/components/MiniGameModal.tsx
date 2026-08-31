'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Minimal Audio ──
class StackAudio {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  playPlace(pitch: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      // Rising pitch as stack grows — satisfying
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + pitch * 18, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  playPerfect(pitch: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Two-note chime for perfect placement
      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime((400 + pitch * 20) * (1 + i * 0.25), now + i * 0.08);
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.21);
      }
    } catch {}
  }

  playFail() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    } catch {}
  }
}

const audio = new StackAudio();

interface StackBlock {
  x: number;
  y: number;
  width: number;
  placed: boolean;
}

interface FallingPiece {
  x: number;
  y: number;
  width: number;
  vy: number;
  opacity: number;
}

export default function MiniGameModal({ isOpen, onClose }: MiniGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const [lastPerfect, setLastPerfect] = useState(false);

  const animRef = useRef<number | null>(null);
  const gameRef = useRef<{
    blocks: StackBlock[];
    current: { x: number; width: number; dir: number; speed: number } | null;
    falling: FallingPiece[];
    cameraY: number;
    targetCameraY: number;
    score: number;
    perfectStreak: number;
    playing: boolean;
  }>({
    blocks: [],
    current: null,
    falling: [],
    cameraY: 0,
    targetCameraY: 0,
    score: 0,
    perfectStreak: 0,
    playing: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artistant_stack_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  const BLOCK_HEIGHT = 22;
  const PERFECT_THRESHOLD = 4; // pixels of tolerance for "perfect"

  // ── Game Engine ──
  useEffect(() => {
    if (!isOpen) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
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
    const g = gameRef.current;

    const getBlockColor = (index: number): string => {
      // Subtle shifting monochrome with slight warm tint as you go higher
      const base = 18 + Math.min(index * 2, 40);
      const r = base + Math.min(index, 20);
      const gb = base;
      return `rgb(${r}, ${gb}, ${gb})`;
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0A0A0F';
      ctx.fillRect(0, 0, W, H);

      // Smooth camera follow
      g.cameraY += (g.targetCameraY - g.cameraY) * 0.08;

      ctx.save();
      ctx.translate(0, g.cameraY);

      // Draw placed blocks
      for (let i = 0; i < g.blocks.length; i++) {
        const b = g.blocks[i];
        ctx.fillStyle = getBlockColor(i);
        ctx.fillRect(b.x, b.y, b.width, BLOCK_HEIGHT);

        // Subtle top edge highlight
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(b.x, b.y, b.width, 1);
      }

      // Draw & update current sliding block
      if (g.current && g.playing) {
        const c = g.current;
        c.x += c.dir * c.speed;

        // Bounce off edges
        if (c.x + c.width > W) { c.x = W - c.width; c.dir = -1; }
        if (c.x < 0) { c.x = 0; c.dir = 1; }

        const blockY = H - (g.blocks.length + 1) * BLOCK_HEIGHT;
        ctx.fillStyle = getBlockColor(g.blocks.length);
        ctx.fillRect(c.x, blockY, c.width, BLOCK_HEIGHT);

        // Top edge
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(c.x, blockY, c.width, 1);
      }

      // Draw & update falling pieces
      for (let i = g.falling.length - 1; i >= 0; i--) {
        const f = g.falling[i];
        f.y += f.vy;
        f.vy += 0.5;
        f.opacity -= 0.015;

        ctx.globalAlpha = Math.max(0, f.opacity);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(f.x, f.y, f.width, BLOCK_HEIGHT);
        ctx.globalAlpha = 1;

        if (f.opacity <= 0) g.falling.splice(i, 1);
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isOpen, gameState]);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const baseWidth = W * 0.4;
    const baseX = (W - baseWidth) / 2;

    const g = gameRef.current;
    g.blocks = [{ x: baseX, y: H - BLOCK_HEIGHT, width: baseWidth, placed: true }];
    g.current = {
      x: 0,
      width: baseWidth,
      dir: 1,
      speed: 2.5,
    };
    g.falling = [];
    g.cameraY = 0;
    g.targetCameraY = 0;
    g.score = 0;
    g.perfectStreak = 0;
    g.playing = true;

    setScore(0);
    setPerfectStreak(0);
    setLastPerfect(false);
    setGameState('playing');
  };

  const handlePlace = () => {
    if (gameState !== 'playing') {
      startGame();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const g = gameRef.current;
    if (!g.current || !g.playing) return;

    const prev = g.blocks[g.blocks.length - 1];
    const curr = g.current;
    const blockY = H - (g.blocks.length + 1) * BLOCK_HEIGHT;

    // Calculate overlap
    const overlapLeft = Math.max(prev.x, curr.x);
    const overlapRight = Math.min(prev.x + prev.width, curr.x + curr.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      // Complete miss — game over
      g.playing = false;
      audio.playFail();

      // The whole block falls
      g.falling.push({ x: curr.x, y: blockY, width: curr.width, vy: 0, opacity: 1 });

      const finalScore = g.score;
      setHighScore(prev => {
        const next = Math.max(prev, finalScore);
        if (typeof window !== 'undefined') localStorage.setItem('artistant_stack_highscore', next.toString());
        return next;
      });
      setGameState('gameover');
      return;
    }

    // Check for "perfect" placement
    const diff = Math.abs(curr.x - prev.x);
    const isPerfect = diff < PERFECT_THRESHOLD && Math.abs(curr.width - prev.width) < PERFECT_THRESHOLD;

    if (isPerfect) {
      // Snap to perfect alignment and restore width
      g.blocks.push({ x: prev.x, y: blockY, width: prev.width, placed: true });
      g.perfectStreak++;
      setPerfectStreak(g.perfectStreak);
      setLastPerfect(true);
      audio.playPerfect(g.blocks.length);

      // Perfect streak bonus: grow the block slightly
      const bonusWidth = Math.min(prev.width + 4, W * 0.5);
      g.current = {
        x: g.blocks.length % 2 === 0 ? -bonusWidth : W,
        width: bonusWidth,
        dir: g.blocks.length % 2 === 0 ? 1 : -1,
        speed: Math.min(2.5 + g.blocks.length * 0.12, 7),
      };
    } else {
      setLastPerfect(false);
      g.perfectStreak = 0;
      setPerfectStreak(0);

      // Place the overlapping portion
      g.blocks.push({ x: overlapLeft, y: blockY, width: overlapWidth, placed: true });

      // Slice off the overhang as a falling piece
      if (curr.x < prev.x) {
        // Overhang on the left
        g.falling.push({ x: curr.x, y: blockY, width: prev.x - curr.x, vy: 0, opacity: 1 });
      } else if (curr.x + curr.width > prev.x + prev.width) {
        // Overhang on the right
        const sliceX = prev.x + prev.width;
        g.falling.push({ x: sliceX, y: blockY, width: (curr.x + curr.width) - sliceX, vy: 0, opacity: 1 });
      }

      audio.playPlace(g.blocks.length);

      // New sliding block with the same width as what was placed
      g.current = {
        x: g.blocks.length % 2 === 0 ? -overlapWidth : W,
        width: overlapWidth,
        dir: g.blocks.length % 2 === 0 ? 1 : -1,
        speed: Math.min(2.5 + g.blocks.length * 0.12, 7),
      };
    }

    g.score = g.blocks.length - 1; // Don't count the base
    setScore(g.score);

    // Camera: scroll up to keep the action visible
    if (g.blocks.length > Math.floor(H / BLOCK_HEIGHT) - 4) {
      g.targetCameraY = (g.blocks.length - Math.floor(H / BLOCK_HEIGHT) + 5) * BLOCK_HEIGHT;
    }
  };

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handlePlace();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, gameState]);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    audio.enabled = !next;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-2xl select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm bg-[#0A0A0F] border border-white/[0.08] rounded-2xl shadow-2xl text-white"
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                While you wait
              </p>
              <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                Stack
              </h2>
              <p className="text-[13px] text-zinc-500 mb-4">
                Tap to place. Don&apos;t miss.
              </p>
            </div>

            {/* Score bar */}
            <div className="mx-6 flex items-center justify-between px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-4 text-[11px] text-zinc-400">
              <span className="tabular-nums">{score}</span>
              <AnimatePresence>
                {lastPerfect && perfectStreak > 0 && (
                  <motion.span
                    key={perfectStreak}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white font-medium"
                  >
                    Perfect ×{perfectStreak}
                  </motion.span>
                )}
              </AnimatePresence>
              <span>Best: {highScore}</span>
            </div>

            {/* Canvas */}
            <div className="mx-6 mb-4">
              <div
                onPointerDown={(e) => { e.preventDefault(); handlePlace(); }}
                className="relative w-full aspect-[3/4] rounded-xl border border-white/[0.06] bg-[#0A0A0F] overflow-hidden cursor-pointer touch-none"
              >
                <canvas ref={canvasRef} className="w-full h-full block" />

                {/* Idle */}
                {gameState === 'idle' && (
                  <div className="absolute inset-0 bg-[#0A0A0F]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <div className="flex flex-col items-center gap-1 mb-6">
                      <div className="flex flex-col gap-1 items-center">
                        {[48, 44, 40].map((w, i) => (
                          <div key={i} className="h-3 rounded-sm bg-white/[0.08]" style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    </div>

                    <p className="text-[13px] text-zinc-400 mb-5 leading-relaxed">
                      Tap to stack blocks.<br />
                      Line them up perfectly for bonus points.
                    </p>

                    <button
                      type="button"
                      onClick={startGame}
                      className="px-8 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Play
                    </button>
                  </div>
                )}

                {/* Game Over */}
                {gameState === 'gameover' && (
                  <div className="absolute inset-0 bg-[#0A0A0F]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <p className="text-[11px] text-zinc-500 mb-2">Game over</p>

                    <div className="text-4xl font-bold text-white mb-1 tracking-tight tabular-nums">
                      {score}
                    </div>

                    {score === highScore && score > 0 && (
                      <p className="text-[11px] text-white/60 mb-3">New best!</p>
                    )}

                    <p className="text-[11px] text-zinc-500 mb-5">
                      {score >= 30 ? 'Legendary.' : score >= 20 ? 'Incredible.' : score >= 10 ? 'Nice stack.' : 'Keep trying.'}
                    </p>

                    <button
                      type="button"
                      onClick={startGame}
                      className="px-8 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 pb-5 text-[11px] text-zinc-500">
              <span>Tap or press Space</span>
              <button
                type="button"
                onClick={toggleSound}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {soundMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{soundMuted ? 'Muted' : 'Sound'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
