export function calculateMacrosForPortion(foodItem, portionG) {
  if (!foodItem || !foodItem.per_100g) {
    return { net_carbs_g: 0, total_carbs_g: 0, fiber_g: 0, fat_g: 0, protein_g: 0, kcal: 0 };
  }
  const factor = portionG / 100;
  const { net_carbs_g, total_carbs_g, fiber_g, fat_g, protein_g, kcal } = foodItem.per_100g;

  return {
    net_carbs_g: parseFloat((net_carbs_g * factor).toFixed(1)),
    total_carbs_g: parseFloat((total_carbs_g * factor).toFixed(1)),
    fiber_g: parseFloat((fiber_g * factor).toFixed(1)),
    fat_g: parseFloat((fat_g * factor).toFixed(1)),
    protein_g: parseFloat((protein_g * factor).toFixed(1)),
    kcal: Math.round(kcal * factor)
  };
}

export function sumDailyMacros(entries) {
  return entries.reduce(
    (acc, entry) => {
      acc.net_carbs_g = parseFloat((acc.net_carbs_g + entry.net_carbs_g).toFixed(1));
      acc.total_carbs_g = parseFloat((acc.total_carbs_g + entry.total_carbs_g).toFixed(1));
      acc.fiber_g = parseFloat((acc.fiber_g + entry.fiber_g).toFixed(1));
      acc.fat_g = parseFloat((acc.fat_g + entry.fat_g).toFixed(1));
      acc.protein_g = parseFloat((acc.protein_g + entry.protein_g).toFixed(1));
      acc.kcal = acc.kcal + entry.kcal;
      return acc;
    },
    { net_carbs_g: 0, total_carbs_g: 0, fiber_g: 0, fat_g: 0, protein_g: 0, kcal: 0 }
  );
}

export function getUnitInfo(foodItem) {
  if (!foodItem) return { hasUnit: false, unitName: 'গ্রাম', unitWeightG: 1, defaultQty: 100, isGramDefault: true };

  const id = foodItem.id || '';
  const nameBn = foodItem.name_bn || '';
  const nameEn = foodItem.name_en || '';

  // 1. Eggs
  if (id.includes('egg') || nameBn.includes('ডিম') || nameEn.toLowerCase().includes('egg')) {
    const isFried = id.includes('fried') || nameBn.includes('ভাজি');
    return {
      hasUnit: true,
      unitName: 'টি',
      unitWeightG: isFried ? 60 : 50,
      defaultQty: 1,
      isGramDefault: false
    };
  }

  // 2. Roti
  if (id.includes('roti') || nameBn.includes('রুটি') || nameEn.toLowerCase().includes('roti')) {
    return {
      hasUnit: true,
      unitName: 'টি',
      unitWeightG: 50,
      defaultQty: 1,
      isGramDefault: false
    };
  }

  // 3. Oils / Ghee / Butter (tbsp/spoon/cube)
  if (id === 'ghee' || nameBn.includes('ঘি')) {
    return {
      hasUnit: true,
      unitName: 'চামচ',
      unitWeightG: 14,
      defaultQty: 1,
      isGramDefault: false
    };
  }
  if (id === 'butter' || nameBn.includes('মাখন')) {
    return {
      hasUnit: true,
      unitName: 'পিস (১০ গ্রাম)',
      unitWeightG: 10,
      defaultQty: 1,
      isGramDefault: false
    };
  }
  if (id.includes('oil') || nameBn.includes('তেল') || nameEn.toLowerCase().includes('oil')) {
    return {
      hasUnit: true,
      unitName: 'চামচ',
      unitWeightG: 14,
      defaultQty: 1,
      isGramDefault: false
    };
  }

  // 4. Veggies (Cucumber, Tomato)
  if (id === 'cucumber' || nameBn.includes('শসা')) {
    return {
      hasUnit: true,
      unitName: 'টি (মাঝারি)',
      unitWeightG: 100,
      defaultQty: 1,
      isGramDefault: false
    };
  }
  if (id === 'tomato' || nameBn.includes('টমেটো')) {
    return {
      hasUnit: true,
      unitName: 'টি (মাঝারি)',
      unitWeightG: 100,
      defaultQty: 1,
      isGramDefault: false
    };
  }

  // 5. Nuts (Piece-based but default to multiple)
  if (id === 'almonds' || nameBn.includes('কাঠবাদাম')) {
    return {
      hasUnit: true,
      unitName: 'টি',
      unitWeightG: 1.2,
      defaultQty: 10,
      isGramDefault: false
    };
  }
  if (id === 'walnuts' || nameBn.includes('আখরোট')) {
    return {
      hasUnit: true,
      unitName: 'টি',
      unitWeightG: 4,
      defaultQty: 5,
      isGramDefault: false
    };
  }
  if (id === 'peanuts' || nameBn.includes('চিনাবাদাম')) {
    return {
      hasUnit: true,
      unitName: 'টি',
      unitWeightG: 1,
      defaultQty: 25,
      isGramDefault: false
    };
  }
  if (id === 'chia_seeds' || nameBn.includes('চিয়া সিড')) {
    return {
      hasUnit: true,
      unitName: 'চামচ',
      unitWeightG: 10,
      defaultQty: 1,
      isGramDefault: false
    };
  }

  // General weight-based defaults
  return {
    hasUnit: false,
    unitName: 'গ্রাম',
    unitWeightG: 1,
    defaultQty: 100,
    isGramDefault: true
  };
}
