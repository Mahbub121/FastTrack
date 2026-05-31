import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { formatDate } from '../utils/dateHelpers';

export function useDailyStats(daysRange = 7) {
  return useLiveQuery(async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysRange);
      
      const yyyy = cutoffDate.getFullYear();
      const mm = String(cutoffDate.getMonth() + 1).padStart(2, '0');
      const dd = String(cutoffDate.getDate()).padStart(2, '0');
      const cutoffStr = `${yyyy}-${mm}-${dd}`;

      // Query weight entries after cutoff
      const weightList = await db.weightEntries
        .where('date')
        .aboveOrEqual(cutoffStr)
        .sortBy('date');

      // Query ketone readings after cutoff
      const ketoneList = await db.ketoneReadings
        .where('date')
        .aboveOrEqual(cutoffStr)
        .sortBy('date');

      // Format weights for chart rendering
      const formattedWeight = weightList.map(entry => ({
        dateRaw: entry.date,
        date: formatDate(entry.date),
        weight: entry.weight_kg
      }));

      // Format ketones for chart rendering
      const formattedKetones = ketoneList.map(entry => ({
        dateRaw: entry.date,
        date: formatDate(entry.date),
        value: entry.value,
        method: entry.method === 'blood' ? 'Blood' : entry.method === 'urine' ? 'Urine' : 'Breath'
      }));

      return {
        weightData: formattedWeight,
        ketoneData: formattedKetones
      };
    } catch (e) {
      console.error('Error fetching daily stats for charts:', e);
      return { weightData: [], ketoneData: [] };
    }
  }, [daysRange]) || { weightData: [], ketoneData: [] };
}
export default useDailyStats;
