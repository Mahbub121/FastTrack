import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { useUserStore } from '../store/userStore';
import { useStreak } from '../hooks/useStreak';
import StatsCharts from '../components/charts/StatsCharts';
import { Award, Zap, Flame, Trophy, Target } from 'lucide-react';

export default function Stats() {
  const { profile } = useUserStore();
  const currentStreak = useStreak() || 0;

  // DB queries to evaluate achievements
  const fastsCount = useLiveQuery(async () => {
    return await db.fastingSessions.where('status').equals('completed').count();
  }) || 0;

  const hasFastedOnce = fastsCount > 0;
  const hasFasted100 = fastsCount >= 100;

  const weightLost5kg = useLiveQuery(async () => {
    const list = await db.weightEntries.orderBy('date').toArray();
    if (list.length < 2) return false;
    const initialWeight = list[0].weight_kg;
    const latestWeight = list[list.length - 1].weight_kg;
    return (initialWeight - latestWeight) >= 5;
  }) || false;

  // Badge list data
  const badges = [
    {
      id: 'first_fast',
      title: 'First Successful Fast',
      desc: 'You completed your first fasting session successfully.',
      unlocked: hasFastedOnce,
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'streak_7',
      title: '7-Day Consistency',
      desc: 'Recorded logs in the FastTrack app for 7 consecutive days.',
      unlocked: currentStreak >= 7,
      icon: Flame,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'streak_30',
      title: '30-Day Milestone',
      desc: 'Maintained your Keto and fasting routine for 30 consecutive days.',
      unlocked: currentStreak >= 30,
      icon: Trophy,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'weight_lost_5',
      title: '5kg Fat Loss',
      desc: 'Lost 5kg or more compared to your starting weight.',
      unlocked: weightLost5kg,
      icon: Target,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'fasts_100',
      title: 'Centurion Session',
      desc: 'Completed 100 fasting windows successfully.',
      unlocked: hasFasted100,
      icon: Award,
      color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    }
  ];

  return (
    <div className="fade-in space-y-6 pb-6 font-sans">
      {/* 1. Charts tab widget */}
      <StatsCharts />

      {/* 2. Achievements Grid Section */}
      <div className="space-y-4">
        <div className="px-1">
          <h3 className="text-sm font-bold text-slate-300">Achievements & Badges</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Your Keto journey milestones tracker</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`glass-card rounded-xl p-4 flex gap-4 items-center border transition-all ${
                  badge.unlocked 
                    ? 'border-white/10 opacity-100' 
                    : 'border-white/5 opacity-50'
                }`}
              >
                {/* Badge Icon circle */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all ${
                  badge.unlocked 
                    ? badge.color 
                    : 'bg-surface-light border-white/5 text-slate-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Badge Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-200">{badge.title}</h4>
                    {badge.unlocked && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary font-bold">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
