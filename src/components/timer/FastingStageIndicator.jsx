import React from 'react';

export function getFastingStage(elapsedHours) {
  if (elapsedHours < 4) {
    return {
      label: 'Digestion Stage',
      description: 'Your body is digesting food and using blood glucose as energy.',
      color: 'border-slate-500/10 bg-slate-500/5',
      badgeColor: 'bg-slate-500/10 text-slate-400',
      textColor: 'text-slate-400'
    };
  } else if (elapsedHours < 12) {
    return {
      label: 'Fat Burning Started',
      description: 'Insulin levels drop, and the body begins mobilizing fatty acids.',
      color: 'border-amber-500/10 bg-amber-500/5',
      badgeColor: 'bg-amber-500/10 text-amber-500',
      textColor: 'text-amber-500'
    };
  } else if (elapsedHours < 18) {
    return {
      label: 'Ketosis Active',
      description: 'Your body is using ketones for energy, accelerating fat oxidation.',
      color: 'border-accent-primary/10 bg-accent-primary/5',
      badgeColor: 'bg-accent-primary/10 text-accent-primary',
      textColor: 'text-accent-primary'
    };
  } else if (elapsedHours < 24) {
    return {
      label: 'Autophagy Active',
      description: 'Cellular recycling begins, clearing out damaged components.',
      color: 'border-accent-ketone/10 bg-accent-ketone/5',
      badgeColor: 'bg-accent-ketone/10 text-accent-ketone',
      textColor: 'text-accent-ketone'
    };
  } else {
    return {
      label: 'Deep Autophagy',
      description: 'High-level cellular cleanup and positive hormone optimization.',
      color: 'border-accent-weight/10 bg-accent-weight/5',
      badgeColor: 'bg-accent-weight/10 text-accent-weight',
      textColor: 'text-accent-weight'
    };
  }
}

export default function FastingStageIndicator({ elapsedHours }) {
  const stage = getFastingStage(elapsedHours);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${stage.color}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Physiological Stage:</span>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider ${stage.badgeColor}`}>
          {stage.label}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-300">
        {stage.description}
      </p>
    </div>
  );
}
