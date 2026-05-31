import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';

export function useStreak() {
  return useLiveQuery(async () => {
    try {
      const fasts = await db.fastingSessions.toArray();
      const foods = await db.foodEntries.toArray();
      const water = await db.waterEntries.toArray();
      const weight = await db.weightEntries.toArray();

      const activeDates = new Set();

      const formatDateKey = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
      };

      fasts.forEach(f => activeDates.add(formatDateKey(f.start_time)));
      foods.forEach(f => activeDates.add(f.date)); 
      water.forEach(w => activeDates.add(w.date)); 
      weight.forEach(w => activeDates.add(w.date)); 

      if (activeDates.size === 0) return 0;

      // Start counting consecutive days backwards
      const today = new Date();
      let currentCheck = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const getCheckKey = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const todayKey = getCheckKey(currentCheck);
      
      const yesterday = new Date(currentCheck);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getCheckKey(yesterday);

      let startCheckDate;
      if (activeDates.has(todayKey)) {
        startCheckDate = currentCheck;
      } else if (activeDates.has(yesterdayKey)) {
        startCheckDate = yesterday;
      } else {
        return 0;
      }

      let streak = 0;
      let check = new Date(startCheckDate);
      
      let iterations = 0;
      while (iterations < 365) {
        const key = getCheckKey(check);
        if (activeDates.has(key)) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else {
          break;
        }
        iterations++;
      }

      return streak;
    } catch (e) {
      console.error('Error calculating streak:', e);
      return 0;
    }
  }) || 0;
}

export function useFastingStreak() {
  return useLiveQuery(async () => {
    try {
      const fasts = await db.fastingSessions.toArray();
      const fastedDates = new Set();

      fasts.forEach(f => {
        if (f.end_time && f.actual_duration_hours >= 16) {
          fastedDates.add(f.end_time.split('T')[0]);
        }
      });

      if (fastedDates.size === 0) return 0;

      const today = new Date();
      let currentCheck = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const getCheckKey = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const todayKey = getCheckKey(currentCheck);
      
      const yesterday = new Date(currentCheck);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getCheckKey(yesterday);

      let startCheckDate;
      if (fastedDates.has(todayKey)) {
        startCheckDate = currentCheck;
      } else if (fastedDates.has(yesterdayKey)) {
        startCheckDate = yesterday;
      } else {
        return 0;
      }

      let streak = 0;
      let check = new Date(startCheckDate);
      
      let iterations = 0;
      while (iterations < 365) {
        const key = getCheckKey(check);
        if (fastedDates.has(key)) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else {
          break;
        }
        iterations++;
      }

      return streak;
    } catch (e) {
      console.error('Error calculating fasting streak:', e);
      return 0;
    }
  }) || 0;
}
