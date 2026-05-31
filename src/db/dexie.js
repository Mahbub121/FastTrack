import Dexie from 'dexie';
import { setupSyncHooks } from './sync';

export const db = new Dexie('KetoLifeDB');

// Define database tables and schemas based on the PRD
db.version(1).stores({
  userProfile: 'id',
  fastingSessions: 'id, start_time, status',
  foodEntries: 'id, date, meal',
  foodItems: 'id, name_bn, name_en, category, is_custom',
  waterEntries: 'id, date',
  weightEntries: 'id, date',
  achievements: 'id'
});

// Register Cloud sync hooks
setupSyncHooks();

export default db;

