'use client';

import { useEffect, useRef } from 'react';

/**
 * ParticleBackground — Lightweight canvas-based particle effect
 * Renders floating gradient orbs with subtle parallax on mouse movement.
 * Performance-optimized with requestAnimationFrame & tab visibility handling.
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

const COLORS = [
  'rgba(232, 82, 63,',   // brand orange
  'rgba(212, 86, 122,',  // brand coral
  'rgba(107, 92, 231,',  // brand purple
  'rgba(76, 63, 191,',   // deep purple
];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const isTabActiveRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle resize with screen DPR consideration
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Handle mouse movement for parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    // Pause canvas when tab is hidden to preserve battery and CPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActiveRef.current = false;
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      } else {
        isTabActiveRef.current = true;
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Initialize particles (fewer on small screens to optimize mobile Safari performance)
    const initParticles = () => {
      const isMobile = window.innerWidth < 768;
      const count = Math.min(Math.floor((canvas.width * canvas.height) / (isMobile ? 45000 : 30000)), isMobile ? 24 : 45);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.4 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      }));
    };

    // Fast animation loop
    const animate = () => {
      if (!isTabActiveRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      const particles = particlesRef.current;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const p = particles[i];
        // Update position
        p.x += p.speedX + mx * 0.1;
        p.y += p.speedY + my * 0.1;
        p.pulse += p.pulseSpeed;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Pulsing opacity
        const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentOpacity})`;
        ctx.fill();

        // Draw connection lines between nearby particles using squared distance (avoid Math.sqrt)
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 14400) { // 120 * 120
            const alpha = 0.07 * (1 - distSq / 14400);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(107, 92, 231, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
