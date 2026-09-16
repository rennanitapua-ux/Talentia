import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a95d1e189a09c5c23ed492a/0ca2399e3_ChatGPTImage9desetde202616_05_09.png';

export default function Logo({ size = 'md', withText = false, className = '' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };
  const textSizes = {
    xs: 'text-base',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={LOGO_URL} alt="TalentOS" className={`${sizes[size]} rounded-xl object-cover ring-1 ring-white/10`} />
      {withText && (
        <span className={`font-heading ${textSizes[size]} text-white tracking-tight leading-none`}>
          Talent<span className="text-[hsl(190,85%,55%)]">OS</span>
        </span>
      )}
    </div>
  );
}