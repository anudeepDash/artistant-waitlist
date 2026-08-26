'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, AlertCircle, Smartphone } from 'lucide-react';

interface AdminLoginGateProps {
  authLoading: boolean;
  checkingAdmin: boolean;
  user: any;
  isAdmin: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  authError: string;
  handleLogout: () => void;
  verifyAndLoad: () => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  handleEmailLoginSubmit: (e: React.FormEvent) => void;
}

export default function AdminLoginGate({
  authLoading,
  checkingAdmin,
  user,
  isAdmin,
  isUnlocked,
  isLoading,
  isSigningIn,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  authError,
  handleLogout,
  verifyAndLoad,
  handleLoginSubmit,
  handleEmailLoginSubmit,
}: AdminLoginGateProps) {
  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Cinematic Backdrop with soft glowing orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,92,255,0.18), transparent 70%),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(242,90,43,0.1), transparent 60%),
              radial-gradient(ellipse 50% 50% at 80% 90%, rgba(212,86,122,0.08), transparent 60%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 80%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm md:max-w-4xl mx-4 rounded-3xl md:rounded-[2.4rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row border border-white/5 bg-[#0f0f15]/85 backdrop-blur-2xl"
      >
        {/* Left Column (Brand / Visual Showcase) */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-black/40 border-r border-white/5">
          {/* Ambient glows inside left column */}
          <div className="absolute -top-[20%] -left-[20%] w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle_at_top_left,rgba(242,90,43,0.4),transparent_50%)] pointer-events-none" />
          <div className="absolute -bottom-[20%] -right-[20%] w-[120%] h-[120%] opacity-25 bg-[radial-gradient(circle_at_bottom_right,rgba(124,92,255,0.4),transparent_50%)] pointer-events-none" />

          {/* Giant Graphic Watermark */}
          <img
            src="/logo_a_highres.png"
            alt=""
            className="absolute -bottom-[10%] -left-[10%] h-[100%] w-auto max-w-none opacity-40 pointer-events-none z-0 select-none"
          />

          <div className="relative z-10 mt-auto">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#7C5CFF] uppercase block mb-3">
              Restricted Area
            </span>
            <h3 className="font-display text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
              Admin Portal
            </h3>
            <p className="text-white/50 text-sm leading-relaxed font-medium">
              Access to this dashboard is restricted to authorized personnel only. Please sign in to verify your credentials.
            </p>
          </div>
        </div>

        {/* Right Column (Auth Action Panel) */}
        <div className="w-full md:w-1/2 p-10 sm:p-14 relative flex flex-col justify-center min-h-[520px]">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-white/40 font-mono uppercase tracking-wider mt-1.5">
              Verify Administrator Account
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {authLoading || checkingAdmin ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-[#7C5CFF]/15" />
                  <div className="absolute inset-0 rounded-full border border-transparent border-t-[#7C5CFF] animate-spin" />
                  <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-ping" />
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-2">
                  Verifying Credentials
                </span>
              </div>
            ) : user ? (
              !isAdmin ? (
                <div className="text-center space-y-6">
                  <div className="flex flex-col items-center gap-3 text-sm font-mono bg-hot/5 border border-hot/15 p-6 rounded-2xl text-hot">
                    <ShieldAlert className="w-8 h-8 shrink-0 mb-1" />
                    <span className="font-bold tracking-tight text-base">Access Denied</span>
                    <span className="text-xs text-white/60 leading-relaxed">
                      Your account is not registered as an administrator. Please contact support if you believe this is an error.
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-white/50 hover:text-[#FF4B4B] underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Sign out of {user.email}
                  </button>
                </div>
              ) : !isUnlocked ? (
                <div className="text-center space-y-6">
                  <div className="flex flex-col items-center justify-center gap-4 text-sm font-mono bg-white/[0.02] border border-white/5 p-6 rounded-[24px]">
                    <Lock className="w-6 h-6 text-[#7C5CFF] shrink-0 mb-1 animate-pulse" />
                    <span className="text-white/70 text-xs">Credentials verified. Access authorized.</span>
                    <button
                      onClick={() => verifyAndLoad()}
                      disabled={isLoading}
                      className="w-full mt-2 bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer text-sm shadow-[0_4px_20px_-5px_rgba(124,92,255,0.4)]"
                    >
                      {isLoading ? 'Loading...' : 'Enter Dashboard'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-8 text-sm font-mono animate-pulse text-[#7C5CFF] tracking-wider">
                  Redirecting to Dashboard...
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* Google Login Option */}
                <button
                  onClick={handleLoginSubmit}
                  disabled={isLoading || authLoading || isSigningIn}
                  className="relative flex items-center justify-center w-full py-4 px-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {isSigningIn ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white/40 border-t-white rounded-full mr-3" />
                  ) : (
                    <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                {/* Apple Login Option */}
                <button
                  type="button"
                  disabled
                  className="relative flex items-center justify-center w-full py-4 px-5 rounded-2xl bg-white border border-white/10 text-black font-semibold text-sm opacity-35 cursor-not-allowed select-none"
                >
                  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </button>

                {/* Phone Login Option */}
                <button
                  type="button"
                  disabled
                  className="relative flex items-center justify-center w-full py-4 px-5 rounded-2xl bg-white/[0.02] border border-white/5 text-white font-semibold text-sm opacity-35 cursor-not-allowed select-none"
                >
                  <Smartphone className="w-4 h-4 mr-3 shrink-0 text-white/50" />
                  Continue with Phone
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <span className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                  <span className="text-white/20 text-[9px] font-mono font-bold uppercase tracking-[0.15em]">
                    or console login
                  </span>
                  <span className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
                </div>

                {/* Email Sign In Form */}
                <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm focus:border-[#7C5CFF]/70 focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all duration-300 outline-none"
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Security password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm focus:border-[#7C5CFF]/70 focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all duration-300 outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || isSigningIn}
                    className="w-full bg-[#7C5CFF] text-white font-bold py-4 rounded-2xl hover:bg-[#7C5CFF]/90 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer shadow-md"
                  >
                    {isSigningIn ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}

            {authError && (
              <div className="flex items-center gap-2 text-xs font-mono bg-hot/10 border border-hot/20 p-4 rounded-xl mt-4 text-hot">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
