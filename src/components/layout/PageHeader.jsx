import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Flame, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

export default function PageHeader() {
  const { profile, authStatus, logoutUser } = useUserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    if (confirm("Are you sure you want to log out? Local data will be cleared unless synced to your cloud account.")) {
      try {
        await logoutUser();
        navigate('/auth');
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
  };

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light hover:bg-slate-800 border border-white/5 transition-all text-xs text-slate-300 font-medium select-none cursor-pointer"
          >
            <span className="font-sans max-w-[80px] truncate">{profile.name}</span>
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-accent-primary" />
            </div>
          </button>

          {/* Premium Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-slate-950/95 border border-white/10 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in z-50">
              {/* User Account Info */}
              <div className="px-2.5 py-2 border-b border-white/5 mb-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Account Type
                </p>
                <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1 mt-0.5">
                  {authStatus === 'authenticated' ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                      Cloud Synced
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"></span>
                      Guest (Offline)
                    </>
                  )}
                </p>
              </div>

              {/* Navigation Options */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings & Goals
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-all text-left cursor-pointer border-t border-white/5 mt-1 pt-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
