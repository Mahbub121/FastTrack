import React, { useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, LineChart, Line } from 'recharts';
import { useUserStore } from '../../store/userStore';
import { useDailyStats } from '../../hooks/useDailyStats';

export default function StatsCharts() {
  const { profile } = useUserStore();
  const [daysRange, setDaysRange] = useState(7);

  const { weightData } = useDailyStats(daysRange);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card rounded-xl p-3 border border-white/10 text-xs font-mono shadow-xl text-slate-200">
          <p className="font-sans font-semibold mb-1 text-[10px] text-slate-400">{data.date}</p>
          <p>Weight: <span className="text-accent-weight font-bold">{payload[0].value} kg</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header and Period Filter */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-slate-300">
          Weight Progress Chart
        </span>
        <div className="flex gap-1.5 text-[10px] font-bold">
          {[7, 30].map((days) => (
            <button
              key={days}
              onClick={() => setDaysRange(days)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                daysRange === days
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="glass-card rounded-2xl p-4 shadow-xl border border-white/5 h-64 relative">
        {weightData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            No weight records logged yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
              {profile?.target_weight_kg && (
                <ReferenceLine y={profile.target_weight_kg} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Goal', fill: '#06b6d4', fontSize: 8, position: 'right' }} />
              )}
              <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
