import React from 'react';
import { Link } from 'react-router-dom';
import { Umbrella, Sun, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const BeachClub = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
      <SEO
        title="Beach Club | Agia Fotia Beach, Chios"
        description="Spend the day at Saint Fire Beach Club on Agia Fotia Beach, Chios. Premium sunbeds, full beach service, and the crystal-clear Aegean Sea."
        canonical="/beach-club"
        image="https://imgur.com/QOqiroF.jpg"
      />
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://imgur.com/uZhsWs0.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">{t('beach_club.title')}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('beach_club.subtitle')}</h2>
            <p className="text-gray-300 mb-6">
              {t('beach_club.description')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Umbrella className="h-6 w-6 text-sf-gold" />
                <span>{t('beach_club.features.umbrellas')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sun className="h-6 w-6 text-sf-gold" />
                <span>{t('beach_club.features.service')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-sf-gold" />
                <span>{t('beach_club.features.hours')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-sf-gold" />
                <span>{t('beach_club.features.season')}</span>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://imgur.com/iFBRuHy.jpg" 
              alt="Beach club" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('beach_club.services.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sf-black/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('beach_club.services.seating.title')}</h3>
              <p className="text-gray-300">
                {t('beach_club.services.seating.description')}
              </p>
            </div>
            <div className="bg-sf-black/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('beach_club.services.service.title')}</h3>
              <p className="text-gray-300">
                {t('beach_club.services.service.description')}
              </p>
            </div>
            <div className="bg-sf-black/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t('beach_club.services.activities.title')}</h3>
              <p className="text-gray-300">
                {t('beach_club.services.activities.description')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
        </div>
      </div>
    </div>
  );
}

export default BeachClub;