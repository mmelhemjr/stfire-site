import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Egg, BookDown as Bowl, Sandwich, PanelTop, Salad, Merge as Burger, Utensils, Pizza, Coffee, IceCream } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';

interface MenuSection {
  id: string;
  name: string;
  time_range: string;
  display_order: number;
  menu_categories: MenuCategory[];
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  display_order: number;
  menu_items: MenuItem[];
}

interface MenuItem {
  id: string;
  name_en: string;
  description_en: string | null;
  name_el: string;
  description_el: string | null;
  name_tr: string;
  description_tr: string | null;
  tags: string[];
}

export default function Menu() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('menu_sections')
          .select(`
            id, name, time_range, display_order,
            menu_categories (
              id, name, icon, display_order,
              menu_items (
                id, name_en, description_en, name_el, description_el, name_tr, description_tr, tags, display_order
              )
            )
          `)
          .order('display_order', { ascending: true })
          .order('display_order', { foreignTable: 'menu_categories', ascending: true })
          .order('display_order', { foreignTable: 'menu_categories.menu_items', ascending: true });

        if (error) throw error;
        setSections(data || []);
        
        // Set initial active section
        if (data && data.length > 0 && !activeSection) {
          setActiveSection(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  const getLocalizedName = (item: MenuItem) => {
    switch (i18n.language) {
      case 'el':
        return item.name_el;
      case 'tr':
        return item.name_tr;
      default:
        return item.name_en;
    }
  };

  const getLocalizedDescription = (item: MenuItem) => {
    switch (i18n.language) {
      case 'el':
        return item.description_el;
      case 'tr':
        return item.description_tr;
      default:
        return item.description_en;
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case '🥚': return <Egg className="h-5 w-5" />;
      case '🥣': return <Bowl className="h-5 w-5" />;
      case '🥪': return <Sandwich className="h-5 w-5" />;
      case '🥞': return <PanelTop className="h-5 w-5" />;
      case '🥗': return <Salad className="h-5 w-5" />;
      case '🍔': return <Burger className="h-5 w-5" />;
      case '🥖': return <Sandwich className="h-5 w-5" />;
      case '🦪': return <Utensils className="h-5 w-5" />;
      case '🍝': return <Utensils className="h-5 w-5" />;
      case '🐟': return <Utensils className="h-5 w-5" />;
      case '🥩': return <Utensils className="h-5 w-5" />;
      case '🍨': return <IceCream className="h-5 w-5" />;
      case '🍕': return <Pizza className="h-5 w-5" />;
      case '☕': return <Coffee className="h-5 w-5" />;
      default: return <Utensils className="h-5 w-5" />;
    }
  };

  const filteredSections = sections.map(section => ({
    ...section,
    menu_categories: section.menu_categories.map(category => ({
      ...category,
      menu_items: category.menu_items.filter(item => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          getLocalizedName(item).toLowerCase().includes(searchTerm) ||
          getLocalizedDescription(item)?.toLowerCase().includes(searchTerm) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      })
    })).filter(category => category.menu_items.length > 0)
  })).filter(section => section.menu_categories.length > 0);

  return (
    <div className="pt-16 min-h-screen">
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://imgur.com/rCHhU9U.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">{t('menu.title')}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-morphism p-8">
            <div className="sticky top-24 z-[900] mb-8 -mx-8 px-8 py-4 -mt-4">
              <div className={`absolute inset-0 ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-gray-900 to-gray-900/95'
                  : 'bg-gradient-to-b from-white to-white/95'
              } backdrop-blur-md border-b ${
                theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'
              }`} />
              <div className="relative z-10">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700/50 text-white'
                      : 'bg-white/50 border-gray-200/50 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    !activeSection
                      ? 'bg-sf-gold text-sf-black'
                      : theme === 'dark'
                      ? 'hover:bg-gray-800/50'
                      : 'hover:bg-gray-100/50'
                  }`}
                >
                  All Day
                </button>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeSection === section.id
                        ? 'bg-sf-gold text-sf-black'
                        : theme === 'dark'
                        ? 'hover:bg-gray-800/50'
                        : 'hover:bg-gray-100/50'
                    }`}
                  >
                    {section.name}
                    <span className="text-xs ml-2 opacity-75">
                      {section.time_range}
                    </span>
                  </button>
                ))}
              </div>
              </div>
            </div>

            {/* Menu Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-10 w-10 border-4 border-sf-gold border-t-transparent rounded-full"></div>
              </div> 
            ) : error ? (
              <div className="text-red-500 text-center py-12">{error}</div>
            ) : (
              <>
                {showAllCategories ? (
                  <div className="space-y-16">
                    {filteredSections.flatMap(section => 
                      section.menu_categories.map(category => (
                        <div key={category.id} className="glass-morphism p-6">
                          <h3 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-2 text-sf-gold">{getIconComponent(category.icon)}</span>
                            {category.name}
                            <span className="ml-2 text-sm text-gray-400">({section.name})</span>
                          </h3>

                          <div className="space-y-6">
                            {category.menu_items.map(item => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start justify-between group"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-lg font-medium group-hover:text-sf-gold transition-colors">
                                      {getLocalizedName(item)}
                                    </h4>
                                    {item.tags?.map(tag => (
                                      <span
                                        key={tag}
                                        className={`text-xs px-2 py-0.5 rounded ${
                                          tag === 'V' ? 'bg-green-500/20 text-green-500' :
                                          tag === 'VG' ? 'bg-purple-500/20 text-purple-500' :
                                          tag === 'GF' ? 'bg-blue-500/20 text-blue-500' :
                                          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  {getLocalizedDescription(item) && (
                                    <p className="text-gray-400 text-sm mt-1">
                                      {getLocalizedDescription(item)}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-16">
                    {filteredSections.map(section => (
                      <AnimatePresence key={section.id} mode="wait">
                        {activeSection === section.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="mb-8">
                              <h2 className="text-3xl font-bold">{section.name}</h2>
                              <p className="text-gray-400">{section.time_range}</p>
                            </div>

                            <div className="space-y-12">
                              {section.menu_categories.map(category => (
                                <div key={category.id} className="glass-morphism p-6">
                                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <span className="mr-2 text-sf-gold">{getIconComponent(category.icon)}</span>
                                    {category.name}
                                  </h3>

                                  <div className="space-y-6">
                                    {category.menu_items.map(item => (
                                      <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start justify-between group"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-lg font-medium group-hover:text-sf-gold transition-colors">
                                              {getLocalizedName(item)}
                                            </h4>
                                            {item.tags?.map(tag => (
                                              <span
                                                key={tag}
                                                className={`text-xs px-2 py-0.5 rounded ${
                                                  tag === 'V' ? 'bg-green-500/20 text-green-500' :
                                                  tag === 'VG' ? 'bg-purple-500/20 text-purple-500' :
                                                  tag === 'GF' ? 'bg-blue-500/20 text-blue-500' :
                                                  theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                }`}
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                          {getLocalizedDescription(item) && (
                                            <p className="text-gray-400 text-sm mt-1">
                                              {getLocalizedDescription(item)}
                                            </p>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                )}

                <div className="mt-8 text-center text-sm text-gray-400">
                  <p>V - Vegetarian | VG - Vegan | GF - Gluten Free</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}