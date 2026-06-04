import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeContext, Theme, useTheme } from './lib/theme';
import { AuthContext, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OurStory from './pages/OurStory';
import Restaurant from './pages/Restaurant';
import BeachClub from './pages/BeachClub';
import Bar from './pages/Bar';
import Hotel from './pages/Hotel';
import Menu from './pages/Menu';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Manager from './pages/Manager';
import type { User } from '@supabase/supabase-js';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.rpc('track_page_view', {
          p_page_url: location.pathname,
          p_referrer: document.referrer,
          p_user_agent: navigator.userAgent
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname, user]);

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-sf-black text-white' : 'bg-white text-sf-black'
    }`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/beach-club" element={<BeachClub />} />
        <Route path="/bar" element={<Bar />} />
        <Route path="/hotel" element={<Hotel />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manager" element={<Manager />} />
      </Routes>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Apply theme class to HTML element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Get initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ user, isAdmin, loading }}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <Router>
            <AppContent />
          </Router>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}

export default App;