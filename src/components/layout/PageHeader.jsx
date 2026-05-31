import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Flame } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

export default function PageHeader() {
  const { profile } = useUserStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full glass-header px-4 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-emerald-400 flex items-center justify-center shadow-glow-primary">
          <Flame className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          FastTrack
        </h1>
      </div>
      
      {profile && (
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light hover:bg-slate-800 border border-white/5 transition-all text-xs text-slate-300 font-medium"
        >
          <span className="font-bengali max-w-[80px] truncate">{profile.name}</span>
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-accent-primary" />
          </div>
        </button>
      )}
    </header>
  );
}
