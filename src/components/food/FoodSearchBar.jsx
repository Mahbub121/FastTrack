import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { db } from '../../db/dexie';

export default function FoodSearchBar({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const matches = await db.foodItems
          .filter(item => 
            item.name_bn.toLowerCase().includes(query.toLowerCase()) || 
            item.name_en.toLowerCase().includes(query.toLowerCase())
          )
          .toArray();
        setResults(matches);
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-3 font-bengali">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food by name (e.g., Egg, Ghee...)"
          className="w-full bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-primary placeholder:text-slate-500"
        />
        <div className="absolute left-3.5 top-3 text-slate-500">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {results.length > 0 && (
        <div className="glass-card rounded-xl border border-white/5 max-h-52 overflow-y-auto divide-y divide-white/5 shadow-xl fade-in z-40 relative">
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => {
                onSelectFood(food);
                setQuery('');
                setResults([]);
              }}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-all text-xs"
            >
              <div>
                <span className="font-bold text-slate-200 block">
                  {food.name_en} <span className="text-slate-400 font-normal text-[10px]">({food.name_bn})</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Carbs: {food.per_100g.net_carbs_g}g
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  food.is_keto_friendly ? 'bg-accent-primary shadow-glow-primary' : 'bg-accent-danger'
                }`} title={food.is_keto_friendly ? 'Keto Friendly' : 'Not Keto Friendly'} />
              </div>
            </button>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && !loading && (
        <div className="p-4 text-center text-xs text-slate-500 border border-white/5 rounded-xl">
          No food matches found.
        </div>
      )}
    </div>
  );
}
