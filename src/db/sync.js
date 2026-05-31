import { doc, setDoc, deleteDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { db } from './dexie';
import { auth, dbFirestore } from './firebase';

// Prevent circular loops when pulling data from Firestore and writing to Dexie
let isSyncingFromCloud = false;

export function setSyncingFromCloud(val) {
  isSyncingFromCloud = val;
}

export function isSyncingActive() {
  return isSyncingFromCloud;
}

// Global helper to recursively strip any undefined values from payloads before writing to Firestore
function sanitizeFirestoreData(obj) {
  if (obj === null || obj === undefined) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeFirestoreData(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key];
        if (val !== undefined) {
          sanitized[key] = sanitizeFirestoreData(val);
        }
      }
    }
    return sanitized;
  }
  
  return obj;
}

// 1. Setup local Dexie hooks to push changes to Firestore automatically when logged in
export function setupSyncHooks() {
  const tables = [
    'userProfile',
    'fastingSessions',
    'foodEntries',
    'foodItems',
    'waterEntries',
    'weightEntries',
    'achievements'
  ];

  tables.forEach(tableName => {
    // Stage 1: Creating hook
    db[tableName].hook('creating', (primKey, obj) => {
      if (isSyncingFromCloud) return;
      const currentUser = auth.currentUser;
      if (currentUser && auth.currentUser.email !== 'placeholder') {
        const docId = String(primKey);
        const docRef = doc(dbFirestore, `users/${currentUser.uid}/${tableName}`, docId);
        // Push to Firestore asynchronously with sanitization
        setDoc(docRef, sanitizeFirestoreData(obj), { merge: true }).catch(err => {
          console.error(`Sync error: Failed to save ${tableName}/${docId} to cloud`, err);
        });
      }
    });

    // Stage 2: Updating hook
    db[tableName].hook('updating', (mods, primKey, obj) => {
      if (isSyncingFromCloud) return;
      const currentUser = auth.currentUser;
      if (currentUser && auth.currentUser.email !== 'placeholder') {
        const docId = String(primKey);
        const docRef = doc(dbFirestore, `users/${currentUser.uid}/${tableName}`, docId);
        const mergedObj = { ...obj, ...mods };
        // Push to Firestore with sanitization
        setDoc(docRef, sanitizeFirestoreData(mergedObj), { merge: true }).catch(err => {
          console.error(`Sync error: Failed to update ${tableName}/${docId} in cloud`, err);
        });
      }
    });

    // Stage 3: Deleting hook
    db[tableName].hook('deleting', (primKey) => {
      if (isSyncingFromCloud) return;
      const currentUser = auth.currentUser;
      if (currentUser && auth.currentUser.email !== 'placeholder') {
        const docId = String(primKey);
        const docRef = doc(dbFirestore, `users/${currentUser.uid}/${tableName}`, docId);
        deleteDoc(docRef).catch(err => {
          console.error(`Sync error: Failed to delete ${tableName}/${docId} from cloud`, err);
        });
      }
    });
  });
}

// 2. Push local guest data to Firestore when the user signs up / logs in
export async function syncLocalToCloud(uid) {
  if (!uid) return;
  const tables = [
    'userProfile',
    'fastingSessions',
    'foodEntries',
    'foodItems',
    'waterEntries',
    'weightEntries',
    'achievements'
  ];

  for (const tableName of tables) {
    const items = await db[tableName].toArray();
    if (items.length === 0) continue;

    const batch = writeBatch(dbFirestore);
    let size = 0;

    for (const item of items) {
      const docId = tableName === 'userProfile' ? 'me' : String(item.id);
      const docRef = doc(dbFirestore, `users/${uid}/${tableName}`, docId);
      // Clean undefined fields in items
      batch.set(docRef, sanitizeFirestoreData(item), { merge: true });
      size++;

      if (size >= 400) {
        await batch.commit();
        size = 0;
      }
    }

    if (size > 0) {
      await batch.commit();
    }
  }
}

// 3. Download data first and then write locally (preserves offline data if sync fails)
export async function syncCloudToLocal(uid) {
  if (!uid) return;
  
  const tables = [
    'userProfile',
    'fastingSessions',
    'foodEntries',
    'foodItems',
    'waterEntries',
    'weightEntries',
    'achievements'
  ];

  try {
    const fetchedData = {};

    // Step 1: Fetch all data from the cloud collections first
    for (const tableName of tables) {
      const colRef = collection(dbFirestore, `users/${uid}/${tableName}`);
      const querySnapshot = await getDocs(colRef);
      
      const items = [];
      querySnapshot.forEach(doc => {
        items.push(doc.data());
      });
      fetchedData[tableName] = items;
    }

    // Step 2: Clear local database and write downloaded data only after a successful fetch
    isSyncingFromCloud = true;
    for (const tableName of tables) {
      await db[tableName].clear();
      const items = fetchedData[tableName];
      if (items.length > 0) {
        await db[tableName].bulkPut(items);
      }
    }
  } catch (error) {
    console.error("Sync error: Failed to download database from Cloud", error);
    throw error;
  } finally {
    isSyncingFromCloud = false;
  }
}
