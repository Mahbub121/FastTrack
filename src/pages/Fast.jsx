import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { useFastStore } from '../store/fastStore';
import CircularTimer from '../components/timer/CircularTimer';
import FastingStageIndicator from '../components/timer/FastingStageIndicator';
import { formatDate, formatTime, getHoursDiff } from '../utils/dateHelpers';
import { Play, Square, AlertCircle, Calendar, Clock, Edit2, Check, Trash2, X } from 'lucide-react';

export default function Fast() {
  const { activeSession, loadActiveSession, startFast, stopFast, editStartTime, isTimerLoading } = useFastStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProtocol, setSelectedProtocol] = useState('16:8');
  const [customHours, setCustomHours] = useState('18');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState('');
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [stopNotes, setStopNotes] = useState('');
  const [isBrokenFast, setIsBrokenFast] = useState(false);

  // Retroactive logging state
  const [useCustomStartTime, setUseCustomStartTime] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('');

  // Load history (last 30 completed/broken fasts)
  const fastingHistory = useLiveQuery(async () => {
    return await db.fastingSessions
      .where('status')
      .anyOf(['completed', 'broken'])
      .reverse()
      .limit(30)
      .toArray();
  });

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  // Handle active session ticker
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const start = new Date(activeSession.start_time).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - start) / 1000));
      setElapsedSeconds(diffSecs);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStart = () => {
    const startTimeISO = useCustomStartTime && customStartTime 
      ? new Date(customStartTime).toISOString() 
      : null;
    startFast(selectedProtocol, customHours, startTimeISO);
    setUseCustomStartTime(false);
    setCustomStartTime('');
  };

  const handleOpenEditModal = () => {
    if (!activeSession) return;
    // Format start time to YYYY-MM-DDTHH:MM for datetime-local input
    const date = new Date(activeSession.start_time);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
    setEditTimeValue(localISOTime);
    setIsEditModalOpen(true);
  };

  const handleSaveStartTime = async () => {
    if (!editTimeValue) return;
    await editStartTime(new Date(editTimeValue).toISOString());
    setIsEditModalOpen(false);
  };

  const handleEndFastClick = () => {
    if (!activeSession) return;
    const elapsedHrs = elapsedSeconds / 3600;
    const isBroken = elapsedHrs < activeSession.target_duration_hours;

    if (isBroken) {
      const confirmEnd = confirm("You haven't reached your goal yet. Are you sure you want to end your fast?");
      if (!confirmEnd) return;
    }

    setIsBrokenFast(isBroken);
    setStopNotes('');
    setIsStopModalOpen(true);
  };

  const handleSaveStopFast = async () => {
    await stopFast(stopNotes, isBrokenFast);
    setIsStopModalOpen(false);
  };

  const handleDeleteHistory = async (id) => {
    if (confirm('Do you want to delete this fasting session history?')) {
      await db.fastingSessions.delete(id);
    }
  };

  if (isTimerLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-sans">
        <div className="animate-spin w-8 h-8 border-2 border-accent-fast border-t-transparent rounded-full mb-3"></div>
        <span>Loading...</span>
      </div>
    );
  }

  const elapsedHours = elapsedSeconds / 3600;

  return (
    <div className="fade-in space-y-6 pb-6 font-sans">
      
      {/* 1. Timer Window */}
      {activeSession ? (
        <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-6 flex flex-col items-center">
          
          <div className="text-center">
            <span className="px-3 py-1 rounded-full bg-accent-fast/10 text-accent-fast text-xs font-bold uppercase tracking-wider">
              {activeSession.protocol === 'custom' ? `Custom (${activeSession.target_duration_hours}h)` : `${activeSession.protocol} Fast`}
            </span>
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Started: {formatDate(activeSession.start_time)} • {formatTime(activeSession.start_time)}
              <button 
                onClick={handleOpenEditModal}
                className="p-1.5 hover:bg-white/5 rounded-lg text-accent-fast transition-all"
                title="Edit Start Time"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>

          <CircularTimer elapsedSeconds={elapsedSeconds} targetHours={activeSession.target_duration_hours} />

          <div className="w-full">
            <FastingStageIndicator elapsedHours={elapsedHours} />
          </div>

          {/* Action button */}
          <div className="w-full">
            <button
              onClick={handleEndFastClick}
              className="w-full py-3 px-4 rounded-xl bg-accent-fast hover:bg-amber-400 text-slate-950 font-bold shadow-glow-fast transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Square className="w-4 h-4 fill-slate-950 text-transparent" />
              End Fast
            </button>
          </div>

        </div>
      ) : (
        /* 2. Choose Fast Protocol Screen */
        <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-100">Start New Fast</h2>
            <p className="text-slate-400 text-xs mt-1">Select a fasting schedule that fits your goals</p>
          </div>

          {/* Protocol Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: '16:8', name: '16:8 Protocol', hours: 16, desc: '16 hrs fasting, 8 hrs eating window' },
              { id: '18:6', name: '18:6 Protocol', hours: 18, desc: '18 hrs fasting, 6 hrs eating window' },
              { id: '20:4', name: '20:4 Protocol', hours: 20, desc: '20 hrs fasting, 4 hrs eating window' },
              { id: 'OMAD', name: 'OMAD Protocol', hours: 23, desc: '23 hrs fasting, 1 hr eating window' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProtocol(p.id)}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between h-28 ${
                  selectedProtocol === p.id
                    ? 'bg-accent-fast/10 border-accent-fast text-accent-fast'
                    : 'bg-surface-light border-white/5 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold text-sm">{p.name}</span>
                <span className="text-[10px] text-slate-400 font-normal leading-tight">{p.desc}</span>
              </button>
            ))}
          </div>

          {/* Custom Protocol Card */}
          <button
            onClick={() => setSelectedProtocol('custom')}
            className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
              selectedProtocol === 'custom'
                ? 'bg-accent-fast/10 border-accent-fast text-accent-fast'
                : 'bg-surface-light border-white/5 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div>
              <span className="font-bold text-sm block">Custom Protocol</span>
              <span className="text-[10px] text-slate-400">Set your own fasting duration in hours</span>
            </div>
            {selectedProtocol === 'custom' && (
              <div className="flex items-center gap-1.5 fade-in" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-12 bg-[#090d16] border border-accent-fast text-white text-center rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none"
                  min="1"
                  max="24"
                />
                <span className="text-xs text-slate-300">hrs</span>
              </div>
            )}
          </button>

          {/* Custom Start Time Picker */}
          <div className="space-y-2 bg-surface-light/40 border border-white/5 rounded-xl p-3.5 text-left">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useCustomStartTime}
                onChange={(e) => {
                  setUseCustomStartTime(e.target.checked);
                  if (e.target.checked) {
                    const defaultDate = new Date(Date.now() - 3600000); // 1 hour ago
                    const tzOffset = defaultDate.getTimezoneOffset() * 60000;
                    setCustomStartTime(new Date(defaultDate - tzOffset).toISOString().slice(0, 16));
                  } else {
                    setCustomStartTime('');
                  }
                }}
                className="rounded border-white/10 bg-slate-900 text-accent-fast focus:ring-accent-fast focus:ring-offset-0 focus:ring-1 w-4 h-4 accent-accent-fast"
              />
              <span className="text-xs font-semibold text-slate-200">Start Fast Retroactively</span>
            </label>
            
            {useCustomStartTime && (
              <div className="pt-2 flex flex-col gap-2 fade-in">
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-fast font-sans"
                    max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  />
                </div>
                <span className="text-[10px] text-slate-400 leading-normal">
                  Select the past date and time you started fasting to begin with accumulated elapsed time.
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 px-4 rounded-xl bg-accent-fast hover:bg-amber-400 text-slate-950 font-bold shadow-glow-fast transition-all text-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Start Fasting
          </button>
        </div>
      )}

      {/* 3. History Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 px-1">Fasting History (Last 30 sessions)</h3>
        
        {!fastingHistory || fastingHistory.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-xs text-slate-500 border border-white/5">
            No previous fasting sessions logged.
          </div>
        ) : (
          <div className="space-y-3">
            {fastingHistory.map((session) => {
              const start = new Date(session.start_time);
              const end = session.end_time ? new Date(session.end_time) : new Date();
              const hrs = session.actual_duration_hours || getHoursDiff(session.start_time, session.end_time);
              const isBroken = session.status === 'broken';

              return (
                <div key={session.id} className="glass-card rounded-xl p-4 flex justify-between items-center border border-white/5 relative overflow-hidden group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {session.protocol === 'custom' ? `Custom (${session.target_duration_hours}h)` : `${session.protocol}`}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isBroken 
                          ? 'bg-accent-danger/10 text-accent-danger' 
                          : 'bg-accent-primary/10 text-accent-primary'
                      }`}>
                        {isBroken ? 'Broken' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(session.start_time)} ({formatTime(session.start_time)} - {formatTime(session.end_time)})
                    </p>
                    {session.notes && (
                      <p className="text-[10px] text-slate-400 italic bg-white/5 px-2 py-1 rounded mt-1 max-w-[280px]">
                        Note: {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {hrs.toFixed(1)}h
                    </span>
                    <button
                      onClick={() => handleDeleteHistory(session.id)}
                      className="p-2 hover:bg-accent-danger/10 text-slate-500 hover:text-accent-danger rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adjust Start Time Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-white/5 space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200">Adjust Start Time</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">New Start Date & Time</label>
              <input
                type="datetime-local"
                value={editTimeValue}
                onChange={(e) => setEditTimeValue(e.target.value)}
                className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-fast"
              />
            </div>

            <button
              onClick={handleSaveStartTime}
              className="w-full py-2.5 px-4 rounded-xl bg-accent-fast hover:bg-amber-400 text-slate-950 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Start Time
            </button>
          </div>
        </div>
      )}

      {/* Stop Fast Notes Modal */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-white/5 space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200">
                {isBrokenFast ? 'Fast Broken?' : 'Complete Fasting Session'}
              </h3>
              <button onClick={() => setIsStopModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isBrokenFast 
                ? 'Was there a specific reason you broke your fast early? (e.g., extreme hunger, headache). You can write it down here.' 
                : 'Congratulations! Your fast was successfully completed. Log how you feel or what your first meal was below.'}
            </p>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Notes (Optional)</label>
              <textarea
                value={stopNotes}
                onChange={(e) => setStopNotes(e.target.value)}
                placeholder="How are you feeling..."
                rows="3"
                className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-fast resize-none"
              />
            </div>

            <button
              onClick={handleSaveStopFast}
              className="w-full py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Fasting Session
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
