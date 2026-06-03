import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Wifi, Coffee, Space as Spa } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hotel = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://imgur.com/QiOTn9A.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">Coming Spring of 2026</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('hotel.subtitle')}</h2>
            <p className="text-gray-300 mb-6">
              {t('hotel.description')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Bed className="h-6 w-6 text-sf-gold" />
                <span>{t('hotel.features.suites')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Wifi className="h-6 w-6 text-sf-gold" />
                <span>{t('hotel.features.wifi')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Coffee className="h-6 w-6 text-sf-gold" />
                <span>{t('hotel.features.service')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Spa className="h-6 w-6 text-sf-gold" />
                <span>{t('hotel.features.spa')}</span>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://imgur.com/b9tZH9P.jpg" 
              alt="Luxury suite" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('hotel.room_types')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://imgur.com/UOt3dzx.jpg" 
                alt="Deluxe room" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('hotel.rooms.deluxe.title')}</h3>
                <p className="text-gray-300">{t('hotel.rooms.deluxe.description')}</p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://imgur.com/zwizzlu.jpg" 
                alt="Executive suite" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('hotel.rooms.executive.title')}</h3>
                <p className="text-gray-300">{t('hotel.rooms.executive.description')}</p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://imgur.com/b9tZH9P.jpg" 
                alt="Presidential suite" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('hotel.rooms.presidential.title')}</h3>
                <p className="text-gray-300">{t('hotel.rooms.presidential.description')}</p>
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

export default Hotel;