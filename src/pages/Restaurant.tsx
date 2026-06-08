import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Menu as MenuIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Restaurant = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
      <SEO
        title="Restaurant | Mediterranean Dining in Chios"
        description="Mediterranean cuisine served beachfront at Saint Fire in Chios. Fresh seasonal dishes, seafood, and an unforgettable view of the Aegean Sea."
        canonical="/restaurant"
        image="https://imgur.com/rCHhU9U.jpg"
      />
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
          <h1 className="text-5xl md:text-7xl font-bold text-white">{t('restaurant.title')}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('restaurant.subtitle')}</h2>
            <p className="text-gray-300 mb-6">
              {t('restaurant.description')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-sf-gold" />
                <span>{t('restaurant.hours')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-sf-gold" />
                <span>{t('restaurant.address')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-6 w-6 text-sf-gold" />
                <span>{t('restaurant.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MenuIcon className="h-6 w-6 text-sf-gold" />
                <Link to="/menu" className="hover:text-sf-gold transition">
                  {t('restaurant.view_menu')}
                </Link>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://imgur.com/RaabiC6.jpg" 
              alt="Restaurant interior" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('restaurant.featured_dishes')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
              src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Shrimp%20Kritharoto%20.png" 
              alt="Shrimp Kritharoto"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('restaurant.greek_salad.title')}</h3>
                <p className="text-gray-300">{t('restaurant.greek_salad.description')}</p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
              src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Greek%20Salad.png" 
              alt="Greek Salad"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('restaurant.chicken_sandwich.title')}</h3>
                <p className="text-gray-300">{t('restaurant.chicken_sandwich.description')}</p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
              src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Fish%20.png" 
              alt="Fish dish"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('restaurant.burger.title')}</h3>
                <p className="text-gray-300">{t('restaurant.burger.description')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center space-y-4">
          <Link
            to="/menu"
            className="inline-flex items-center px-8 py-3 bg-sf-gold text-sf-black rounded-full hover:bg-sf-gold/90 transition mr-4"
          >
            {t('restaurant.view_menu')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Restaurant;