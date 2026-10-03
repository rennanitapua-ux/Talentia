import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a95d1e189a09c5c23ed492a/0ca2399e3_ChatGPTImage9desetde202616_05_09.png';

export default function Logo({ size = 'md', withText = false, className = '' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={LOGO_URL} alt="TalentIA" className={`${sizes[size]} rounded-lg object-cover ring-1 ring-white/10`} />
      {withText && (
        <span className={`font-bold ${textSizes[size]} text-white tracking-tight leading-none`}>
          Talent<span className="text-gradient">IA</span>
        </span>
      )}
    </div>
  );
}