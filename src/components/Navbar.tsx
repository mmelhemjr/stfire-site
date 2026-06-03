import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, BarChart3, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, isAdmin } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch user profile image when user is available
  React.useEffect(() => {
    async function fetchProfileImage() {
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('profile_image')
          .eq('id', user.id)
          .single();
        
        if (data?.profile_image) {
          setProfileImage(data.profile_image);
        }
      }
    }
    fetchProfileImage();
  }, [user]);

  const menuItems = [
    { path: '/our-story', label: 'Our Story' },
    { path: '/restaurant', label: t('common.restaurant') },
    { path: '/beach-club', label: t('common.beach_club') },
    { path: '/bar', label: t('common.bar') },
    { path: '/hotel', label: t('common.hotel') },
    { path: 'https://qrco.de/bfAHw9', label: t('common.menu'), external: true },
    ...(user ? [{ path: '/bookings', label: t('common.manage_bookings') }] : []),
    ...(isAdmin ? [
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/manager', label: 'Manager Dashboard', icon: LayoutDashboard }
    ] : []),
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const navBgClass = theme === 'dark' 
    ? 'bg-black/50 backdrop-blur-md' 
    : 'bg-white/50 backdrop-blur-md shadow-sm';

  return (
    <>
      <nav className={`fixed w-full z-[1000] ${navBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-26 items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://imgur.com/897KeEZ.jpg" 
                alt="Saint Fire Logo" 
                className={`h-16 object-contain ${theme === 'dark' ? 'brightness-200' : 'brightness-75'}`}
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
              {user ? (
                <div className="relative group">
                  <button
                    className="p-2 rounded-md hover:text-sf-gold transition flex items-center space-x-2"
                  >
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6" />
                    )}
                    <span className="hidden md:inline">{user.email}</span>
                  </button>
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                  } ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-in-out`}>
                    <div className="py-1">
                      {isAdmin && (
                        <div className="px-4 py-2 text-sm text-sf-gold">Admin Access</div>
                      )}
                      <Link
                        to="/profile"
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-800' 
                            : 'hover:bg-gray-100'
                        } transition`}
                      >
                        Profile Settings
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            to="/analytics"
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-800' 
                                : 'hover:bg-gray-100'
                            } transition`}
                          >
                            Analytics
                          </Link>
                          <Link
                            to="/manager"
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-800' 
                                : 'hover:bg-gray-100'
                            } transition`}
                          >
                            Manager Dashboard
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleSignOut}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-800' 
                            : 'hover:bg-gray-100'
                        } transition`}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 rounded-md hover:text-sf-gold transition"
                >
                  <UserCircle className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md hover:text-sf-gold transition"
              >
                <Menu className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 transition-transform duration-500 z-[1000] ${
          theme === 'dark' ? 'bg-black' : 'bg-white'
        } ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center h-24 px-4">
            <Link 
              to="/" 
              className="flex items-center"
              onClick={toggleMenu}
            >
              <img 
                src="https://imgur.com/897KeEZ.jpg" 
                alt="Saint Fire Logo" 
                className={`h-16 object-contain ${theme === 'dark' ? 'brightness-200' : 'brightness-75'}`}
              />
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 hover:text-sf-gold transition"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 space-y-8">
            {menuItems.map((item, index) => (
              item.external ? (
                <a
                  key={index}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={toggleMenu}
                  className={`text-2xl font-medium transition flex items-center space-x-2 hover:text-sf-gold`}
                >
                  {item.icon && <item.icon className="h-6 w-6" />}
                  <span>{item.label}</span>
                </a>
              ) : (
                <Link
                  key={index}
                  to={item.path}
                  onClick={toggleMenu}
                  className={`text-2xl font-medium transition flex items-center space-x-2 ${
                    location.pathname === item.path
                      ? 'text-sf-gold'
                      : 'hover:text-sf-gold'
                  }`}
                >
                  {item.icon && <item.icon className="h-6 w-6" />}
                  <span>{item.label}</span>
                </Link>
              )
            ))}
            {user && (
              <button
                onClick={handleSignOut}
                className="text-2xl font-medium hover:text-sf-gold transition"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export default Navbar;