'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Theremin Synthesizer (Web Audio) ──
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
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(800, now);

      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sine';
      this.osc.frequency.setValueAtTime(220, now);

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
        if (this.osc) { try { this.osc.stop(); this.osc.disconnect(); } catch (e) {} this.osc = null; }
        if (this.subOsc) { try { this.subOsc.stop(); this.subOsc.disconnect(); } catch (e) {} this.subOsc = null; }
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
      osc.frequency.setValueAtTime(523.25 * pitchMultiplier, now);
      osc.frequency.setValueAtTime(659.25 * pitchMultiplier, now + 0.05);
      osc.frequency.setValueAtTime(783.99 * pitchMultiplier, now + 0.1);
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

interface Gate { x: number; gapY: number; gapHeight: number; passed: boolean; }
interface Orb { x: number; y: number; radius: number; collected: boolean; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }

export default function MiniGameModal({ isOpen, onClose }: MiniGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [orbCount, setOrbCount] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);

  const animationFrameId = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const isHoldingRef = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artistant_sine_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // ── Canvas Game Engine ──
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

    const wave = { x: W * 0.22, y: H * 0.5, vy: 0, radius: 5, history: [] as { x: number; y: number }[] };

    let gates: Gate[] = [];
    let orbs: Orb[] = [];
    let particles: Particle[] = [];
    let speed = 3.6;
    let gateTimer = 0;
    let distance = 0;
    let orbsCollected = 0;
    let cameraShake = 0;

    const gameLoop = () => {
      ctx.save();

      if (cameraShake > 0) {
        ctx.translate((Math.random() - 0.5) * cameraShake, (Math.random() - 0.5) * cameraShake);
        cameraShake *= 0.85;
        if (cameraShake < 0.5) cameraShake = 0;
      }

      // Background
      ctx.fillStyle = '#0A0A0F';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      if (isPlayingRef.current) {
        if (isHoldingRef.current) wave.vy += -0.42;
        else wave.vy += 0.34;

        wave.vy = Math.max(-5.5, Math.min(5.5, wave.vy * 0.98));
        wave.y += wave.vy;

        synth.updatePitch(1 - Math.max(0, Math.min(1, wave.y / H)));

        if (wave.y < 8 || wave.y > H - 8) endGame();

        distance += 1;
        if (distance % 3 === 0) {
          scoreRef.current = distance + orbsCollected * 50;
          setScore(scoreRef.current);
        }
        speed = 3.6 + Math.min(4.5, distance / 500);

        wave.history.unshift({ x: wave.x, y: wave.y });
        if (wave.history.length > 38) wave.history.pop();

        gateTimer++;
        if (gateTimer > Math.max(65, 125 - distance / 25)) {
          gateTimer = 0;
          const gapHeight = Math.max(65, 105 - distance / 40);
          const gapY = 40 + Math.random() * (H - 80);
          gates.push({ x: W + 30, gapY, gapHeight, passed: false });
          if (Math.random() > 0.4) orbs.push({ x: W + 30, y: gapY, radius: 6, collected: false });
        }
      }

      // Gates
      for (let g = gates.length - 1; g >= 0; g--) {
        const gate = gates[g];
        if (isPlayingRef.current) gate.x -= speed;

        const bw = 3;
        const topH = gate.gapY - gate.gapHeight / 2;
        const botY = gate.gapY + gate.gapHeight / 2;

        // Thin elegant bars
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        if (topH > 0) { ctx.fillRect(gate.x - bw / 2, 0, bw, topH); }
        if (H - botY > 0) { ctx.fillRect(gate.x - bw / 2, botY, bw, H - botY); }

        // Cap lines at gap edges
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(gate.x - 8, topH - 1, 16, 1);
        ctx.fillRect(gate.x - 8, botY, 16, 1);

        // Collision
        if (isPlayingRef.current && wave.x + wave.radius > gate.x - 6 && wave.x - wave.radius < gate.x + 6) {
          if (wave.y - wave.radius < topH || wave.y + wave.radius > botY) {
            endGame();
          } else if (!gate.passed) {
            gate.passed = true;
            synth.playChime(1.1);
            for (let i = 0; i < 6; i++) {
              particles.push({ x: gate.x, y: wave.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 3, life: 18, maxLife: 18, color: 'rgba(255,255,255,0.6)', size: 1.5 });
            }
          }
        }
        if (gate.x < -30) gates.splice(g, 1);
      }

      // Orbs
      for (let o = orbs.length - 1; o >= 0; o--) {
        const orb = orbs[o];
        if (isPlayingRef.current) orb.x -= speed;

        if (!orb.collected) {
          // Simple clean orb — white ring
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Dot center
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, 2, 0, Math.PI * 2);
          ctx.fill();

          const dist = Math.hypot(wave.x - orb.x, wave.y - orb.y);
          if (isPlayingRef.current && dist < wave.radius + orb.radius + 4) {
            orb.collected = true;
            orbsCollected++;
            setOrbCount(orbsCollected);
            synth.playChime(1.5);
            for (let k = 0; k < 8; k++) {
              particles.push({ x: orb.x, y: orb.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 20, maxLife: 20, color: 'rgba(255,255,255,0.7)', size: 1.5 });
            }
          }
        }
        if (orb.x < -20) orbs.splice(o, 1);
      }

      // Wave ribbon trail
      if (wave.history.length > 2) {
        const grad = ctx.createLinearGradient(wave.x - 120, 0, wave.x, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(255,255,255,0.4)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < wave.history.length; i++) {
          const pt = wave.history[i];
          const px = wave.x - i * (speed * 0.92);
          if (i === 0) ctx.moveTo(px, pt.y);
          else ctx.lineTo(px, pt.y);
        }
        ctx.stroke();
      }

      // Particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx; pt.y += pt.vy; pt.life--;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
        if (pt.life <= 0) particles.splice(p, 1);
      }

      // Player dot
      if (gameState !== 'gameover' || isPlayingRef.current) {
        const r = wave.radius + (isHoldingRef.current ? 1.5 : 0);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, r * 0.6, 0, Math.PI * 2);
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
      cameraShake = 12;

      const finalScore = scoreRef.current;
      setHighScore((prev) => {
        const next = Math.max(prev, finalScore);
        if (typeof window !== 'undefined') localStorage.setItem('artistant_sine_highscore', next.toString());
        return next;
      });

      for (let i = 0; i < 20; i++) {
        particles.push({
          x: wave.x, y: wave.y,
          vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
          life: 25, maxLife: 25,
          color: 'rgba(255,255,255,0.6)',
          size: Math.random() * 3 + 1,
        });
      }
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      synth.stopDrone();
    };
  }, [isOpen, gameState]);

  // Input handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (gameState === 'idle' || gameState === 'gameover') startGame();
    else { isHoldingRef.current = true; }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    isHoldingRef.current = false;
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') startGame();
        else isHoldingRef.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        isHoldingRef.current = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [isOpen, gameState]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setOrbCount(0);
    isPlayingRef.current = true;
    isHoldingRef.current = true;
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
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-2xl select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#0A0A0F] border border-white/[0.08] rounded-2xl shadow-2xl text-white"
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
            <div className="px-6 pt-6 sm:px-8 sm:pt-8">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">
                While you wait
              </p>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mb-1.5">
                Sine Wave Surfer
              </h2>

              <p className="text-[13px] text-zinc-500 leading-relaxed mb-5">
                Hold to rise, release to fall. Navigate through the gates.
              </p>
            </div>

            {/* Score bar */}
            <div className="mx-6 sm:mx-8 flex items-center justify-between px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-4 text-[11px] text-zinc-400">
              <span>{score}</span>
              <span>◆ {orbCount}</span>
              <span>Best: {highScore}</span>
            </div>

            {/* Canvas */}
            <div className="mx-6 sm:mx-8 mb-5">
              <div
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                className="relative w-full aspect-[16/9] rounded-xl border border-white/[0.06] bg-[#0A0A0F] overflow-hidden cursor-pointer touch-none"
              >
                <canvas ref={canvasRef} className="w-full h-full block" />

                {/* Idle */}
                {gameState === 'idle' && (
                  <div className="absolute inset-0 bg-[#0A0A0F]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <p className="text-[13px] text-zinc-400 mb-5 max-w-xs leading-relaxed">
                      <span className="text-white font-medium">Hold</span> to pitch up.{' '}
                      <span className="text-white font-medium">Release</span> to dive.
                      <br />Collect orbs. Avoid walls.
                    </p>

                    <button
                      type="button"
                      onClick={startGame}
                      className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Play</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Game Over */}
                {gameState === 'gameover' && (
                  <div className="absolute inset-0 bg-[#0A0A0F]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <p className="text-[11px] text-zinc-500 mb-2">Game over</p>

                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">
                      {score}
                    </div>

                    <p className="text-[11px] text-zinc-500 mb-5">
                      {orbCount} orbs collected
                    </p>

                    <button
                      type="button"
                      onClick={startGame}
                      className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try again</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 pb-5 sm:px-8 sm:pb-6 text-[11px] text-zinc-500">
              <span>Spacebar or tap to fly</span>
              <button
                type="button"
                onClick={toggleSound}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {soundMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{soundMuted ? 'Unmuted' : 'Sound on'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
