import React from 'react';

/**
 * TalentIA — Premium ambient background.
 * Deep navy base with large, subtle light auras (electric blue top-left,
 * blue/purple bottom-right) and sweeping luminous arcs.
 * Fixed, pointer-events-none, sits behind all content.
 */
export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base — deep navy almost black */}
      <div className="absolute inset-0 bg-background" />

      {/* Cyan / teal aura — top left, large and soft */}
      <div
        className="absolute -top-56 -left-56 w-[860px] h-[860px] rounded-full opacity-[0.16] blur-[150px]"
        style={{ background: 'radial-gradient(circle, hsl(190 90% 45%) 0%, transparent 70%)' }}
      />

      {/* Blue/purple aura — bottom right, large and soft */}
      <div
        className="absolute -bottom-52 -right-40 w-[860px] h-[860px] rounded-full opacity-[0.10] blur-[150px]"
        style={{ background: 'radial-gradient(circle, hsl(271 91% 65%) 0%, transparent 70%)' }}
      />

      {/* Cyan accent glow — center-top, very subtle */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.05] blur-[160px]"
        style={{ background: 'radial-gradient(ellipse, hsl(190 90% 55%) 0%, transparent 70%)' }}
      />

      {/* Sweeping luminous arcs */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs>
          <linearGradient id="bg-arc-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
            <stop offset="45%" stopColor="hsl(217 91% 60%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(271 91% 65%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-arc-violet" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(271 91% 65%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(271 91% 65%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-arc-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(190 90% 55%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(190 90% 55%)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main sweeping arcs */}
        <path d="M-100,180 Q360,20 720,220 T1540,160" stroke="url(#bg-arc-blue)" strokeWidth="2" fill="none" />
        <path d="M-100,320 Q360,160 720,360 T1540,300" stroke="url(#bg-arc-blue)" strokeWidth="1.5" fill="none" />
        <path d="M-100,480 Q360,320 720,520 T1540,460" stroke="url(#bg-arc-violet)" strokeWidth="1.5" fill="none" />
        <path d="M-100,620 Q360,460 720,660 T1540,600" stroke="url(#bg-arc-violet)" strokeWidth="1.2" fill="none" />
        <path d="M-100,740 Q360,580 720,780 T1540,720" stroke="url(#bg-arc-cyan)" strokeWidth="0.9" fill="none" />
        {/* Thin accent arcs */}
        <path d="M-100,100 Q480,240 960,80 T1540,120" stroke="url(#bg-arc-cyan)" strokeWidth="0.6" fill="none" opacity="0.5" />
        <path d="M-100,820 Q480,680 960,840 T1540,800" stroke="url(#bg-arc-blue)" strokeWidth="0.6" fill="none" opacity="0.5" />
      </svg>

      {/* Very subtle grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
        }}
      />

      {/* Top vignette for depth */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, transparent 40%, hsl(var(--bg-vignette)) 100%)' }} />
    </div>
  );
}