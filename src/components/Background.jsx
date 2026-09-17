import React from 'react';

/**
 * TalentOS — Abstract background with subtle gradient curves.
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
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.06] blur-[140px]"
        style={{ background: 'hsl(217 91% 60%)' }}
      />

      {/* Violet glow — bottom right */}
      <div
        className="absolute -bottom-40 -right-32 w-[700px] h-[700px] rounded-full opacity-[0.04] blur-[140px]"
        style={{ background: 'hsl(271 91% 65%)' }}
      />

      {/* Center subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-[0.03] blur-[160px]"
        style={{ background: 'hsl(217 91% 55%)' }}
      />

      {/* Sweeping curves */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs>
          <linearGradient id="bg-curve-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" />
            <stop offset="100%" stopColor="hsl(271 91% 65%)" />
          </linearGradient>
          <linearGradient id="bg-curve-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(271 91% 65%)" />
            <stop offset="100%" stopColor="hsl(217 91% 60%)" />
          </linearGradient>
        </defs>
        <path d="M-100,280 Q360,80 720,320 T1540,260" stroke="url(#bg-curve-1)" strokeWidth="1.5" fill="none" />
        <path d="M-100,420 Q360,220 720,460 T1540,400" stroke="url(#bg-curve-1)" strokeWidth="1" fill="none" />
        <path d="M-100,580 Q360,380 720,620 T1540,560" stroke="url(#bg-curve-2)" strokeWidth="1" fill="none" />
        <path d="M-100,720 Q360,520 720,760 T1540,700" stroke="url(#bg-curve-2)" strokeWidth="0.5" fill="none" />
      </svg>
    </div>
  );
}