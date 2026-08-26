'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface GlowingAdminCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  idx?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  [key: string]: any;
}

export default function GlowingAdminCard({ children, className, style, idx = 0, onClick, ...props }: GlowingAdminCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const checkMotion = () => {
      setReduceMotion(mediaQueryMotion.matches || window.innerWidth < 768);
    };
    checkMotion();
    window.addEventListener('resize', checkMotion, { passive: true });
    mediaQueryMotion.addEventListener('change', checkMotion);
    return () => {
      window.removeEventListener('resize', checkMotion);
      mediaQueryMotion.removeEventListener('change', checkMotion);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    setCoords({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(!reduceMotion)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={reduceMotion ? {} : { y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s, background-color 0.4s',
        ...style
      }}
      {...props}
    >
      {isHovered && !reduceMotion && (
        <div
          style={{
            position: 'absolute',
            top: coords.y - 120,
            left: coords.x - 120,
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            mixBlendMode: "var(--glow-blend, screen)" as any,
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}
