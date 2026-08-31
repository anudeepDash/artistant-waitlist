'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Volume2, VolumeX, Trophy, Zap, Shield, Flame, Sparkles } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sound synthesizer using native Web Audio API (0 external assets required)
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playScore() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  playGameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }
}

const sfx = new SoundFX();

export default function MiniGameModal({ isOpen, onClose }: MiniGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [auraTitle, setAuraTitle] = useState<string>('Bedroom Producer');

  const animationFrameId = useRef<number | null>(null);
  const gameLoopRef = useRef<(() => void) | null>(null);

  // Load high score from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artistant_game_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Update Aura Rank
  useEffect(() => {
    if (score >= 1000) setAuraTitle('Headliner Legend 👑');
    else if (score >= 600) setAuraTitle('Arena Sensation ⚡');
    else if (score >= 350) setAuraTitle('Verified Touring Act 🔥');
    else if (score >= 150) setAuraTitle('Club Resident 🎧');
    else setAuraTitle('Underground Cooker 👨‍🍳');
  }, [score]);

  // Main Canvas Game Engine
  useEffect(() => {
    if (!isOpen) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const groundY = H - 38;

    // Game variables
    let player = {
      x: 45,
      y: groundY - 32,
      w: 30,
      h: 32,
      vy: 0,
      gravity: 0.72,
      jumpForce: -12.5,
      isGrounded: true,
      legFrame: 0,
    };

    let obstacles: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'middleman' | 'unpaid' | 'broker';
      label: string;
      color: string;
    }> = [];

    let collectibles: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'coin' | 'mic' | 'escrow';
      color: string;
      collected: boolean;
    }> = [];

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }> = [];

    let currentScore = 0;
    let gameSpeed = 4.6;
    let obstacleTimer = 0;
    let collectibleTimer = 0;
    let isRunning = gameState === 'playing';

    const OBSTACLE_TYPES = [
      { label: '30% AGENT CUT', color: '#EF4444', w: 42, h: 28, type: 'middleman' as const },
      { label: 'GHOSTED INVOICE', color: '#F97316', w: 48, h: 26, type: 'unpaid' as const },
      { label: 'MIDDLEMAN', color: '#DC2626', w: 36, h: 32, type: 'broker' as const },
    ];

    const jump = () => {
      if (player.isGrounded && isRunning) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
        sfx.playJump();

        // Jump particles
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: player.x + player.w / 2,
            y: groundY,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 2 - 1,
            life: 18,
            color: '#F25A2B',
            size: Math.random() * 3 + 2,
          });
        }
      }
    };

    // Attach trigger to ref for external buttons / touches
    (canvas as any).__gameJump = jump;

    const gameLoop = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Draw Retro Grid Background
      ctx.fillStyle = '#09090E';
      ctx.fillRect(0, 0, W, H);

      // Subtle background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // 2. Draw Floor / Stage Line
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();

      // Floor glow
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, H);
      floorGrad.addColorStop(0, 'rgba(124, 92, 255, 0.15)');
      floorGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      if (isRunning) {
        // Physics update
        player.vy += player.gravity;
        player.y += player.vy;

        if (player.y >= groundY - player.h) {
          player.y = groundY - player.h;
          player.vy = 0;
          player.isGrounded = true;
        }

        // Increase score & speed over time
        currentScore += 1;
        if (currentScore % 5 === 0) {
          setScore(currentScore);
        }
        gameSpeed = 4.6 + Math.min(6, currentScore / 300);

        // Spawn Obstacles
        obstacleTimer++;
        if (obstacleTimer > Math.max(55, 110 - currentScore / 15)) {
          obstacleTimer = 0;
          const choice = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
          obstacles.push({
            x: W + 20,
            y: groundY - choice.h,
            w: choice.w,
            h: choice.h,
            type: choice.type,
            label: choice.label,
            color: choice.color,
          });
        }

        // Spawn Collectibles (Escrow & Music Notes)
        collectibleTimer++;
        if (collectibleTimer > 130) {
          collectibleTimer = 0;
          collectibles.push({
            x: W + 30,
            y: groundY - 55 - Math.random() * 35,
            w: 16,
            h: 16,
            type: Math.random() > 0.5 ? 'escrow' : 'coin',
            color: '#7C5CFF',
            collected: false,
          });
        }
      }

      // 3. Draw & Update Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        if (isRunning) obs.x -= gameSpeed;

        // Obstacle Box
        ctx.fillStyle = obs.color + '22';
        ctx.strokeStyle = obs.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 6);
        ctx.fill();
        ctx.stroke();

        // Obstacle Icon / Label Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('❌', obs.x + obs.w / 2, obs.y + obs.h / 2 + 3);

        // AABB Collision Detection with Player
        const hitMargin = 5;
        if (
          isRunning &&
          player.x + hitMargin < obs.x + obs.w - hitMargin &&
          player.x + player.w - hitMargin > obs.x + hitMargin &&
          player.y + hitMargin < obs.y + obs.h &&
          player.y + player.h > obs.y + hitMargin
        ) {
          // Game Over
          isRunning = false;
          setGameState('gameover');
          sfx.playGameOver();

          // Save high score
          setHighScore((prev) => {
            const nextBest = Math.max(prev, currentScore);
            if (typeof window !== 'undefined') {
              localStorage.setItem('artistant_game_highscore', nextBest.toString());
            }
            return nextBest;
          });

          // Explosion particles
          for (let p = 0; p < 24; p++) {
            particles.push({
              x: player.x + player.w / 2,
              y: player.y + player.h / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 30,
              color: p % 2 === 0 ? '#F25A2B' : '#7C5CFF',
              size: Math.random() * 4 + 2,
            });
          }
        }

        if (obs.x + obs.w < -20) {
          obstacles.splice(i, 1);
        }
      }

      // 4. Draw & Update Collectibles (Escrow / Coins)
      for (let c = collectibles.length - 1; c >= 0; c--) {
        const item = collectibles[c];
        if (isRunning) item.x -= gameSpeed;

        if (!item.collected) {
          // Glowing collectible orb
          ctx.fillStyle = '#7C5CFF';
          ctx.shadowColor = '#7C5CFF';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(item.x + 8, item.y + 8, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner icon
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.type === 'escrow' ? '🛡️' : '⚡', item.x + 8, item.y + 11);

          // Check collect collision
          if (
            isRunning &&
            player.x < item.x + item.w &&
            player.x + player.w > item.x &&
            player.y < item.y + item.h &&
            player.y + player.h > item.y
          ) {
            item.collected = true;
            currentScore += 50;
            setScore(currentScore);
            sfx.playScore();

            // Sparkle burst
            for (let k = 0; k < 12; k++) {
              particles.push({
                x: item.x + 8,
                y: item.y + 8,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20,
                color: '#7C5CFF',
                size: Math.random() * 3 + 1.5,
              });
            }
          }
        }

        if (item.x < -20) {
          collectibles.splice(c, 1);
        }
      }

      // 5. Draw & Update Particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / 30);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (pt.life <= 0) particles.splice(p, 1);
      }

      // 6. Draw Player (Chef / Performer Runner)
      if (gameState !== 'gameover' || isRunning) {
        // Player Neon Shadow
        ctx.fillStyle = 'rgba(242, 90, 43, 0.2)';
        ctx.beginPath();
        ctx.ellipse(player.x + 15, groundY + 2, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Player Capsule / Body
        ctx.fillStyle = '#181824';
        ctx.strokeStyle = '#F25A2B';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.w, player.h, 8);
        ctx.fill();
        ctx.stroke();

        // Runner Character Emoji Icon inside
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👨‍🍳', player.x + player.w / 2, player.y + 23);
      }

      // 7. HUD: Top Live Score Display
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${currentScore}`, 16, 24);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'right';
      ctx.fillText(`HI: ${highScore}`, W - 16, 24);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = gameLoop;
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isOpen, gameState, highScore]);

  // Touch and Keyboard handlers
  const handleJump = useCallback(() => {
    if (gameState === 'idle' || gameState === 'gameover') {
      setScore(0);
      setGameState('playing');
    } else if (canvasRef.current && (canvasRef.current as any).__gameJump) {
      (canvasRef.current as any).__gameJump();
    }
  }, [gameState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleJump]);

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
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            className="relative w-full max-w-xl rounded-3xl bg-[#0D0D14] border border-white/15 p-5 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-white overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#F25A2B] animate-pulse" />
                <div>
                  <h3 className="text-sm sm:text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
                    <span>LET US COOK</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7C5CFF] bg-[#7C5CFF]/15 px-2 py-0.5 rounded-full border border-[#7C5CFF]/30">
                      Arcade
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Game Canvas Container */}
            <div 
              onClick={handleJump}
              onTouchStart={(e) => {
                e.preventDefault();
                handleJump();
              }}
              className="relative w-full h-56 sm:h-64 rounded-2xl border border-white/10 bg-[#09090E] overflow-hidden cursor-pointer touch-none shadow-inner"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Start Screen Overlay */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl sm:text-4xl mb-2 animate-bounce">👨‍🍳</span>
                  <h4 className="font-display text-lg sm:text-xl font-bold text-white mb-1">
                    Jump Over Middlemen &amp; Ghost Invoices
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mb-4">
                    Tap anywhere or hit <span className="text-white font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">SPACE</span> to leap over broker cuts and collect verified escrow coins!
                  </p>
                  <button
                    type="button"
                    onClick={handleJump}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Cooking</span>
                  </button>
                </div>
              )}

              {/* Game Over Screen Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/25 mb-2">
                    Caught By Middleman Markup
                  </span>
                  
                  <div className="text-3xl sm:text-4xl font-display font-black text-white mb-1">
                    {score} <span className="text-sm font-mono text-zinc-400 font-normal">PTS</span>
                  </div>

                  <p className="text-xs font-mono text-amber-400 mb-4 font-semibold">
                    Rank: {auraTitle}
                  </p>

                  <button
                    type="button"
                    onClick={handleJump}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Play Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer Controls & Stats */}
            <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: {highScore} pts</span>
              </span>

              <span className="hidden sm:inline text-zinc-500">
                Tap / Spacebar to Jump
              </span>

              <span className="text-zinc-400">
                Aura: +{score * 100}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
