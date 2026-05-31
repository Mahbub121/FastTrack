import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { useUserStore } from '../store/userStore';
import { useFastStore } from '../store/fastStore';
import { useStreak, useFastingStreak } from '../hooks/useStreak';
import { getTodayKey, formatDate, formatTime } from '../utils/dateHelpers';
import { getFastingStage } from '../components/timer/FastingStageIndicator';
import CircularTimer from '../components/timer/CircularTimer';
import { Flame, Droplet, Scale, Activity, Plus, Check, X, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { profile, updateProfile } = useUserStore();
  const { activeSession, loadActiveSession } = useFastStore();
  const todayKey = getTodayKey();
  const navigate = useNavigate();
  const currentStreak = useStreak() || 0;
  const fastingStreak = useFastingStreak() || 0;

  // FAB & Modals States
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  // PWA Install State
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Form States
  const [weightValue, setWeightValue] = useState('');

  // Queries
  const todayWaterEntries = useLiveQuery(() => {
    return db.waterEntries.where('date').equals(todayKey).toArray();
  }, [todayKey]) || [];

  const loggedFoods = useLiveQuery(() => {
    return db.foodEntries.where('date').equals(todayKey).toArray();
  }, [todayKey]) || [];

  const latestWeight = useLiveQuery(async () => {
    const list = await db.weightEntries.orderBy('date').reverse().toArray();
    return list[0] || null;
  }) || null;

  // Active Fasting Ticker
  const [elapsedHours, setElapsedHours] = useState(0);
  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  useEffect(() => {
    if (!activeSession) {
      setElapsedHours(0);
      return;
    }
    const updateTicker = () => {
      const diffMs = Date.now() - new Date(activeSession.start_time).getTime();
      setElapsedHours(Math.max(0, diffMs / (1000 * 60 * 60)));
    };
    updateTicker();
    const interval = setInterval(updateTicker, 60000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // PWA Installation Check
  useEffect(() => {
    const checkInstallable = () => {
      const visits = parseInt(localStorage.getItem('visit_count') || '0', 10);
      if (visits >= 3 && window.deferredPrompt) {
        setShowInstallBanner(true);
      }
    };
    checkInstallable();
    window.addEventListener('pwa-install-ready', checkInstallable);
    return () => window.removeEventListener('pwa-install-ready', checkInstallable);
  }, []);

  const handleInstallPWA = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`PWA installation outcome: ${outcome}`);
    window.deferredPrompt = null;
    setShowInstallBanner(false);
  };

  // Water logic
  const dailyWaterGoal = profile?.daily_water_goal_ml || 3000;
  const totalWaterMl = todayWaterEntries.reduce((sum, entry) => sum + entry.amount_ml, 0);
  const waterPercent = Math.min(100, Math.round((totalWaterMl / dailyWaterGoal) * 100));
  const waterY = 110 - (waterPercent / 100) * 95;

  const handleAddWater = async (amountMl) => {
    const newWater = {
      id: crypto.randomUUID(),
      date: todayKey,
      amount_ml: amountMl,
      logged_at: new Date().toISOString()
    };
    await db.waterEntries.add(newWater);
  };

  const handleResetWater = async () => {
    if (confirm('Do you want to reset today\'s water intake history?')) {
      const entries = await db.waterEntries.where('date').equals(todayKey).toArray();
      for (let entry of entries) {
        await db.waterEntries.delete(entry.id);
      }
    }
  };

  // Weight logic
  const handleSaveWeight = async () => {
    const val = parseFloat(weightValue);
    if (isNaN(val) || val < 30 || val > 250) {
      alert('Please enter a valid weight (30 - 250 kg).');
      return;
    }

    const newWeight = {
      id: crypto.randomUUID(),
      date: todayKey,
      weight_kg: val,
      logged_at: new Date().toISOString()
    };

    try {
      await db.weightEntries.add(newWeight);
      await updateProfile({ current_weight_kg: val });
      setWeightValue('');
      setIsWeightModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const todayCarbs = loggedFoods.reduce((sum, food) => sum + food.net_carbs_g, 0);
  const carbLimit = profile?.daily_carb_limit_g || 20;

  return (
    <div className="fade-in space-y-5 pb-6 font-sans relative">
      
      {/* Greet & Streaks */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Welcome, {profile?.name}!</h2>
          <p className="text-slate-400 text-xs mt-0.5">Let's stay focused on our Keto goals today.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-fast/10 border border-accent-fast/20 text-accent-fast text-xs font-bold shadow-glow-fast/10">
          <Flame className="w-4 h-4 fill-accent-fast" />
          <span>{currentStreak} Day Streak</span>
        </div>
      </div>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="glass-card rounded-2xl p-4 border border-accent-primary/20 bg-accent-primary/5 flex items-center justify-between gap-4 fade-in">
          <div>
            <h4 className="text-xs font-bold text-slate-200">Install FastTrack App!</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Add to home screen for faster, offline access.</p>
          </div>
          <button
            onClick={handleInstallPWA}
            className="py-1.5 px-3.5 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition-all whitespace-nowrap shadow-glow-primary"
          >
            Install
          </button>
        </div>
      )}

      {/* 1. Active Fasting Widget */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-fast/10 flex items-center justify-center text-accent-fast">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Fasting Tracker</h3>
              <span className="text-[10px] text-slate-400">
                {activeSession ? 'Fasting session is currently active' : 'No active fasting session'}
              </span>
            </div>
          </div>
          {!activeSession && (
            <button
              onClick={() => navigate('/fast')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-accent-fast/10 hover:bg-accent-fast/20 text-accent-fast border border-accent-fast/20 transition-all"
            >
              Start Fast
            </button>
          )}
        </div>

        {activeSession && (
          <div className="flex flex-col items-center gap-4 pt-1 fade-in">
            <div
              onClick={() => navigate('/fast')}
              className="cursor-pointer transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
            >
              <CircularTimer
                elapsedSeconds={Math.round(elapsedHours * 3600)}
                targetHours={activeSession.target_duration_hours}
                size="w-44 h-44"
              />
            </div>
            <div className="w-full text-center">
              <span className="text-[10px] text-slate-400 italic">
                Stage: {getFastingStage(elapsedHours).label} ({getFastingStage(elapsedHours).description.slice(0, 40)}...)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Today's Carbs overview */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Today's Carb Intake</h3>
              <span className="text-[10px] text-slate-400">Goal: Max 20g recommended</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/food')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 transition-all"
          >
            View Food
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400">Today's carbs logged:</span>
          <span className={`font-bold font-mono ${todayCarbs > carbLimit ? 'text-accent-danger' : 'text-accent-primary'}`}>
            {todayCarbs.toFixed(1)}g / {carbLimit}g
          </span>
        </div>
      </div>

      {/* 3. Water Tracker */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 grid grid-cols-2 gap-4 items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <svg viewBox="0 0 100 120" className="w-20 h-24 drop-shadow-md">
              <path
                d="M15,10 L25,105 Q25,110 30,110 L70,110 Q75,110 75,105 L85,10"
                fill="#131926"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2"
              />
              <clipPath id="water-clip">
                <path d="M15,10 L25,105 Q25,110 30,110 L70,110 Q75,110 75,105 L85,10 Z" />
              </clipPath>
              <rect
                x="0"
                y={waterY}
                width="100"
                height="120"
                fill="#10b981"
                clipPath="url(#water-clip)"
                className="transition-all duration-700 ease-out fill-accent-primary opacity-80"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-white font-mono">{waterPercent}%</span>
              <span className="text-[8px] text-slate-400">Goal</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200">Water Tracker</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {totalWaterMl}ml / {dailyWaterGoal}ml
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddWater(250)}
                className="py-1.5 rounded-lg bg-surface-light hover:bg-[#1d273a] text-[10px] font-bold text-accent-primary transition-all text-center border border-white/5"
              >
                +250ml
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="py-1.5 rounded-lg bg-surface-light hover:bg-[#1d273a] text-[10px] font-bold text-accent-primary transition-all text-center border border-white/5"
              >
                +500ml
              </button>
            </div>
            <button
              onClick={() => handleAddWater(1000)}
              className="py-1.5 w-full rounded-lg bg-accent-primary hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition-all text-center"
            >
              +1 Liter
            </button>
            {totalWaterMl > 0 && (
              <button
                onClick={handleResetWater}
                className="text-[9px] text-slate-500 hover:text-slate-300 text-center"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Weight & Fasting Streak */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Logging Widget */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-36">
          <div className="flex items-center gap-1.5 text-accent-weight">
            <Scale className="w-4 h-4" />
            <span className="text-sm font-bold text-slate-200">Weight Tracker</span>
          </div>

          <div className="my-1.5">
            <span className="text-xl font-bold font-mono text-white block">
              {latestWeight ? `${latestWeight.weight_kg} kg` : '-- kg'}
            </span>
            <span className="text-[9px] text-slate-500">
              {latestWeight ? `Latest: ${formatDate(latestWeight.date)}` : 'No weight logged yet'}
            </span>
          </div>

          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-accent-weight/15 hover:bg-accent-weight/25 border border-accent-weight/20 text-accent-weight text-xs font-bold transition-all text-center"
          >
            Log Weight
          </button>
        </div>

        {/* Fasting Streak Widget */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-36">
          <div className="flex items-center gap-1.5 text-accent-fast">
            <Flame className="w-4 h-4 fill-accent-fast" />
            <span className="text-sm font-bold text-slate-200">Fasting Streak</span>
          </div>

          <div className="my-1.5">
            <span className="text-xl font-bold font-mono text-white block">
              {fastingStreak} {fastingStreak === 1 ? 'Day' : 'Days'}
            </span>
            <span className="text-[9px] text-slate-500">
              Min 16h per session
            </span>
          </div>

          <button
            onClick={() => navigate('/fast')}
            className="w-full py-2.5 rounded-xl bg-accent-fast/15 hover:bg-accent-fast/25 border border-accent-fast/20 text-accent-fast text-xs font-bold transition-all text-center"
          >
            View Fasting
          </button>
        </div>
      </div>

      {/* 5. Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-6 z-40">
        {isFabOpen && (
          <div className="mb-3 flex flex-col items-end gap-2.5 fade-in">
            <button
              onClick={() => {
                setIsFabOpen(false);
                navigate('/food');
              }}
              className="flex items-center gap-2 bg-surface-light border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all text-slate-200 text-xs font-semibold"
            >
              <Utensils className="w-3.5 h-3.5 text-accent-primary" />
              <span>Log Food</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                handleAddWater(250);
              }}
              className="flex items-center gap-2 bg-surface-light border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all text-slate-200 text-xs font-semibold"
            >
              <Droplet className="w-3.5 h-3.5 text-accent-primary" />
              <span>+250ml Water</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                setIsWeightModalOpen(true);
              }}
              className="flex items-center gap-2 bg-surface-light border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all text-slate-200 text-xs font-semibold"
            >
              <Scale className="w-3.5 h-3.5 text-accent-weight" />
              <span>Log Weight</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-950 font-bold transition-all duration-300 shadow-2xl hover:scale-105 ${
            isFabOpen 
              ? 'bg-slate-700 text-white rotate-45' 
              : 'bg-accent-primary shadow-glow-primary'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* 6. Weight Entry Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-white/5 space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200">Record Weight</h3>
              <button onClick={() => setIsWeightModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Today's Weight (kg)</label>
              <input
                type="number"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                placeholder="e.g., 77.5"
                step="0.1"
                className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-weight"
              />
            </div>

            <button
              onClick={handleSaveWeight}
              className="w-full py-2.5 px-4 rounded-xl bg-accent-weight hover:bg-cyan-400 text-slate-950 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Weight
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
