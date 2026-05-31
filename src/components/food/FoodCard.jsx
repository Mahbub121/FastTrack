import React, { useState, useEffect } from 'react';
import { getUnitInfo } from '../../utils/macroCalc';

export default function FoodCard({ foodItem, portionG, onChangePortion, selectedMeal, onChangeMeal, onLog, onCancel }) {
  if (!foodItem) return null;

  const unitInfo = getUnitInfo(foodItem);
  const [inputMode, setInputMode] = useState(unitInfo.hasUnit ? 'unit' : 'gram');
  const [localQty, setLocalQty] = useState('');
  const [localGrams, setLocalGrams] = useState('');

  const getEnglishUnitName = (bnUnit) => {
    if (bnUnit.includes('টি')) return 'pcs';
    if (bnUnit.includes('চামচ')) return 'tbsp';
    if (bnUnit.includes('পিস')) return 'pcs';
    return bnUnit;
  };
  const englishUnitName = getEnglishUnitName(unitInfo.unitName);

  // Sync inputs when portionG changes externally
  useEffect(() => {
    if (unitInfo.hasUnit) {
      const derived = portionG / unitInfo.unitWeightG;
      const roundedDerived = Number(derived.toFixed(2));
      setLocalQty(roundedDerived.toString());
    }
    setLocalGrams(portionG.toString());
  }, [portionG, foodItem, unitInfo.unitWeightG, unitInfo.hasUnit]);

  // Sync default input mode if food changes
  useEffect(() => {
    setInputMode(unitInfo.hasUnit ? 'unit' : 'gram');
  }, [foodItem, unitInfo.hasUnit]);

  const handleQtyChange = (val) => {
    setLocalQty(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onChangePortion(Math.round(num * unitInfo.unitWeightG));
    }
  };

  const handleGramsChange = (val) => {
    setLocalGrams(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onChangePortion(Math.round(num));
    }
  };

  const factor = portionG / 100;
  const netCarbs = (foodItem.per_100g.net_carbs_g * factor).toFixed(1);
  const fat = (foodItem.per_100g.fat_g * factor).toFixed(1);
  const protein = (foodItem.per_100g.protein_g * factor).toFixed(1);
  const fiber = (foodItem.per_100g.fiber_g * factor).toFixed(1);
  const kcal = Math.round(foodItem.per_100g.kcal * factor);

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 fade-in font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-base font-bold text-slate-200">
            {foodItem.name_en} <span className="text-slate-400 font-normal text-xs">({foodItem.name_bn})</span>
          </h4>
        </div>
        {unitInfo.hasUnit && (
          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-white/5 font-mono">
            1 {englishUnitName} ≈ {unitInfo.unitWeightG}g
          </span>
        )}
      </div>

      {/* Mode Selector (Unit vs Grams) */}
      {unitInfo.hasUnit && (
        <div className="flex bg-surface-light/40 border border-white/5 p-1 rounded-xl w-full">
          <button
            type="button"
            onClick={() => setInputMode('unit')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all text-center ${
              inputMode === 'unit'
                ? 'bg-accent-primary text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calc in {englishUnitName}
          </button>
          <button
            type="button"
            onClick={() => setInputMode('gram')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all text-center ${
              inputMode === 'gram'
                ? 'bg-accent-primary text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calc in grams (g)
          </button>
        </div>
      )}

      {/* Portion and Meal Select */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          {inputMode === 'unit' ? (
            <>
              <label className="text-[10px] text-slate-400 font-medium flex justify-between">
                <span>Qty ({englishUnitName})</span>
                {portionG > 0 && <span className="text-slate-500 font-mono">({portionG}g)</span>}
              </label>
              <input
                type="number"
                value={localQty}
                onChange={(e) => handleQtyChange(e.target.value)}
                className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                min="0.1"
                step="any"
              />
            </>
          ) : (
            <>
              <label className="text-[10px] text-slate-400 font-medium">Weight (grams)</label>
              <input
                type="number"
                value={localGrams}
                onChange={(e) => handleGramsChange(e.target.value)}
                className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                min="1"
              />
            </>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-medium">Meal Category</label>
          <select
            value={selectedMeal}
            onChange={(e) => onChangeMeal(e.target.value)}
            className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snacks</option>
          </select>
        </div>
      </div>

      {/* Macro Badges Grid */}
      <div className="grid grid-cols-5 gap-1.5 text-center text-slate-300">
        <div className="bg-surface-light/40 border border-white/5 p-1.5 rounded-xl">
          <span className="text-[9px] text-slate-400 block">Carbs</span>
          <span className="text-xs font-bold font-mono">{netCarbs}g</span>
        </div>
        <div className="bg-surface-light/40 border border-white/5 p-1.5 rounded-xl">
          <span className="text-[9px] text-slate-400 block">Fiber</span>
          <span className="text-xs font-bold font-mono">{fiber}g</span>
        </div>
        <div className="bg-surface-light/40 border border-white/5 p-1.5 rounded-xl">
          <span className="text-[9px] text-slate-400 block">Fat</span>
          <span className="text-xs font-bold font-mono text-accent-fast">{fat}g</span>
        </div>
        <div className="bg-surface-light/40 border border-white/5 p-1.5 rounded-xl">
          <span className="text-[9px] text-slate-400 block">Protein</span>
          <span className="text-xs font-bold font-mono text-accent-weight">{protein}g</span>
        </div>
        <div className="bg-surface-light/40 border border-white/5 p-1.5 rounded-xl">
          <span className="text-[9px] text-slate-400 block">Kcal</span>
          <span className="text-xs font-bold font-mono text-white">{kcal}</span>
        </div>
      </div>

      {/* Warnings if Non-Keto */}
      {!foodItem.is_keto_friendly && (
        <div className="p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-[10px] text-accent-danger leading-relaxed">
          <strong>Caution:</strong> This food is high in carbs and may not be suitable for a standard keto diet.
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-surface-light border border-white/5 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all text-center"
        >
          Cancel
        </button>
        <button
          onClick={onLog}
          className="flex-1 py-2.5 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 font-bold transition-all text-xs text-center shadow-glow-primary"
        >
          Save
        </button>
      </div>
    </div>
  );
}
