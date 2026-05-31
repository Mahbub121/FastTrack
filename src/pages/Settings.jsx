import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { db } from '../db/dexie';
import { Download, Upload, DownloadCloud, Check, X, ShieldAlert } from 'lucide-react';
import { cmToFeetInches } from '../utils/dateHelpers';

export default function Settings() {
  const { profile, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);

  // PWA Install State
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Edit Goal Form State
  const [goalForm, setGoalForm] = useState({
    target_weight_kg: profile?.target_weight_kg || 70,
    daily_carb_limit_g: profile?.daily_carb_limit_g || 20,
    daily_water_goal_ml: profile?.daily_water_goal_ml || 3000,
    fasting_protocol: profile?.fasting_protocol || '16:8'
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setGoalForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveGoals = async () => {
    try {
      const parsed = {
        target_weight_kg: parseFloat(goalForm.target_weight_kg),
        daily_carb_limit_g: parseInt(goalForm.daily_carb_limit_g),
        daily_water_goal_ml: parseInt(goalForm.daily_water_goal_ml),
        fasting_protocol: goalForm.fasting_protocol
      };
      await updateProfile(parsed);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save profile goals:', e);
    }
  };

  // PWA installation check
  useEffect(() => {
    const checkInstallable = () => {
      if (window.deferredPrompt) {
        setShowInstallBtn(true);
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
    console.log(`PWA installation outcome in settings: ${outcome}`);
    window.deferredPrompt = null;
    setShowInstallBtn(false);
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const backup = {
        app: 'fasttrack',
        version: '1.0',
        exported_at: new Date().toISOString(),
        data: {
          userProfile: await db.userProfile.toArray(),
          fastingSessions: await db.fastingSessions.toArray(),
          foodEntries: await db.foodEntries.toArray(),
          foodItems: await db.foodItems.toArray(),
          waterEntries: await db.waterEntries.toArray(),
          weightEntries: await db.weightEntries.toArray(),
          achievements: await db.achievements.toArray()
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fasttrack-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export backup:', e);
      alert('Failed to generate backup file.');
    }
  };

  // Import JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.app !== 'fasttrack' && backup.app !== 'ketolife-bd') {
          alert('Invalid file! This is not a valid FastTrack backup file.');
          return;
        }

        const confirmMsg = 'Warning! Importing backup will overwrite all current local logs. Are you sure?';
        if (confirm(confirmMsg)) {
          await db.userProfile.clear();
          await db.fastingSessions.clear();
          await db.foodEntries.clear();
          await db.foodItems.clear();
          await db.waterEntries.clear();
          await db.weightEntries.clear();
          await db.achievements.clear();
          
          const d = backup.data;
          if (d.userProfile && d.userProfile.length > 0) await db.userProfile.bulkAdd(d.userProfile);
          if (d.fastingSessions && d.fastingSessions.length > 0) await db.fastingSessions.bulkAdd(d.fastingSessions);
          if (d.foodEntries && d.foodEntries.length > 0) await db.foodEntries.bulkAdd(d.foodEntries);
          if (d.foodItems && d.foodItems.length > 0) await db.foodItems.bulkAdd(d.foodItems);
          if (d.waterEntries && d.waterEntries.length > 0) await db.waterEntries.bulkAdd(d.waterEntries);
          if (d.weightEntries && d.weightEntries.length > 0) await db.weightEntries.bulkAdd(d.weightEntries);
          if (d.achievements && d.achievements.length > 0) await db.achievements.bulkAdd(d.achievements);

          alert('Backup successfully restored!');
          window.location.reload();
        }
      } catch (error) {
        console.error(error);
        alert('Error loading file. Please verify the backup file.');
      }
    };
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to delete all your data? This action is irreversible.')) {
      await db.userProfile.clear();
      await db.fastingSessions.clear();
      await db.foodEntries.clear();
      await db.foodItems.clear();
      await db.waterEntries.clear();
      await db.weightEntries.clear();
      await db.achievements.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fade-in space-y-5 pb-6 font-sans">
      
      {/* 1. Profile Goals Card */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h2 className="text-sm font-bold text-slate-200">My Profile & Goals</h2>
          <button
            onClick={() => {
              if (!isEditing) {
                setGoalForm({
                  target_weight_kg: profile?.target_weight_kg || 70,
                  daily_carb_limit_g: profile?.daily_carb_limit_g || 20,
                  daily_water_goal_ml: profile?.daily_water_goal_ml || 3000,
                  fasting_protocol: profile?.fasting_protocol || '16:8'
                });
              }
              setIsEditing(!isEditing);
            }}
            className="text-xs font-bold text-accent-primary hover:text-emerald-400 transition-all"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 text-xs fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Target Weight (kg)</label>
                <input
                  type="number"
                  name="target_weight_kg"
                  value={goalForm.target_weight_kg}
                  onChange={handleEditChange}
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                  step="0.1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Daily Carb Limit (g)</label>
                <input
                  type="number"
                  name="daily_carb_limit_g"
                  value={goalForm.daily_carb_limit_g}
                  onChange={handleEditChange}
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Daily Water Goal (ml)</label>
                <input
                  type="number"
                  name="daily_water_goal_ml"
                  value={goalForm.daily_water_goal_ml}
                  onChange={handleEditChange}
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Fasting Protocol</label>
                <select
                  name="fasting_protocol"
                  value={goalForm.fasting_protocol}
                  onChange={handleEditChange}
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                >
                  <option value="16:8">16:8 Protocol</option>
                  <option value="18:6">18:6 Protocol</option>
                  <option value="20:4">20:4 Protocol</option>
                  <option value="OMAD">OMAD Protocol</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveGoals}
              className="w-full mt-2 py-2 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 font-bold transition-all text-xs flex items-center justify-center gap-1 shadow-glow-primary"
            >
              <Check className="w-4 h-4" />
              Save Goals
            </button>
          </div>
        ) : (
          profile && (
            <div className="space-y-2.5 text-xs text-slate-300">
              <p><strong>Username:</strong> {profile.name}</p>
              <p><strong>Age & Gender:</strong> {profile.age} years • {profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Other'}</p>
              <p><strong>Height & Weight:</strong> {cmToFeetInches(profile.height_cm)} • {profile.current_weight_kg} kg</p>
              <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <p>Target Weight: <span className="text-white font-bold">{profile.target_weight_kg} kg</span></p>
                <p>Carb Limit: <span className="text-white font-bold">{profile.daily_carb_limit_g} g</span></p>
                <p>Water Goal: <span className="text-white font-bold">{profile.daily_water_goal_ml} ml</span></p>
                <p>Fasting Schedule: <span className="text-white font-bold">{profile.fasting_protocol}</span></p>
              </div>
              
              {/* Settings direct install shortcut */}
              {showInstallBtn && (
                <div className="border-t border-white/5 pt-3">
                  <button
                    onClick={handleInstallPWA}
                    className="w-full py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all text-center shadow-glow-primary flex items-center justify-center gap-1.5"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Add shortcut to home screen (Install App)
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* 2. Export / Import Backup Section */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Data Backup & Restore</h2>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          All your logs are stored 100% locally on your device (IndexedDB). Export the backup file to safeguard your history or transfer it to another device.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-4 rounded-xl bg-surface-light hover:bg-[#1d273a] border border-white/5 text-xs text-slate-300 hover:text-white transition-all font-bold flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-accent-primary" />
            Export Backup
          </button>

          <label className="py-2.5 px-4 rounded-xl bg-surface-light hover:bg-[#1d273a] border border-white/5 text-xs text-slate-300 hover:text-white transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Danger Zone */}
      <div className="glass-card rounded-2xl p-5 border border-accent-danger/10 bg-accent-danger/5 space-y-4">
        <div className="flex items-center gap-1.5 text-accent-danger font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Danger Zone</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          This action will permanently delete all logs, weight history, and fasting sessions. You will need to complete the setup process again.
        </p>
        <button
          onClick={handleReset}
          className="w-full py-2.5 px-4 rounded-xl bg-accent-danger/15 hover:bg-accent-danger/25 border border-accent-danger/20 text-accent-danger text-xs font-bold transition-all text-center"
        >
          Reset Profile (Delete All Data)
        </button>
      </div>

    </div>
  );
}
