import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Flame, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, signUpWithEmail, loginWithGoogle, setGuestMode } = useUserStore();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      console.error(err);
      let friendlyMessage = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account already exists with this email.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'Password must be at least 6 characters.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setErrorMsg(friendlyMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Google Authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-primary to-emerald-400 flex items-center justify-center shadow-glow-primary mb-3">
          <Flame className="w-7 h-7 text-slate-950 font-bold" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          FastTrack
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 text-center">
          Your Premium Keto & Fasting Companion
        </p>
      </div>

      {/* Auth Box */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp 
                ? 'bg-gradient-to-r from-accent-primary to-amber-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isSignUp 
                ? 'bg-gradient-to-r from-accent-primary to-amber-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Errors Display */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400" htmlFor="name-input">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="name-input"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:border-accent-primary/40 focus:ring-1 focus:ring-accent-primary/40 outline-none text-sm text-slate-100 transition-all font-sans"
                  required={isSignUp}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400" htmlFor="email-input">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:border-accent-primary/40 focus:ring-1 focus:ring-accent-primary/40 outline-none text-sm text-slate-100 transition-all font-sans"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400" htmlFor="password-input">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:border-accent-primary/40 focus:ring-1 focus:ring-accent-primary/40 outline-none text-sm text-slate-100 transition-all font-sans"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-accent-primary to-amber-500 hover:from-amber-500 hover:to-accent-primary text-slate-950 text-sm font-bold shadow-glow-primary transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : isSignUp ? (
              'Create Premium Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-[1px] flex-1 bg-white/5"></div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Or</span>
          <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        {/* Social / Guest Logins */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            {/* Google Colorful Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={setGuestMode}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            Continue as Guest (Offline)
          </button>
        </div>
      </div>
    </div>
  );
}
