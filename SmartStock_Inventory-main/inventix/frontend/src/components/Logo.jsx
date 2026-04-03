import React from 'react';

export default function Logo({ className = "w-8 h-8", withText = true, textColor = "text-slate-900 dark:text-white" }) {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight ${textColor}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <div className="absolute inset-0 rounded-[1.45rem] bg-[radial-gradient(circle_at_28%_24%,rgba(179,207,229,0.34),transparent_40%)] blur-md" />
        <div className="absolute inset-0 rounded-[1.45rem] border border-white/10 bg-[linear-gradient(155deg,#0A1931_0%,#122C4B_42%,#1A3D63_68%,#4A7FA7_100%)] shadow-[0_16px_40px_rgba(10,25,49,0.34)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-[9%] rounded-[1.1rem] border border-white/10" />
          <div className="absolute left-[18%] top-[18%] h-[4px] w-[4px] rounded-full bg-white/70" />
          <div className="absolute right-[18%] bottom-[18%] h-[4px] w-[4px] rounded-full bg-white/40" />
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[78%] h-[78%] text-[#F6FAFD]">
            <path d="M15 19H31L23 32H36L20 45H28L49 19" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M37 15L49 15" stroke="#B3CFE5" strokeWidth="3" strokeLinecap="round" />
            <path d="M15 49H28" stroke="#B3CFE5" strokeWidth="3" strokeLinecap="round" />
            <path d="M40 25L49 25" stroke="#4A7FA7" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
            <path d="M15 39H23" stroke="#4A7FA7" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
          </svg>
        </div>
      </div>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="text-[1.55rem] font-bold tracking-[0.18em] uppercase text-[color:var(--text)]">Inventix</span>
          <span className="text-[0.6rem] uppercase tracking-[0.38em] text-[#4A7FA7] mt-1">Smart Inventory OS</span>
        </div>
      )}
    </div>
  );
}
