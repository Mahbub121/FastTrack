import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { useUserStore } from '../store/userStore';
import FoodSearchBar from '../components/food/FoodSearchBar';
import FoodCard from '../components/food/FoodCard';
import MealSection from '../components/food/MealSection';
import { getTodayKey } from '../utils/dateHelpers';
import { calculateMacrosForPortion, sumDailyMacros, getUnitInfo } from '../utils/macroCalc';
import { Plus, AlertTriangle, X, Check } from 'lucide-react';

export default function Food() {
  const { profile } = useUserStore();
  const todayKey = getTodayKey();
  
  // Modals state
  const [activeMealKey, setActiveMealKey] = useState(null); // 'breakfast', 'lunch', 'dinner', 'snack'
  const [selectedFood, setSelectedFood] = useState(null);
  const [portionG, setPortionG] = useState(100);

  // Queries
  const loggedEntries = useLiveQuery(async () => {
    return await db.foodEntries.where('date').equals(todayKey).toArray();
  }, [todayKey]) || [];

  const handleAddFoodClick = (mealKey) => {
    setActiveMealKey(mealKey);
    setSelectedFood(null);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    const unitInfo = getUnitInfo(food);
    const defaultWeight = unitInfo.hasUnit ? (unitInfo.defaultQty * unitInfo.unitWeightG) : 100;
    setPortionG(defaultWeight);
  };

  const handleSaveFoodEntry = async () => {
    if (!selectedFood || !activeMealKey) return;
    
    const computedMacros = calculateMacrosForPortion(selectedFood, portionG);
    const newEntry = {
      id: crypto.randomUUID(),
      date: todayKey,
      meal: activeMealKey,
      food_id: selectedFood.id,
      food_name_bn: selectedFood.name_bn,
      food_name_en: selectedFood.name_en,
      portion_g: portionG,
      ...computedMacros,
      logged_at: new Date().toISOString()
    };

    try {
      await db.foodEntries.add(newEntry);
      // Close modal
      setActiveMealKey(null);
      setSelectedFood(null);
    } catch (e) {
      console.error('Failed to log food:', e);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await db.foodEntries.delete(id);
    } catch (e) {
      console.error('Failed to delete food entry:', e);
    }
  };



  // Calculations
  const dailyTotals = sumDailyMacros(loggedEntries);
  const carbLimit = profile?.daily_carb_limit_g || 20;
  const isCarbExceeded = dailyTotals.net_carbs_g > carbLimit;

  // Filter entries by meal
  const breakfastEntries = loggedEntries.filter((e) => e.meal === 'breakfast');
  const lunchEntries = loggedEntries.filter((e) => e.meal === 'lunch');
  const dinnerEntries = loggedEntries.filter((e) => e.meal === 'dinner');
  const snackEntries = loggedEntries.filter((e) => e.meal === 'snack');

  return (
    <div className="fade-in space-y-5 pb-6 font-sans">
      
      {/* 1. Daily Summary Card */}
      <div className="glass-card rounded-2xl p-5 shadow-xl border border-white/5 space-y-4">
        <h2 className="text-base font-bold text-slate-200">Daily Macros Summary</h2>
        
        {/* Net Carbs Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Net Carbs Budget</span>
            <span className={isCarbExceeded ? 'text-accent-danger' : 'text-accent-primary'}>
              {dailyTotals.net_carbs_g}g / {carbLimit}g
            </span>
          </div>
          <div className="w-full h-3 bg-surface-light rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCarbExceeded ? 'bg-accent-danger shadow-glow' : 'bg-accent-primary'
              }`}
              style={{ width: `${Math.min(100, (dailyTotals.net_carbs_g / carbLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Warning Badge */}
        {isCarbExceeded && (
          <div className="p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/25 text-accent-danger text-xs flex items-start gap-2 fade-in">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong>Warning!</strong> Your daily limit of {carbLimit}g net carbs has been exceeded. Try to choose low-carb options like eggs and green leafy vegetables.
            </p>
          </div>
        )}

        {/* Other Macros Bars */}
        <div className="grid grid-cols-3 gap-4 pt-1 text-slate-300">
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-400 block">Fat</span>
            <span className="text-xs font-bold font-mono text-accent-fast">{dailyTotals.fat_g}g</span>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-400 block">Protein</span>
            <span className="text-xs font-bold font-mono text-accent-weight">{dailyTotals.protein_g}g</span>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-400 block">Calories</span>
            <span className="text-xs font-bold font-mono text-white">{dailyTotals.kcal} kcal</span>
          </div>
        </div>
      </div>



      {/* 2. Meal Log Sections */}
      <div className="space-y-4">
        <MealSection
          title="Breakfast"
          mealKey="breakfast"
          entries={breakfastEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddFoodClick={handleAddFoodClick}
        />
        <MealSection
          title="Lunch"
          mealKey="lunch"
          entries={lunchEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddFoodClick={handleAddFoodClick}
        />
        <MealSection
          title="Dinner"
          mealKey="dinner"
          entries={dinnerEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddFoodClick={handleAddFoodClick}
        />
        <MealSection
          title="Snacks"
          mealKey="snack"
          entries={snackEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddFoodClick={handleAddFoodClick}
        />
      </div>

      {/* 3. Search & Log Modal Drawer */}
      {activeMealKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-white/5 space-y-4 fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200">
                Add to {activeMealKey === 'breakfast' ? 'Breakfast' : activeMealKey === 'lunch' ? 'Lunch' : activeMealKey === 'dinner' ? 'Dinner' : 'Snacks'}
              </h3>
              <button
                onClick={() => {
                  setActiveMealKey(null);
                  setSelectedFood(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedFood ? (
              <FoodCard
                foodItem={selectedFood}
                portionG={portionG}
                onChangePortion={setPortionG}
                selectedMeal={activeMealKey}
                onChangeMeal={setActiveMealKey}
                onLog={handleSaveFoodEntry}
                onCancel={() => setSelectedFood(null)}
              />
            ) : (
              <div className="space-y-4">
                <FoodSearchBar onSelectFood={handleSelectFood} />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
