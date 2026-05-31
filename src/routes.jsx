import React, { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from './store/userStore';

// Components
import PageHeader from './components/layout/PageHeader';
import BottomTabBar from './components/layout/BottomTabBar';

// Page Placeholders
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding/Onboarding';
import Home from './pages/Home';
import Fast from './pages/Fast';
import Food from './pages/Food';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

// Auth Layout / Guard
export function AuthLayout() {
  const { authStatus, isOnboarded, isInitializing, initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-slate-400 font-sans">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mb-3"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (authStatus === 'authenticated' || authStatus === 'guest') {
    if (isOnboarded) {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return (
    <main className="min-h-screen w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-center bg-background">
      <Outlet />
    </main>
  );
}

// Protected App Wrapper (requires onboarding)
export function ProtectedLayout() {
  const { authStatus, isOnboarded, isInitializing, initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-slate-400 font-sans">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mb-3"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen pb-28 flex flex-col bg-background">
      <PageHeader />
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 overflow-y-auto">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}

// Onboarding Wrapper (only for non-onboarded users)
export function OnboardingLayout() {
  const { authStatus, isOnboarded, isInitializing, initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-slate-400 font-sans">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mb-3"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  if (isOnboarded) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen w-full max-w-md mx-auto px-4 py-6 flex flex-col bg-background">
      <Outlet />
    </main>
  );
}

// Router instantiation
export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: '', element: <Auth /> }
    ]
  },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      { path: '', element: <Onboarding /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'fast', element: <Fast /> },
      { path: 'fast/history', element: <Fast /> }, // Sub-routes reuse components
      { path: 'food', element: <Food /> },
      { path: 'food/add', element: <Food /> },
      { path: 'food/search', element: <Food /> },
      { path: 'stats', element: <Stats /> },
      { path: 'settings', element: <Settings /> },
      { path: 'settings/profile', element: <Settings /> },
      { path: 'settings/goals', element: <Settings /> },
      { path: 'settings/export', element: <Settings /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
