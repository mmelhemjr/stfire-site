import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://imgur.com/QOqiroF.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8 px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-white">
            {t('home.tagline')} <span className="text-sf-gold">{t('home.fire')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;