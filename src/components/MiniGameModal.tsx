'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Volume2, VolumeX, Trophy, Zap, Sparkles } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Web Audio Synth Engine ──
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump(isDouble: boolean = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const baseFreq = isDouble ? 380 : 260;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  playGem() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playGameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  }
}

const sfx = new SoundEngine();

export default function MiniGameModal({ isOpen, onClose }: MiniGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gemsCollected, setGemsCollected] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const animationFrameId = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const jumpTriggerRef = useRef<(() => void) | null>(null);

  // Load High Score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artistant_wave_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Main Canvas Game Loop
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
    const groundY = H - 36;

    // Player State
    const player = {
      x: 45,
      y: groundY - 24,
      radius: 12,
      vy: 0,
      gravity: 0.65,
      jumpStrength: -10.8,
      isGrounded: true,
      jumpsLeft: 2,
      rotation: 0,
    };

    // Game Entities
    let obstacles: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'spike' | 'tall';
      color: string;
    }> = [];

    let gems: Array<{
      x: number;
      y: number;
      radius: number;
      collected: boolean;
      rot: number;
    }> = [];

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }> = [];

    let trailParticles: Array<{
      x: number;
      y: number;
      life: number;
      color: string;
    }> = [];

    let floatingTexts: Array<{
      x: number;
      y: number;
      text: string;
      color: string;
      life: number;
    }> = [];

    let distance = 0;
    let gemCount = 0;
    let speed = 4.8;
    let obstacleTimer = 0;
    let gemTimer = 0;
    let cameraShake = 0;

    // Jump Handler
    const jump = () => {
      if (!isPlayingRef.current) return;

      if (player.jumpsLeft > 0) {
        const isDouble = player.jumpsLeft === 1;
        player.vy = isDouble ? player.jumpStrength * 0.95 : player.jumpStrength;
        player.jumpsLeft--;
        player.isGrounded = false;
        sfx.playJump(isDouble);

        if (isDouble) {
          floatingTexts.push({
            x: player.x,
            y: player.y - 15,
            text: 'DOUBLE JUMP',
            color: '#7C5CFF',
            life: 25,
          });
        }

        // Jump burst particles
        for (let i = 0; i < 8; i++) {
          particles.push({
            x: player.x,
            y: player.y + player.radius,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 3 + 1,
            life: 18,
            maxLife: 18,
            color: isDouble ? '#7C5CFF' : '#F25A2B',
            size: Math.random() * 3 + 1.5,
          });
        }
      }
    };

    jumpTriggerRef.current = jump;

    const gameLoop = () => {
      ctx.save();

      // Camera Shake Effect on Crash
      if (cameraShake > 0) {
        const dx = (Math.random() - 0.5) * cameraShake;
        const dy = (Math.random() - 0.5) * cameraShake;
        ctx.translate(dx, dy);
        cameraShake *= 0.85;
        if (cameraShake < 0.5) cameraShake = 0;
      }

      ctx.clearRect(0, 0, W, H);

      // 1. Dark Neon Grid Background
      ctx.fillStyle = '#08080C';
      ctx.fillRect(0, 0, W, H);

      // Perspective Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // 2. Glowing Horizon Line / Soundwave Floor
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#7C5CFF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Floor Underglow Gradient
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, H);
      floorGrad.addColorStop(0, 'rgba(124, 92, 255, 0.15)');
      floorGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      if (isPlayingRef.current) {
        // Physics update
        player.vy += player.gravity;
        player.y += player.vy;
        player.rotation += 0.12;

        if (player.y >= groundY - player.radius) {
          player.y = groundY - player.radius;
          player.vy = 0;
          player.isGrounded = true;
          player.jumpsLeft = 2;
        }

        // Add trail
        trailParticles.push({
          x: player.x,
          y: player.y,
          life: 14,
          color: player.jumpsLeft === 1 ? '#7C5CFF' : '#F25A2B',
        });

        // Distance & Speed
        distance += 1;
        if (distance % 4 === 0) {
          setScore(distance + gemCount * 50);
        }
        speed = 4.8 + Math.min(5, distance / 400);

        // Spawn Obstacles (Neon Vector Spikes)
        obstacleTimer++;
        if (obstacleTimer > Math.max(50, 105 - distance / 18)) {
          obstacleTimer = 0;
          const isTall = Math.random() > 0.65;
          obstacles.push({
            x: W + 20,
            y: groundY,
            w: isTall ? 22 : 18,
            h: isTall ? 36 : 24,
            type: isTall ? 'tall' : 'spike',
            color: '#EF4444',
          });
        }

        // Spawn Audio Gems
        gemTimer++;
        if (gemTimer > 85) {
          gemTimer = 0;
          gems.push({
            x: W + 30,
            y: groundY - 35 - Math.random() * 45,
            radius: 8,
            collected: false,
            rot: 0,
          });
        }
      }

      // 3. Draw Player Trail
      for (let t = trailParticles.length - 1; t >= 0; t--) {
        const tr = trailParticles[t];
        tr.life--;
        ctx.fillStyle = tr.color;
        ctx.globalAlpha = Math.max(0, tr.life / 14) * 0.4;
        ctx.beginPath();
        ctx.arc(tr.x - (14 - tr.life) * 2, tr.y, player.radius * (tr.life / 14), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        if (tr.life <= 0) trailParticles.splice(t, 1);
      }

      // 4. Draw & Update Obstacles (Neon Glowing Vector Pyramids)
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        if (isPlayingRef.current) obs.x -= speed;

        // Glow
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = obs.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;

        // Vector Triangle / Spike
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.w / 2, obs.y - obs.h);
        ctx.lineTo(obs.x + obs.w, obs.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Collision Check (Circle vs Triangle approximation)
        const hitX = player.x;
        const hitY = player.y;
        if (
          isPlayingRef.current &&
          hitX + player.radius * 0.7 > obs.x &&
          hitX - player.radius * 0.7 < obs.x + obs.w &&
          hitY + player.radius * 0.7 > obs.y - obs.h
        ) {
          // Crash! Game Over
          isPlayingRef.current = false;
          setGameState('gameover');
          cameraShake = 12;
          sfx.playGameOver();

          const finalScore = distance + gemCount * 50;
          setHighScore((prev) => {
            const nextBest = Math.max(prev, finalScore);
            if (typeof window !== 'undefined') {
              localStorage.setItem('artistant_wave_highscore', nextBest.toString());
            }
            return nextBest;
          });

          // Explosion Shockwave
          for (let p = 0; p < 28; p++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 9,
              vy: (Math.random() - 0.5) * 9,
              life: 30,
              maxLife: 30,
              color: p % 2 === 0 ? '#F25A2B' : '#7C5CFF',
              size: Math.random() * 4 + 2,
            });
          }
        }

        if (obs.x + obs.w < -20) obstacles.splice(i, 1);
      }

      // 5. Draw & Update Audio Gems (Floating Rhombus Crystals)
      for (let g = gems.length - 1; g >= 0; g--) {
        const gem = gems[g];
        if (isPlayingRef.current) {
          gem.x -= speed;
          gem.rot += 0.05;
        }

        if (!gem.collected) {
          ctx.save();
          ctx.translate(gem.x, gem.y);
          ctx.rotate(gem.rot);

          // Glowing diamond
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#06B6D4';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(0, -gem.radius);
          ctx.lineTo(gem.radius, 0);
          ctx.lineTo(0, gem.radius);
          ctx.lineTo(-gem.radius, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Check Pickup Collision
          const dist = Math.hypot(player.x - gem.x, player.y - gem.y);
          if (isPlayingRef.current && dist < player.radius + gem.radius) {
            gem.collected = true;
            gemCount += 1;
            setGemsCollected(gemCount);
            sfx.playGem();

            floatingTexts.push({
              x: gem.x,
              y: gem.y - 10,
              text: '+50',
              color: '#06B6D4',
              life: 20,
            });

            // Gem pickup sparkle
            for (let k = 0; k < 12; k++) {
              particles.push({
                x: gem.x,
                y: gem.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20,
                maxLife: 20,
                color: '#06B6D4',
                size: Math.random() * 3 + 1,
              });
            }
          }
        }

        if (gem.x < -20) gems.splice(g, 1);
      }

      // 6. Draw Particles
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

      // 7. Draw Floating Texts
      for (let f = floatingTexts.length - 1; f >= 0; f--) {
        const ft = floatingTexts[f];
        ft.y -= 1.2;
        ft.life--;

        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life / 25);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;

        if (ft.life <= 0) floatingTexts.splice(f, 1);
      }

      // 8. Draw Player (Glowing Neon Vector Disc)
      if (gameState !== 'gameover' || isPlayingRef.current) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);

        // Outer Neon Ring
        ctx.shadowColor = '#F25A2B';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#F25A2B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Core Ring
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs / Spoke Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-player.radius, 0);
        ctx.lineTo(player.radius, 0);
        ctx.moveTo(0, -player.radius);
        ctx.lineTo(0, player.radius);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isOpen, gameState]);

  // Touch / Click Jump Handler
  const handleJumpPress = useCallback(() => {
    if (gameState === 'idle' || gameState === 'gameover') {
      setScore(0);
      setGemsCollected(0);
      isPlayingRef.current = true;
      setGameState('playing');
    } else if (jumpTriggerRef.current) {
      jumpTriggerRef.current();
    }
  }, [gameState]);

  // Keyboard input (Spacebar / Up arrow)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJumpPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleJumpPress]);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sfx.enabled = !next;
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
            {/* Header: Clean Arcade Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#F25A2B] animate-pulse" />
                <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-zinc-200">
                  SOUNDWAVE RIDER
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
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

              <div className="flex items-center gap-1.5 text-[#06B6D4] font-semibold">
                <span>◆ {gemsCollected}</span>
              </div>

              <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>HI: {highScore}</span>
              </div>
            </div>

            {/* Game Canvas Screen */}
            <div
              onClick={handleJumpPress}
              onTouchStart={(e) => {
                e.preventDefault();
                handleJumpPress();
              }}
              className="relative w-full h-64 sm:h-72 rounded-2xl border border-white/10 bg-[#08080C] overflow-hidden shadow-inner cursor-pointer touch-none"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Start Screen Overlay */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center mb-3 shadow-lg">
                    <Zap className="w-6 h-6 text-[#F25A2B]" />
                  </div>

                  <h4 className="font-display text-lg sm:text-xl font-bold text-white mb-1">
                    Ride The Soundwave
                  </h4>

                  <p className="text-xs text-zinc-400 max-w-xs mb-5 leading-relaxed">
                    Tap to jump over red frequency spikes. Tap again in mid-air to <span className="text-white font-bold">Double Jump</span>!
                  </p>

                  <button
                    type="button"
                    onClick={handleJumpPress}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(242,90,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch</span>
                  </button>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/25 mb-2">
                    Signal Lost
                  </span>

                  <div className="text-3xl sm:text-4xl font-display font-black text-white mb-1">
                    {score} <span className="text-xs font-mono text-zinc-500 font-normal">PTS</span>
                  </div>

                  <p className="text-xs font-mono text-zinc-400 mb-5">
                    Gems: <span className="text-[#06B6D4] font-bold">{gemsCollected}</span>
                  </p>

                  <button
                    type="button"
                    onClick={handleJumpPress}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(242,90,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer Control Hints */}
            <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-zinc-500">
              <span>Tap screen / Spacebar = Jump</span>
              <span className="text-zinc-400 font-semibold">Double Jump enabled</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
