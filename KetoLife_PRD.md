# KetoLife BD — Product Requirements Document

> **Bengali-first Keto + Intermittent Fasting tracker PWA for Bangladesh**
> Version: 1.0
> Author: Mahbub Alam
> Stack: Vite + React + Tailwind + IndexedDB + PWA

---

## 1. Product Overview

**Name candidates:** KetoLife BD, কেটো খাতা, KetoFast, FastBangla
**Tagline:** "আপনার কেটো ও ফাস্টিং সঙ্গী"
**Type:** Progressive Web App (installable on Android/iOS/Desktop)
**Primary platform:** Mobile web → Add to Home Screen
**Languages:** Bengali (primary UI), English (settings/dev mode)

## 2. Problem Statement

Bengali-speaking adults practicing keto + intermittent fasting currently use:
- MyFitnessPal (English only, no Bangladeshi foods)
- Zero (timer only, no macros)
- Carb Manager (paywall, English, no local foods)

**Gap:** No Bengali-first app with Bangladeshi keto food database, IF timer, ketone tracking, and educational content in one place.

## 3. Goals & Non-Goals

**Goals (MVP):**
- Track fasting windows reliably
- Log food with net-carb focus
- Log ketone readings
- Track weight progress
- Provide Bengali education content
- Work fully offline (PWA + IndexedDB)
- Installable on Android home screen

**Non-Goals (MVP):**
- Cloud sync / multi-device
- Social features / community
- AI meal planning
- Barcode scanning
- Apple Health / Google Fit integration
- Subscription/paywall

## 4. Target Users

**Persona 1: "Rahim, 38, banker"**
- Follows Dr. Berg's YouTube for 6 months
- Does 18:6 fasting
- Wants to track ketones, struggles with English apps
- Needs Bangladeshi food data (eats ডিম, পনির, গরুর মাংস)

**Persona 2: "Shahana, 32, homemaker"**
- Reversing prediabetes via keto
- Reads Dr. Jason Fung's books
- Needs simple Bengali interface
- Family meal planning with keto-friendly local recipes

## 5. Core Features (MVP)

### 5.1 Fasting Timer
- Protocols: 16:8, 18:6, 20:4, 23:1 (OMAD), 24h, custom
- Start/stop with editable times
- Current stage indicator with Bengali labels:
  - 0–4h: "ডাইজেশন চলছে"
  - 4–12h: "ফ্যাট বার্নিং শুরু"
  - 12–18h: "কিটোসিস একটিভ"
  - 18–24h: "অটোফেজি একটিভ"
  - 24h+: "গভীর অটোফেজি"
- Last 30 fasts history
- Notification when fast ends (PWA push)

### 5.2 Food Log
- Pre-seeded Bangladeshi keto food database (~200 items):
  - Proteins: ডিম, ব্রয়লার, দেশি মুরগি, গরুর মাংস, খাসি, ইলিশ, রুই
  - Fats: ঘি, মাখন, নারিকেল তেল, অলিভ অয়েল
  - Veggies: শসা, লাউ, পালং, ব্রকলি, ফুলকপি, বেগুন
  - Dairy: পনির, দই, ক্রিম
  - Nuts: কাঠবাদাম, আখরোট
- Custom food entry
- Per-meal sections: First Meal / Second Meal / Snack
- Macros: net carbs, total carbs, fiber, fat, protein, kcal
- Visual warning if daily net carbs > 20g

### 5.3 Ketone Log
- Input: blood (mmol/L), urine (color/strip), breath (ppm)
- Color zones:
  - <0.5 mmol/L: "কিটোসিস নেই" (gray)
  - 0.5–1.5: "লাইট কিটোসিস" (yellow)
  - 1.5–3.0: "অপটিমাল কিটোসিস" (green)
  - >3.0: "ডিপ কিটোসিস" (orange)
- 7-day / 30-day trend chart

### 5.4 Water Intake
- Tap to add: 250ml, 500ml, 1L
- Daily goal (default 3L, configurable)
- Visual glass-fill animation

### 5.5 Weight Tracking
- Daily weight log
- Trend chart (weekly average)
- Goal weight + progress %

### 5.6 Dashboard
- All-in-one daily view
- Streak counter
- Today's stats summary
- Quick-add FAB

### 5.7 Education Section
- ~30 starter articles in Bengali:
  - Keto basics (what is ketosis, keto flu, electrolytes)
  - IF science (autophagy, growth hormone, insulin)
  - Bangladeshi keto recipes (5–10 recipes)
  - Troubleshooting (stalls, hunger, sleep)
- All original Bengali content

### 5.8 Achievements / Streaks
- First fast completed
- 7-day streak
- 30-day streak
- First ketone reading >1.5
- 5kg lost
- 100 fasts completed

## 6. Future Features (Phase 2+)

- Cloud backup (Firebase/Supabase)
- Recipe builder
- Meal planner
- Barcode scanner
- Apple Health / Google Fit sync
- Community feed
- AI Bengali Q&A assistant
- Premium tier

## 7. App Routes

```
/                       → Home Dashboard
/onboarding             → 4-step onboarding flow
/fast                   → Fasting timer (full screen)
/fast/history           → Past fasts list
/food                   → Today's food log
/food/add               → Add food item
/food/search            → Food database search
/food/custom            → Create custom food
/ketone                 → Ketone log + trend
/water                  → Water log
/weight                 → Weight log + trend
/stats                  → All charts + achievements
/learn                  → Education home
/learn/article/:id      → Article detail
/settings               → User settings
/settings/profile       → Profile edit
/settings/goals         → Goals edit
/settings/export        → Data export/import
```

## 8. Data Models (IndexedDB via Dexie.js)

```typescript
interface UserProfile {
  id: 'me';
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  primary_goal: 'weight_loss' | 'autophagy' | 'energy' | 'diabetes';
  fasting_protocol: '16:8' | '18:6' | '20:4' | 'OMAD' | 'custom';
  custom_fast_hours?: number;
  daily_carb_limit_g: number; // default 20
  daily_water_goal_ml: number; // default 3000
  onboarded_at: string;
}

interface FastingSession {
  id: string;
  protocol: string;
  start_time: string;
  end_time?: string;
  target_duration_hours: number;
  actual_duration_hours?: number;
  status: 'active' | 'completed' | 'broken';
  notes?: string;
}

interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: 'first_meal' | 'second_meal' | 'snack';
  food_id: string;
  food_name_bn: string;
  food_name_en: string;
  portion_g: number;
  net_carbs_g: number;
  total_carbs_g: number;
  fiber_g: number;
  fat_g: number;
  protein_g: number;
  kcal: number;
  logged_at: string;
}

interface FoodItem {
  id: string;
  name_bn: string;
  name_en: string;
  category: 'protein' | 'fat' | 'veggie' | 'dairy' | 'nuts' | 'drink' | 'other';
  per_100g: {
    net_carbs_g: number;
    total_carbs_g: number;
    fiber_g: number;
    fat_g: number;
    protein_g: number;
    kcal: number;
  };
  is_custom: boolean;
  is_keto_friendly: boolean;
}

interface KetoneReading {
  id: string;
  date: string;
  time: string;
  value: number;
  unit: 'mmol_L' | 'mg_dL' | 'urine_level' | 'ppm';
  method: 'blood' | 'urine' | 'breath';
  notes?: string;
}

interface WaterEntry {
  id: string;
  date: string;
  amount_ml: number;
  logged_at: string;
}

interface WeightEntry {
  id: string;
  date: string;
  weight_kg: number;
  logged_at: string;
}

interface Achievement {
  id: string;
  badge_id: string;
  earned_at: string;
}

interface Article {
  id: string;
  title_bn: string;
  category: 'basics' | 'science' | 'recipe' | 'troubleshoot';
  content_md: string;
  read_time_min: number;
  order: number;
}

interface ReadingProgress {
  article_id: string;
  read_at: string;
}
```

## 9. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Build | Vite | Fast HMR, simple PWA setup |
| Framework | React 18 | Familiar, large ecosystem |
| Language | JavaScript (JSX) | Faster for non-coder iteration |
| Styling | Tailwind CSS | Utility-first |
| Components | shadcn/ui (manual copy) | High-quality, customizable |
| State | Zustand | Lightweight |
| Storage | Dexie.js (IndexedDB) | Offline-first |
| Charts | Recharts | Easy React integration |
| Dates | date-fns | Lightweight |
| Routing | React Router v6 | Standard |
| PWA | vite-plugin-pwa (Workbox) | Service worker, manifest |
| Fonts | Hind Siliguri + Inter | Bengali + clean numbers |
| Icons | lucide-react | Lightweight |
| Deploy | Vercel | Standard deployment |

## 10. Folder Structure

```
ketolife-bd/
├── public/
│   ├── manifest.json
│   ├── icons/ (192, 512, maskable)
│   └── fonts/ (Hind Siliguri, Inter)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── routes.jsx
│   ├── components/
│   │   ├── ui/
│   │   ├── timer/
│   │   │   ├── CircularTimer.jsx
│   │   │   └── FastingStageIndicator.jsx
│   │   ├── food/
│   │   │   ├── FoodSearchBar.jsx
│   │   │   ├── FoodCard.jsx
│   │   │   └── MealSection.jsx
│   │   ├── charts/
│   │   ├── dashboard/
│   │   └── layout/
│   │       ├── BottomTabBar.jsx
│   │       └── PageHeader.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Fast.jsx
│   │   ├── Food.jsx
│   │   ├── Stats.jsx
│   │   ├── Learn.jsx
│   │   ├── Settings.jsx
│   │   └── Onboarding/
│   ├── db/
│   │   ├── dexie.js
│   │   ├── seedFoods.js
│   │   └── seedArticles.js
│   ├── store/
│   │   ├── userStore.js
│   │   ├── fastStore.js
│   │   └── settingsStore.js
│   ├── hooks/
│   │   ├── useFastingTimer.js
│   │   ├── useDailyStats.js
│   │   └── useStreak.js
│   ├── utils/
│   │   ├── dateHelpers.js
│   │   ├── macroCalc.js
│   │   └── bengaliNumber.js
│   ├── data/
│   │   ├── bangladeshi-foods.json
│   │   └── articles/
│   └── styles/
│       └── globals.css
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## 11. Bengali UI String Guidelines

- All UI text in Bengali script (never Banglish)
- Numbers in English digits (easier for data: 18:6, 2.5 mmol/L)
- Units in English (g, kg, ml, kcal, mmol/L)
- Action buttons short and direct: "শুরু করুন", "যোগ করুন", "সংরক্ষণ"
- No em dashes; use regular dashes or commas
- Conversational, warm tone (avoid clinical/formal Bengali)

## 12. PWA Requirements

- `manifest.json` with name, short_name, theme_color, icons
- Service worker via Workbox (cache-first for assets, network-first for data)
- Offline fallback page
- Install prompt after 3rd visit
- App icons: 192x192, 512x512, maskable variants
- Splash screen color matching theme
- `display: "standalone"`

## 13. Privacy & Data

- 100% local storage (IndexedDB)
- No backend, no analytics, no tracking (MVP)
- Manual JSON export for backup
- Manual JSON import for restore
- Privacy policy: "Your data never leaves your device"

## 14. Development Roadmap (4-week MVP)

**Week 1: Foundation**
- Vite + React + Tailwind + PWA setup
- Routing, layout, bottom tab bar
- Dexie schema + seed data
- Onboarding flow

**Week 2: Core trackers**
- Fasting timer (full feature)
- Food log + search
- Water + weight + ketone log

**Week 3: Dashboard + Stats**
- Home dashboard
- Charts (Recharts)
- Streaks + achievements
- Settings + export/import

**Week 4: Polish**
- Education section + seeded articles
- PWA install flow
- Performance optimization
- Vercel deployment
- Bug fixes

## 15. Success Metrics

- Install rate (PWA installs / visits)
- Day-7 retention
- Avg fasts logged per active user / week
- Food entries per active day
- Article completion rate

---

**END OF PRD v1.0**
