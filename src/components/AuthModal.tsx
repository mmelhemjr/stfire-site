import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        onClose();
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={`w-full max-w-md rounded-xl shadow-2xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-900 to-sf-black border border-gray-800' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Sign In / Sign Up</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#D4AF37',
                    brandAccent: '#b39431',
                  },
                },
              },
            }}
            providers={[]}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}