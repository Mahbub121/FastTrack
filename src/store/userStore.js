import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { db } from '../db/dexie';
import { seedFoods } from '../db/seedFoods';
import { auth } from '../db/firebase';
import { syncLocalToCloud, syncCloudToLocal } from '../db/sync';

// 3-second timeout helper for promises to maintain an offline-first experience
const withTimeout = (promise, ms, label = "Operation") => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const useUserStore = create((set, get) => ({
  user: null,
  profile: null,
  isOnboarded: false,
  isInitializing: true,
  authStatus: 'loading', // 'loading' | 'authenticated' | 'guest' | 'unauthenticated'
  isListenerSetup: false,

  initializeUser: async () => {
    if (get().isListenerSetup) return;
    set({ isListenerSetup: true });

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        await seedFoods();
        
        if (firebaseUser) {
          // User is authenticated in Firebase
          let profile = await db.userProfile.get('me');
          
          const currentStoreUser = get().user;
          const isNewLogin = !currentStoreUser || currentStoreUser.uid !== firebaseUser.uid;
          
          if (isNewLogin) {
            // Step 1: Upload offline guest logs to cloud (3s timeout, catches failure gracefully)
            try {
              const hasLocalData = (await db.fastingSessions.count() > 0) || (await db.foodEntries.count() > 0);
              if (hasLocalData && !profile?.cloud_synced) {
                console.log("Guest logs found. Uploading to cloud...");
                await withTimeout(syncLocalToCloud(firebaseUser.uid), 3000, "syncLocalToCloud");
              }
            } catch (err) {
              console.warn("Sync local to cloud timed out or failed. Continuing to download history...", err);
            }

            // Step 2: Download user logs from Cloud Firestore (3s timeout, falls back to local data)
            try {
              console.log("Pulling user logs from cloud...");
              await withTimeout(syncCloudToLocal(firebaseUser.uid), 3000, "syncCloudToLocal");
              profile = await db.userProfile.get('me');
            } catch (err) {
              console.warn("Pulling cloud user logs timed out or failed. Falling back to local data...", err);
              profile = await db.userProfile.get('me');
            }
          }

          if (profile) {
            if (!profile.cloud_synced) {
              profile.cloud_synced = true;
              try {
                await db.userProfile.put(profile);
              } catch (err) {
                console.error("Failed to update profile cloud_synced flag locally", err);
              }
            }
            set({ 
              user: firebaseUser, 
              profile, 
              isOnboarded: true, 
              authStatus: 'authenticated'
            });
          } else {
            // Authenticated but onboarding is still required
            set({ 
              user: firebaseUser, 
              profile: null, 
              isOnboarded: false, 
              authStatus: 'authenticated'
            });
          }
        } else {
          // No user is authenticated. Check guest mode preference.
          const isGuest = localStorage.getItem('guest_mode') === 'true';
          if (isGuest) {
            const profile = await db.userProfile.get('me');
            set({ 
              user: null, 
              profile: profile || null, 
              isOnboarded: !!profile, 
              authStatus: 'guest'
            });
          } else {
            set({ 
              user: null, 
              profile: null, 
              isOnboarded: false, 
              authStatus: 'unauthenticated'
            });
          }
        }
      } catch (error) {
        console.error('Error during auth listener initialization:', error);
      } finally {
        // GUARANTEED execution to prevent indefinite loading screens
        set({ isInitializing: false });
      }
    });
  },

  setOnboarded: async (profileData) => {
    try {
      const currentUser = auth.currentUser;
      const finalProfile = {
        id: 'me',
        ...profileData,
        onboarded_at: new Date().toISOString(),
        cloud_synced: !!currentUser
      };
      
      // Save profile to Dexie
      await db.userProfile.put(finalProfile);
      
      // Execute database seeders
      await seedFoods();

      set({ profile: finalProfile, isOnboarded: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    if (!current) return;
    try {
      const updatedProfile = { ...current, ...updates };
      await db.userProfile.put(updatedProfile);
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isInitializing: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({ isInitializing: false });
      throw error;
    }
  },

  signUpWithEmail: async (email, password, name = '') => {
    set({ isInitializing: true });
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name && credential.user) {
        await firebaseUpdateProfile(credential.user, { displayName: name });
      }
      
      if (name) {
        const skeletonProfile = {
          id: 'me',
          name,
          email,
          created_at: new Date().toISOString()
        };
        await db.userProfile.put(skeletonProfile);
      }
    } catch (error) {
      set({ isInitializing: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ isInitializing: true });
    try {
      const provider = new GoogleAuthProvider();
      // Force popup sign-in block to cleanly execute and catch window/COOP errors
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Auth error caught:", error);
      
      // Map standard pop-up block/COOP codes to descriptive, friendly errors
      let friendlyError = "Google Authentication failed. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        friendlyError = "Sign-in cancelled. The Google popup was closed before completion.";
      } else if (error.code === 'auth/popup-blocked') {
        friendlyError = "Popup blocked! Please allow popups for this site in your browser settings.";
      } else if (error.code === 'auth/network-request-failed') {
        friendlyError = "Network error. Please check your internet connection.";
      } else if (
        (error.message && error.message.includes('cross-origin-opener-policy')) ||
        (error.code && error.code.includes('cross-origin'))
      ) {
        friendlyError = "Browser policies blocked the popup communication. Please try again, or use Email/Password sign-in.";
      }
      
      throw new Error(friendlyError);
    } finally {
      // Ensure loading state is reset even on unhandled window crashes or COOP restrictions
      set({ isInitializing: false });
    }
  },

  logoutUser: async () => {
    set({ isInitializing: true });
    try {
      await signOut(auth);
      localStorage.removeItem('guest_mode');
      
      // Clear all local Dexie database tables
      const tables = [
        'userProfile',
        'fastingSessions',
        'foodEntries',
        'foodItems',
        'waterEntries',
        'weightEntries',
        'achievements'
      ];
      for (const t of tables) {
        await db[t].clear();
      }

      set({ 
        user: null, 
        profile: null, 
        isOnboarded: false, 
        authStatus: 'unauthenticated', 
        isInitializing: false 
      });
    } catch (error) {
      set({ isInitializing: false });
      console.error('Logout failed:', error);
      throw error;
    }
  },

  setGuestMode: async () => {
    localStorage.setItem('guest_mode', 'true');
    const profile = await db.userProfile.get('me');
    set({ 
      user: null, 
      profile: profile || null, 
      isOnboarded: !!profile, 
      authStatus: 'guest' 
    });
  }
}));
