import React from 'react';

export const BackgroundEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0b0d14]">
      {/* Neo Grid pattern */}
      <div className="absolute inset-0 bg-neo-grid opacity-60" />

      {/* Subtle radial glow accents in corners */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />

      {/* Floating brutalist grid dots */}
      <div className="absolute top-10 right-10 flex gap-1 opacity-20">
        <div className="w-2 h-2 bg-amber-400" />
        <div className="w-2 h-2 bg-cyan-400" />
        <div className="w-2 h-2 bg-rose-400" />
      </div>
      <div className="absolute bottom-12 left-10 flex gap-1 opacity-20">
        <div className="w-2 h-2 bg-lime-400" />
        <div className="w-2 h-2 bg-purple-400" />
      </div>
    </div>
  );
};
