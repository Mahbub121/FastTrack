import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Timer, Utensils, BarChart3, Settings } from 'lucide-react';

export default function BottomTabBar() {
  const tabs = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/fast', label: 'Fasting', icon: Timer },
    { path: '/food', label: 'Food', icon: Utensils },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pt-2 bg-gradient-to-t from-[#090d16] via-[#090d16]/95 to-transparent">
      <div className="max-w-md mx-auto glass-card rounded-2xl p-1 flex justify-around items-center shadow-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-accent-primary bg-accent-primary/10 font-medium scale-105 shadow-glow-primary/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bengali tracking-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
