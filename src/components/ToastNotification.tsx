'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastPayload {
  message: string;
  type?: ToastType;
  title?: string;
  senderName?: string;
  avatarUrl?: string;
  senderLogo?: React.ReactNode;
}

export interface ToastNotificationProps {
  message: string | ToastPayload | null;
  type?: ToastType;
  title?: string;
  senderName?: string;
  avatarUrl?: string;
  senderLogo?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

export function inferToastType(message: string): { type: ToastType; defaultTitle: string } {
  const lower = message.toLowerCase();
  
  if (
    lower.includes('error') || 
    lower.includes('failed') || 
    lower.includes('too large') || 
    lower.includes('invalid') || 
    lower.includes('cannot') || 
    lower.includes('revoked')
  ) {
    return { type: 'error', defaultTitle: 'System Alert' };
  }
  if (
    lower.includes('reading') || 
    lower.includes('uploading') || 
    lower.includes('preparing') || 
    lower.includes('connecting') || 
    lower.includes('processing') ||
    lower.includes('generating')
  ) {
    return { type: 'loading', defaultTitle: 'Processing' };
  }
  if (
    lower.includes('warn') || 
    lower.includes('caution') || 
    lower.includes('attention') || 
    lower.includes('limit')
  ) {
    return { type: 'warning', defaultTitle: 'Attention' };
  }
  if (
    lower.includes('connected') ||
    lower.includes('copied') || 
    lower.includes('downloaded') || 
    lower.includes('saved') || 
    lower.includes('updated') || 
    lower.includes('verified') || 
    lower.includes('success') || 
    lower.includes('exported') || 
    lower.includes('featured') ||
    lower.includes('toggled') ||
    lower.includes('loaded')
  ) {
    return { type: 'success', defaultTitle: 'Artistant' };
  }
  
  return { type: 'info', defaultTitle: 'Artistant' };
}

export function ToastNotification({
  message: rawMessageProp,
  type: customType,
  title: customTitle,
  senderName: customSenderName,
  avatarUrl: customAvatarUrl,
  senderLogo: customSenderLogo,
  duration = 3800,
  onClose,
  position = 'top-right',
}: ToastNotificationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  // Normalize string vs object payload
  const isObjectPayload = typeof rawMessageProp === 'object' && rawMessageProp !== null;
  const messageStr = isObjectPayload ? rawMessageProp.message : (rawMessageProp as string | null);
  
  const payloadType = isObjectPayload ? rawMessageProp.type : undefined;
  const payloadTitle = isObjectPayload ? rawMessageProp.title : undefined;
  const payloadSender = isObjectPayload ? rawMessageProp.senderName : undefined;
  const payloadAvatar = isObjectPayload ? rawMessageProp.avatarUrl : undefined;
  const payloadLogo = isObjectPayload ? rawMessageProp.senderLogo : undefined;

  const { type: inferredType, defaultTitle } = messageStr ? inferToastType(messageStr) : { type: 'info' as ToastType, defaultTitle: 'Artistant' };
  const toastType = customType || payloadType || inferredType;
  const displayTitle = customTitle || payloadTitle || defaultTitle;
  const senderName = customSenderName || payloadSender || displayTitle || 'Artistant';
  const avatarUrl = customAvatarUrl || payloadAvatar || '/logo_a.png';
  const senderLogo = customSenderLogo || payloadLogo;

  useEffect(() => {
    if (!messageStr || toastType === 'loading') return;

    const intervalTime = 40;
    const totalSteps = duration / intervalTime;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      if (!isHovered) {
        setProgress((prev) => {
          if (prev <= decrement) {
            clearInterval(timer);
            if (onClose) onClose();
            return 0;
          }
          return prev - decrement;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [messageStr, duration, isHovered, onClose, toastType]);

  // Reset progress when message changes
  useEffect(() => {
    setProgress(100);
  }, [messageStr]);

  if (!messageStr) return null;

  // Position styles
  const positionClasses = {
    'top-right': 'top-5 right-5 left-5 sm:left-auto sm:w-[380px]',
    'top-center': 'top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px]',
    'bottom-right': 'bottom-6 right-6 left-6 sm:left-auto sm:w-[380px]',
  }[position];

  return (
    <AnimatePresence>
      <motion.div
        key={messageStr}
        initial={{ opacity: 0, y: -24, scale: 0.94, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -16, scale: 0.95, filter: 'blur(8px)' }}
        transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed ${positionClasses} z-[99999] pointer-events-auto rounded-[24px] overflow-hidden select-none group min-h-[60px]`}
        style={{
          background: 'linear-gradient(180deg, rgba(32, 33, 37, 0.88) 0%, rgba(20, 20, 24, 0.92) 100%)',
          backdropFilter: 'blur(45px) saturate(190%) brightness(110%)',
          WebkitBackdropFilter: 'blur(45px) saturate(190%) brightness(110%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 20px 48px -8px rgba(0, 0, 0, 0.85),
            0 4px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        {/* Top Liquid Reflection Glow */}
        <div 
          className="absolute -top-[50%] left-[10%] w-[80%] h-[80%] pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 80%)',
          }}
        />

        {/* Banner Layout */}
        <div className="px-4 py-3 flex items-center gap-3.5 relative z-10 my-auto min-h-[58px]">
          
          {/* White Squircle App Icon Frame (Exact macOS notification icon) */}
          <div className="w-[42px] h-[42px] rounded-[13px] bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-[1.02] p-1.5">
            {senderLogo ? (
              senderLogo
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={senderName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo_a.png';
                }}
              />
            ) : (
              <img src="/logo_a.png" alt="Logo" className="w-full h-full object-contain" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
            {/* Sender / Title */}
            <h4 className="text-[15px] font-semibold text-white leading-tight tracking-tight font-sans truncate">
              {senderName}
            </h4>

            {/* Message Body */}
            <p className="text-[13.5px] font-normal text-white/80 leading-snug tracking-tight truncate font-sans mt-[1px]">
              {messageStr}
            </p>
          </div>

          {/* Optional Hover Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all cursor-pointer shrink-0 -mr-1"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Subtle Micro Progress Line */}
        {toastType !== 'loading' && (
          <div className="w-full h-[1.5px] bg-white/5 overflow-hidden relative z-10">
            <div
              className="h-full bg-white/40 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}




