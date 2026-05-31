import React from 'react';

export default function CircularTimer({ elapsedSeconds, targetHours, size = 'w-56 h-56' }) {
  const targetSeconds = targetHours * 3600;
  const percent = Math.min(100, Math.max(0, (elapsedSeconds / targetSeconds) * 100));

  const formatSecondsToHMS = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Determine if mini layout is used
  const isMini = size.includes('w-44') || size.includes('w-40') || size.includes('w-36') || size.includes('w-32');

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Self-contained breathing animation style */}
      <style>{`
        @keyframes timerBreathe {
          0%, 100% {
            opacity: 0.75;
            filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(245, 158, 11, 0.7)) drop-shadow(0 0 6px rgba(239, 68, 68, 0.5));
          }
        }
        .animate-timer-glow {
          animation: timerBreathe 4s ease-in-out infinite;
        }
      `}</style>

      {/* SVG Circular Wheel */}
      <svg className={`${size} transform -rotate-90`} viewBox="0 0 200 200">
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle Track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="stroke-slate-800/60"
          strokeWidth="8"
          fill="transparent"
        />

        {/* Foreground Progress Circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="url(#timerGrad)"
          filter="url(#timerGlow)"
          className="animate-timer-glow"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>

      {/* Centered Timer Information */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className={`font-extrabold tracking-tight text-white font-sans drop-shadow-lg ${
          isMini ? 'text-2xl' : 'text-4xl'
        }`}>
          {formatSecondsToHMS(elapsedSeconds)}
        </span>
        <span className={`font-bold tracking-widest text-slate-400 uppercase mt-1 ${
          isMini ? 'text-[8px]' : 'text-[10px]'
        }`}>
          Goal: {targetHours}h • {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}
