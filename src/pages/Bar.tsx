import React from 'react';
import { Link } from 'react-router-dom';
import { Wine, Music, Star, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Bar = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://imgur.com/UWempXr.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">{t('bar.title')}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('bar.subtitle')}</h2>
            <p className="text-gray-300 mb-6">
              {t('bar.description')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Wine className="h-6 w-6 text-sf-gold" />
                <span>{t('bar.features.cocktails')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Music className="h-6 w-6 text-sf-gold" />
                <span>{t('bar.features.djs')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-sf-gold" />
                <span>{t('bar.features.vip')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-sf-gold" />
                <span>{t('bar.features.hours')}</span>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://imgur.com/iFgTGfy.jpg" 
              alt="Bar atmosphere" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('bar.signature_cocktails')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://imgur.com/ETsMEaS.jpg" 
                alt="Mediterranean Fire cocktail" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">{t('bar.cocktails.mediterranean_fire.title')}</h3>
                <p className="text-gray-300">
                  {t('bar.cocktails.mediterranean_fire.description')}
                </p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://imgur.com/ANoywao.jpg" 
                alt="Aegean Sunset cocktail" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">{t('bar.cocktails.aegean_sunset.title')}</h3>
                <p className="text-gray-300">
                  {t('bar.cocktails.aegean_sunset.description')}
                </p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://imgur.com/UWempXr.jpg" 
                alt="Golden Hour cocktail" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">{t('bar.cocktails.golden_hour.title')}</h3>
                <p className="text-gray-300">
                  {t('bar.cocktails.golden_hour.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
        </div>
      </div>
    </div>
  );
}

export default Bar;