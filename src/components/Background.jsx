import React from 'react';

/**
 * TalentOS — Abstract background with subtle gradient light arcs.
 * Fixed, pointer-events-none, sits behind all content.
 * Used on landing + auth pages for visual continuity.
 */
export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base */}
      <div className="absolute inset-0 bg-background" />

      {/* Blue glow — top left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[140px]"
        style={{ background: 'hsl(217 91% 60%)' }}
      />

      {/* Violet glow — bottom right */}
      <div
        className="absolute -bottom-40 -right-32 w-[700px] h-[700px] rounded-full opacity-[0.05] blur-[140px]"
        style={{ background: 'hsl(271 91% 65%)' }}
      />

      {/* Center subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-[0.04] blur-[160px]"
        style={{ background: 'hsl(217 91% 55%)' }}
      />

      {/* Sweeping light arcs — more prominent to match reference */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs>
          <linearGradient id="bg-curve-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(217 91% 60%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(271 91% 65%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-curve-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(271 91% 65%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(271 91% 65%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-curve-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(190 85% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(190 85% 50%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main sweeping arcs */}
        <path d="M-100,200 Q360,40 720,240 T1540,180" stroke="url(#bg-curve-1)" strokeWidth="2" fill="none" />
        <path d="M-100,340 Q360,180 720,380 T1540,320" stroke="url(#bg-curve-1)" strokeWidth="1.5" fill="none" />
        <path d="M-100,500 Q360,340 720,540 T1540,480" stroke="url(#bg-curve-2)" strokeWidth="1.5" fill="none" />
        <path d="M-100,640 Q360,480 720,680 T1540,620" stroke="url(#bg-curve-2)" strokeWidth="1" fill="none" />
        <path d="M-100,760 Q360,600 720,800 T1540,740" stroke="url(#bg-curve-3)" strokeWidth="0.8" fill="none" />
        {/* Thin accent arcs */}
        <path d="M-100,120 Q480,260 960,100 T1540,140" stroke="url(#bg-curve-3)" strokeWidth="0.6" fill="none" opacity="0.5" />
        <path d="M-100,820 Q480,680 960,840 T1540,800" stroke="url(#bg-curve-1)" strokeWidth="0.6" fill="none" opacity="0.5" />
      </svg>

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(220 20% 96%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 20% 96%) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}