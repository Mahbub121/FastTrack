import { create } from 'zustand';
import { db } from '../db/dexie';

export const useFastStore = create((set, get) => ({
  activeSession: null,
  isTimerLoading: true,

  loadActiveSession: async () => {
    try {
      const active = await db.fastingSessions.where('status').equals('active').first();
      set({ activeSession: active || null, isTimerLoading: false });
    } catch (e) {
      console.error('Failed to load active session:', e);
      set({ isTimerLoading: false });
    }
  },

  startFast: async (protocol, customHours = 18, startTime = null) => {
    if (get().activeSession) return;

    let targetHours = 16;
    if (protocol === '16:8') targetHours = 16;
    else if (protocol === '18:6') targetHours = 18;
    else if (protocol === '20:4') targetHours = 20;
    else if (protocol === 'OMAD') targetHours = 23;
    else if (protocol === 'custom') targetHours = Number(customHours);

    const newSession = {
      id: crypto.randomUUID(),
      protocol,
      start_time: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      target_duration_hours: targetHours,
      status: 'active'
    };

    try {
      await db.fastingSessions.add(newSession);
      set({ activeSession: newSession });
    } catch (e) {
      console.error('Failed to start fast:', e);
    }
  },

  stopFast: async (notes = '', isBroken = false) => {
    const active = get().activeSession;
    if (!active) return;

    const endTime = new Date().toISOString();
    const diffMs = new Date(endTime) - new Date(active.start_time);
    const actualHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    const status = isBroken ? 'broken' : 'completed';

    const updatedSession = {
      ...active,
      end_time: endTime,
      actual_duration_hours: actualHours,
      status,
      notes
    };

    try {
      await db.fastingSessions.put(updatedSession);
      set({ activeSession: null });
    } catch (e) {
      console.error('Failed to stop fast:', e);
    }
  },

  editStartTime: async (newStartTime) => {
    const active = get().activeSession;
    if (!active) return;

    const updatedSession = {
      ...active,
      start_time: new Date(newStartTime).toISOString()
    };

    try {
      await db.fastingSessions.put(updatedSession);
      set({ activeSession: updatedSession });
    } catch (e) {
      console.error('Failed to update start time:', e);
    }
  }
}));
