import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { Flame, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Onboarding() {
  const { setOnboarded } = useUserStore();
  const [step, setStep] = useState(1);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height_ft: '',
    height_in: '',
    current_weight_kg: '',
    target_weight_kg: '',
    activity_level: 'light',
    primary_goal: 'weight_loss',
    fasting_protocol: '16:8',
    custom_fast_hours: 18,
    daily_carb_limit_g: 20,
    daily_water_goal_ml: 3000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSelect = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) return 'Please enter your name.';
      if (formData.name.trim().length < 2) return 'Name must be at least 2 characters.';
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) return 'Please enter a valid age (10 - 100 years).';
      const feet = parseInt(formData.height_ft);
      const inches = parseInt(formData.height_in || '0');
      if (isNaN(feet) || feet < 1 || feet > 8) return 'Please enter a valid height in feet (1 - 8 ft).';
      if (isNaN(inches) || inches < 0 || inches > 11) return 'Please enter a valid height in inches (0 - 11 in).';
    }
    if (step === 2) {
      const weightNum = parseFloat(formData.current_weight_kg);
      if (isNaN(weightNum) || weightNum < 30 || weightNum > 250) return 'Please enter a valid weight (30 - 250 kg).';
      const targetWeightNum = parseFloat(formData.target_weight_kg);
      if (isNaN(targetWeightNum) || targetWeightNum < 30 || targetWeightNum > 250) return 'Please enter a valid target weight (30 - 250 kg).';
    }
    if (step === 3) {
      const carbLimit = parseInt(formData.daily_carb_limit_g);
      if (isNaN(carbLimit) || carbLimit < 5 || carbLimit > 150) return 'Carb budget must be between 5 and 150 grams.';
      if (formData.fasting_protocol === 'custom') {
        const customHours = parseInt(formData.custom_fast_hours);
        if (isNaN(customHours) || customHours < 1 || customHours > 24) return 'Custom fasting must be between 1 and 24 hours.';
      }
    }
    return '';
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSeeding(true);
    setError('');
    try {
      const feet = parseInt(formData.height_ft);
      const inches = parseInt(formData.height_in || '0');
      const totalInches = (feet * 12) + inches;
      const heightCm = Math.round(totalInches * 2.54 * 10) / 10;

      // Parse numerical fields to proper types
      const processedData = {
        ...formData,
        age: parseInt(formData.age),
        height_cm: heightCm,
        current_weight_kg: parseFloat(formData.current_weight_kg),
        target_weight_kg: parseFloat(formData.target_weight_kg),
        daily_carb_limit_g: parseInt(formData.daily_carb_limit_g),
        custom_fast_hours: formData.fasting_protocol === 'custom' ? parseInt(formData.custom_fast_hours) : undefined
      };
      
      // Seed DB and complete onboarding
      await setOnboarded(processedData);
    } catch (e) {
      console.error(e);
      setError('Database initialization failed. Please try again.');
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto font-sans">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-primary to-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
          <Flame className="w-7 h-7 text-slate-950 font-bold" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          FastTrack Setup
        </h1>
        <p className="text-slate-400 text-xs mt-1">Your first step towards a healthy & fit lifestyle</p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between mb-6 px-4">
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
              step >= num 
                ? 'bg-accent-primary border-accent-primary text-slate-950 shadow-glow-primary' 
                : 'border-white/10 text-slate-500 bg-surface'
            }`}>
              {num}
            </div>
            {num < 4 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all ${
                step > num ? 'bg-accent-primary' : 'bg-white/10'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-xs text-center fade-in">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="glass-card rounded-2xl p-6 shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-between">
        
        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4 fade-in">
            <h3 className="text-base font-bold text-slate-200 mb-2 border-b border-white/5 pb-2">Step 1: Personal Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Age (years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g., 35"
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Height</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="height_ft"
                    value={formData.height_ft}
                    onChange={handleChange}
                    placeholder="Ft"
                    min="1"
                    max="8"
                    className="w-full bg-surface-light border border-white/5 rounded-xl px-2.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary transition-all text-center"
                  />
                  <input
                    type="number"
                    name="height_in"
                    value={formData.height_in}
                    onChange={handleChange}
                    placeholder="In"
                    min="0"
                    max="11"
                    className="w-full bg-surface-light border border-white/5 rounded-xl px-2.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary transition-all text-center"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleSelect('gender', g)}
                    className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                      formData.gender === g
                        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                        : 'bg-surface-light border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Weight Metrics & Activity */}
        {step === 2 && (
          <div className="space-y-4 fade-in">
            <h3 className="text-base font-bold text-slate-200 mb-2 border-b border-white/5 pb-2">Step 2: Current Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Current Weight (kg)</label>
                <input
                  type="number"
                  name="current_weight_kg"
                  value={formData.current_weight_kg}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  step="0.1"
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Target Weight (kg)</label>
                <input
                  type="number"
                  name="target_weight_kg"
                  value={formData.target_weight_kg}
                  onChange={handleChange}
                  placeholder="e.g., 70"
                  step="0.1"
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Activity Level</label>
              <div className="space-y-2">
                {[
                  { value: 'sedentary', label: 'Sedentary (Little to no exercise)' },
                  { value: 'light', label: 'Lightly Active (Light exercise / walking)' },
                  { value: 'moderate', label: 'Moderately Active (Active / daily workout)' }
                ].map((act) => (
                  <button
                    key={act.value}
                    type="button"
                    onClick={() => handleSelect('activity_level', act.value)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs text-left border transition-all ${
                      formData.activity_level === act.value
                        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                        : 'bg-surface-light border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals & Fasting Protocol */}
        {step === 3 && (
          <div className="space-y-3.5 fade-in">
            <h3 className="text-base font-bold text-slate-200 mb-2 border-b border-white/5 pb-2">Step 3: Goals & Fasting</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Primary Goal</label>
                <select
                  name="primary_goal"
                  value={formData.primary_goal}
                  onChange={handleChange}
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="autophagy">Detox / Autophagy</option>
                  <option value="energy">Increase Energy</option>
                  <option value="diabetes">Blood Sugar Control</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Fasting Protocol</label>
                <select
                  name="fasting_protocol"
                  value={formData.fasting_protocol}
                  onChange={handleChange}
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                >
                  <option value="16:8">16:8 (Easy)</option>
                  <option value="18:6">18:6 (Medium)</option>
                  <option value="20:4">20:4 (Advanced)</option>
                  <option value="OMAD">OMAD (One Meal)</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>
            </div>

            {formData.fasting_protocol === 'custom' && (
              <div className="space-y-1 fade-in">
                <label className="text-xs text-slate-400 font-medium">Fasting Duration (Hours)</label>
                <input
                  type="number"
                  name="custom_fast_hours"
                  value={formData.custom_fast_hours}
                  onChange={handleChange}
                  placeholder="e.g., 18"
                  className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 font-medium">Daily Carb Budget (grams)</label>
                <span className="text-[10px] text-accent-danger font-medium font-sans">Max 20g recommended</span>
              </div>
              <input
                type="number"
                name="daily_carb_limit_g"
                value={formData.daily_carb_limit_g}
                onChange={handleChange}
                placeholder="e.g., 20"
                className="w-full bg-surface-light border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-accent-primary/5 border border-accent-primary/10 text-[10px] text-slate-400">
              <strong className="text-accent-primary">Keto Tip:</strong> While on keto, try to limit your daily net carbs to 20 grams or less.
            </div>
          </div>
        )}

        {/* Step 4: Final DB Seeding Preparation */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4 fade-in flex-1 flex flex-col justify-center items-center">
            {isSeeding ? (
              <div className="space-y-4">
                <div className="animate-spin w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Setting up database...</h3>
                  <p className="text-slate-500 text-xs mt-1">Loading Bangladeshi foods database. Please wait a few seconds...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto text-accent-primary border border-accent-primary/25">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">Setup Complete!</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Your fasting goals and diet parameters have been saved. Click the button below to start your Keto journey.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex gap-4 border-t border-white/5 pt-4 mt-4">
          {step > 1 && !isSeeding && (
            <button
              onClick={handlePrev}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-surface-light hover:bg-slate-800 border border-white/5 text-xs text-slate-400 hover:text-slate-200 transition-all font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 font-bold shadow-glow-primary transition-all text-xs"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            !isSeeding && (
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-emerald-400 text-slate-950 font-bold shadow-glow-primary transition-all text-xs"
              >
                Start
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
