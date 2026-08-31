'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, Activity } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Real-Time Interactive Theremin Synthesizer ──
class WaveSynthesizer {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  private isRunning: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startDrone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain || this.isRunning) return;

    try {
      const now = this.ctx.currentTime;

      // Filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(800, now);

      // Main Oscillator
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sine';
      this.osc.frequency.setValueAtTime(220, now);

      // Sub Oscillator
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'triangle';
      this.subOsc.frequency.setValueAtTime(110, now);

      this.osc.connect(this.filter);
      this.subOsc.connect(this.filter);
      this.filter.connect(this.masterGain);

      this.osc.start(now);
      this.subOsc.start(now);

      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.linearRampToValueAtTime(0.08, now + 0.1);

      this.isRunning = true;
    } catch (e) {}
  }

  updatePitch(normalizedHeight: number) {
    if (!this.enabled || !this.ctx || !this.osc || !this.subOsc || !this.filter || !this.isRunning) return;
    try {
      // Height 0 (bottom) to 1 (top) maps to 130Hz -> 520Hz
      const freq = 140 + normalizedHeight * 360;
      const now = this.ctx.currentTime;
      this.osc.frequency.setTargetAtTime(freq, now, 0.05);
      this.subOsc.frequency.setTargetAtTime(freq / 2, now, 0.05);
      this.filter.frequency.setTargetAtTime(400 + normalizedHeight * 1200, now, 0.05);
    } catch (e) {}
  }

  stopDrone() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      setTimeout(() => {
        if (this.osc) {
          try { this.osc.stop(); this.osc.disconnect(); } catch (e) {}
          this.osc = null;
        }
        if (this.subOsc) {
          try { this.subOsc.stop(); this.subOsc.disconnect(); } catch (e) {}
          this.subOsc = null;
        }
        this.isRunning = false;
      }, 160);
    } catch (e) {}
  }

  playChime(pitchMultiplier: number = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25 * pitchMultiplier, now); // C5
      osc.frequency.setValueAtTime(659.25 * pitchMultiplier, now + 0.05); // E5
      osc.frequency.setValueAtTime(783.99 * pitchMultiplier, now + 0.1); // G5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    } catch (e) {}
  }

  playCrash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.41);
    } catch (e) {}
  }
}

const synth = new WaveSynthesizer();

interface Gate {
  x: number;
  gapY: number; // Center of the gap (0 to H)
  gapHeight: number;
  passed: boolean;
}

interface ResonanceOrb {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function MiniGameModal({ isOpen, onClose }: MiniGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [resonanceCount, setResonanceCount] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  const animationFrameId = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const isHoldingRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);

  // Load High Score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artistant_sine_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Main Canvas Game Engine
  useEffect(() => {
    if (!isOpen) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      synth.stopDrone();
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

    // Player State
    const wave = {
      x: W * 0.22,
      y: H * 0.5,
      vy: 0,
      radius: 6,
      history: [] as Array<{ x: number; y: number }>,
    };

    let gates: Gate[] = [];
    let orbs: ResonanceOrb[] = [];
    let particles: Particle[] = [];
    let speed = 3.6;
    let gateTimer = 0;
    let distance = 0;
    let orbsCollected = 0;
    let cameraShake = 0;

    const gameLoop = () => {
      ctx.save();

      // Camera Shake
      if (cameraShake > 0) {
        const dx = (Math.random() - 0.5) * cameraShake;
        const dy = (Math.random() - 0.5) * cameraShake;
        ctx.translate(dx, dy);
        cameraShake *= 0.85;
        if (cameraShake < 0.5) cameraShake = 0;
      }

      ctx.clearRect(0, 0, W, H);

      // 1. Deep Obsidian Space with Ambient Radial Vignette
      ctx.fillStyle = '#07070B';
      ctx.fillRect(0, 0, W, H);

      // Background Frequency Spectrum Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      if (isPlayingRef.current) {
        // Physics update
        const thrust = -0.42;
        const gravity = 0.34;

        if (isHoldingRef.current) {
          wave.vy += thrust;
        } else {
          wave.vy += gravity;
        }

        // Terminal Velocity & Friction
        wave.vy = Math.max(-5.5, Math.min(5.5, wave.vy * 0.98));
        wave.y += wave.vy;

        // Sound modulation
        const normHeight = 1 - Math.max(0, Math.min(1, wave.y / H));
        synth.updatePitch(normHeight);

        // Bounds Check (Ceiling & Floor)
        if (wave.y < 8 || wave.y > H - 8) {
          // Crash!
          endGame();
        }

        // Score update
        distance += 1;
        if (distance % 3 === 0) {
          scoreRef.current = distance + orbsCollected * 50;
          setScore(scoreRef.current);
        }
        speed = 3.6 + Math.min(4.5, distance / 500);

        // Record history for smooth wave ribbon
        wave.history.unshift({ x: wave.x, y: wave.y });
        if (wave.history.length > 38) {
          wave.history.pop();
        }

        // Spawn Frequency Gates
        gateTimer++;
        if (gateTimer > Math.max(65, 125 - distance / 25)) {
          gateTimer = 0;
          const gapHeight = Math.max(65, 105 - distance / 40);
          const gapY = 40 + Math.random() * (H - 80);
          gates.push({
            x: W + 30,
            gapY,
            gapHeight,
            passed: false,
          });

          // Spawn a resonance orb inside gate gap
          if (Math.random() > 0.4) {
            orbs.push({
              x: W + 30,
              y: gapY,
              radius: 7,
              collected: false,
            });
          }
        }
      }

      // 2. Draw & Update Gates (Architectural Frequency Bars)
      for (let g = gates.length - 1; g >= 0; g--) {
        const gate = gates[g];
        if (isPlayingRef.current) gate.x -= speed;

        const barWidth = 14;
        const topBarHeight = gate.gapY - gate.gapHeight / 2;
        const bottomBarY = gate.gapY + gate.gapHeight / 2;
        const bottomBarHeight = H - bottomBarY;

        // Neon Top & Bottom Bars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = 'rgba(242, 90, 43, 0.6)';
        ctx.lineWidth = 1.5;

        // Top Obstacle Bar
        if (topBarHeight > 0) {
          ctx.beginPath();
          ctx.roundRect(gate.x - barWidth / 2, 0, barWidth, topBarHeight, [0, 0, 8, 8]);
          ctx.fill();
          ctx.stroke();
        }

        // Bottom Obstacle Bar
        if (bottomBarHeight > 0) {
          ctx.beginPath();
          ctx.roundRect(gate.x - barWidth / 2, bottomBarY, barWidth, bottomBarHeight, [8, 8, 0, 0]);
          ctx.fill();
          ctx.stroke();
        }

        // Gate Portal Halo in the Gap
        ctx.strokeStyle = 'rgba(124, 92, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(gate.x - barWidth / 2 - 2, gate.gapY - gate.gapHeight / 2, barWidth + 4, gate.gapHeight);

        // Check Collision
        if (
          isPlayingRef.current &&
          wave.x + wave.radius > gate.x - barWidth / 2 &&
          wave.x - wave.radius < gate.x + barWidth / 2
        ) {
          if (wave.y - wave.radius < topBarHeight || wave.y + wave.radius > bottomBarY) {
            endGame();
          } else if (!gate.passed) {
            gate.passed = true;
            synth.playChime(1.1);

            // Gate pass burst
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: gate.x,
                y: wave.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 4,
                life: 20,
                maxLife: 20,
                color: '#7C5CFF',
                size: Math.random() * 3 + 1,
              });
            }
          }
        }

        if (gate.x < -30) gates.splice(g, 1);
      }

      // 3. Draw & Update Resonance Orbs
      for (let o = orbs.length - 1; o >= 0; o--) {
        const orb = orbs[o];
        if (isPlayingRef.current) orb.x -= speed;

        if (!orb.collected) {
          // Glowing Orb
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#06B6D4';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Pickup Detection
          const dist = Math.hypot(wave.x - orb.x, wave.y - orb.y);
          if (isPlayingRef.current && dist < wave.radius + orb.radius + 4) {
            orb.collected = true;
            orbsCollected++;
            setResonanceCount(orbsCollected);
            synth.playChime(1.5);

            for (let k = 0; k < 12; k++) {
              particles.push({
                x: orb.x,
                y: orb.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 22,
                maxLife: 22,
                color: '#06B6D4',
                size: Math.random() * 3 + 1.5,
              });
            }
          }
        }

        if (orb.x < -20) orbs.splice(o, 1);
      }

      // 4. Draw Glowing Sine Wave Ribbon Trail
      if (wave.history.length > 2) {
        ctx.shadowColor = '#F25A2B';
        ctx.shadowBlur = 14;

        // Gradient Stroke
        const ribbonGrad = ctx.createLinearGradient(wave.x - 120, 0, wave.x, 0);
        ribbonGrad.addColorStop(0, 'rgba(124, 92, 255, 0)');
        ribbonGrad.addColorStop(0.5, 'rgba(212, 86, 122, 0.7)');
        ribbonGrad.addColorStop(1, '#F25A2B');

        ctx.strokeStyle = ribbonGrad;
        ctx.lineWidth = 3.5;
        ctx.beginPath();

        for (let i = 0; i < wave.history.length; i++) {
          const pt = wave.history[i];
          const px = wave.x - i * (speed * 0.92);
          if (i === 0) ctx.moveTo(px, pt.y);
          else ctx.lineTo(px, pt.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 5. Draw Particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (pt.life <= 0) particles.splice(p, 1);
      }

      // 6. Draw Player (Electric Frequency Core)
      if (gameState !== 'gameover' || isPlayingRef.current) {
        // Outer Pulsing Glow
        ctx.shadowColor = '#F25A2B';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#F25A2B';
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius + (isHoldingRef.current ? 2 : 0), 0, Math.PI * 2);
        ctx.fill();

        // White Hot Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const endGame = () => {
      isPlayingRef.current = false;
      setGameState('gameover');
      synth.stopDrone();
      synth.playCrash();
      cameraShake = 14;

      const finalScore = scoreRef.current;
      setHighScore((prev) => {
        const next = Math.max(prev, finalScore);
        if (typeof window !== 'undefined') {
          localStorage.setItem('artistant_sine_highscore', next.toString());
        }
        return next;
      });

      // Death explosion
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: wave.x,
          y: wave.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 30,
          maxLife: 30,
          color: i % 2 === 0 ? '#F25A2B' : '#7C5CFF',
          size: Math.random() * 4 + 2,
        });
      }
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      synth.stopDrone();
    };
  }, [isOpen, gameState]);

  // Holding input mechanics
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (gameState === 'idle' || gameState === 'gameover') {
      startGame();
    } else {
      isHoldingRef.current = true;
      setIsHolding(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    isHoldingRef.current = false;
    setIsHolding(false);
  };

  // Keyboard Spacebar Hold Mechanics
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        } else {
          isHoldingRef.current = true;
          setIsHolding(true);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        isHoldingRef.current = false;
        setIsHolding(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen, gameState]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setResonanceCount(0);
    isPlayingRef.current = true;
    isHoldingRef.current = true;
    setIsHolding(true);
    setGameState('playing');
    synth.startDrone();
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    synth.enabled = !next;
    if (next) synth.stopDrone();
    else if (isPlayingRef.current) synth.startDrone();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl rounded-3xl bg-[#09090E] border border-white/15 p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-white overflow-hidden flex flex-col"
          >
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#F25A2B] animate-pulse" />
                <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                  <span>FREQUENCY</span>
                  <span className="text-[9px] font-mono text-zinc-500">KINETIC SURFER</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title={soundMuted ? 'Unmute Synth' : 'Mute Synth'}
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

            {/* Score & HUD */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl mb-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">SCORE:</span>
                <span className="font-bold text-white tracking-wider">{score}</span>
              </div>

              <div className="flex items-center gap-1 text-[#06B6D4] font-semibold">
                <span>◆ {resonanceCount}</span>
              </div>

              <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>HI: {highScore}</span>
              </div>
            </div>

            {/* Kinetic Canvas Screen */}
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              className="relative w-full h-72 sm:h-80 rounded-2xl border border-white/10 bg-[#07070B] overflow-hidden shadow-inner cursor-pointer touch-none"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Start Screen Overlay */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center mb-3 shadow-lg">
                    <Activity className="w-6 h-6 text-[#F25A2B]" />
                  </div>

                  <h4 className="font-display text-lg sm:text-xl font-bold text-white mb-1">
                    Surf The Soundwave
                  </h4>

                  <p className="text-xs text-zinc-400 max-w-xs mb-5 leading-relaxed">
                    <strong className="text-white">Hold</strong> to pitch up, <strong className="text-white">Release</strong> to dive down. Stream through frequency gates and synthesize live music.
                  </p>

                  <button
                    type="button"
                    onClick={startGame}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(242,90,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch Wave</span>
                  </button>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/25 mb-2">
                    Wave Clipped
                  </span>

                  <div className="text-3xl sm:text-4xl font-display font-black text-white mb-1">
                    {score} <span className="text-xs font-mono text-zinc-500 font-normal">PTS</span>
                  </div>

                  <p className="text-xs font-mono text-zinc-400 mb-5">
                    Resonance Orbs: <span className="text-[#06B6D4] font-bold">{resonanceCount}</span>
                  </p>

                  <button
                    type="button"
                    onClick={startGame}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(242,90,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Surf Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer Control Indicator */}
            <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-zinc-500">
              <span>Hold Screen / Spacebar to Fly Up</span>
              <span className="text-zinc-400">Release to Dive Down</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
