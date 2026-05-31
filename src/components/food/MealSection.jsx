import React from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function MealSection({ title, mealKey, entries, onDeleteEntry, onAddFoodClick }) {
  // Aggregate macros for this specific meal
  const totals = entries.reduce(
    (acc, entry) => {
      acc.net_carbs_g = parseFloat((acc.net_carbs_g + entry.net_carbs_g).toFixed(1));
      acc.fat_g = parseFloat((acc.fat_g + entry.fat_g).toFixed(1));
      acc.protein_g = parseFloat((acc.protein_g + entry.protein_g).toFixed(1));
      acc.kcal += entry.kcal;
      return acc;
    },
    { net_carbs_g: 0, fat_g: 0, protein_g: 0, kcal: 0 }
  );

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3 font-sans">
      {/* Section Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Carbs: {totals.net_carbs_g}g • Fat: {totals.fat_g}g • Protein: {totals.protein_g}g • Calories: {totals.kcal}
          </span>
        </div>
        <button
          onClick={() => onAddFoodClick(mealKey)}
          className="p-1.5 hover:bg-white/5 rounded-lg text-accent-primary transition-all flex items-center gap-0.5 text-[10px] font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Entry List */}
      {entries.length === 0 ? (
        <p className="text-[11px] text-slate-500 py-1.5 text-center">No food logged for this meal yet.</p>
      ) : (
        <div className="divide-y divide-white/5">
          {entries.map((entry) => (
            <div key={entry.id} className="py-2.5 flex justify-between items-center text-xs transition-all">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">
                  {entry.food_name_en} <span className="text-slate-400 font-normal text-[10px]">({entry.food_name_bn})</span>
                </span>
                <div className="text-[10px] text-slate-400 font-mono">
                  {entry.portion_g}g • C:{entry.net_carbs_g}g/F:{entry.fat_g}g/P:{entry.protein_g}g/Cal:{entry.kcal}
                </div>
              </div>
              <button
                onClick={() => onDeleteEntry(entry.id)}
                className="p-1.5 hover:bg-accent-danger/10 text-slate-500 hover:text-accent-danger rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
