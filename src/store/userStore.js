import { create } from 'zustand';
import { db } from '../db/dexie';
import { seedFoods } from '../db/seedFoods';

export const useUserStore = create((set, get) => ({
  profile: null,
  isOnboarded: false,
  isInitializing: true,

  initializeUser: async () => {
    try {
      // Ensure pre-seeded food items are up-to-date
      await seedFoods();
      const user = await db.userProfile.get('me');
      if (user) {
        set({ profile: user, isOnboarded: true, isInitializing: false });
      } else {
        set({ profile: null, isOnboarded: false, isInitializing: false });
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      set({ isInitializing: false });
    }
  },

  setOnboarded: async (profileData) => {
    try {
      const finalProfile = {
        id: 'me',
        ...profileData,
        onboarded_at: new Date().toISOString()
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
  }
}));
