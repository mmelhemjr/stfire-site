import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Sparkles, ConciergeBell, Space as Spa } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HotelInterestModal from '../components/HotelInterestModal';

const Hotel = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="pt-16">
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Hotel%20overview.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">Coming Summer of 2027</h1>
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
                <Sparkles className="h-6 w-6 text-sf-gold" />
                <span>{t('hotel.features.wifi')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <ConciergeBell className="h-6 w-6 text-sf-gold" />
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
              src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Eye%20Level%20Pool.png" 
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
                src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Room.png" 
                alt="Deluxe sea view room" 
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('hotel.rooms.deluxe.title')}</h3>
                <p className="text-gray-300">{t('hotel.rooms.deluxe.description')}</p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Living%20space%20.png" 
                alt="Executive suite living space" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('hotel.rooms.executive.title')}</h3>
                <p className="text-gray-300">{t('hotel.rooms.executive.description')}</p>
              </div>
            </div>
            <div className="bg-sf-black/50 rounded-lg overflow-hidden">
              <img 
                src="https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/private%20pool%20room.png" 
                alt="Presidential suite with private pool" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t('hotel.rooms.presidential.title')}</h3>
                <p className="text-gray-300">{t('hotel.rooms.presidential.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Join the Flame CTA */}
        <div className="mt-16 text-center py-16 border-t border-white/10">
          <p className="text-sf-gold text-sm tracking-widest uppercase mb-3">Priority Access</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Be Among the First</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Join our exclusive priority list for early access, special offers, and updates as Saint Fire Hotel prepares to open in Summer 2027.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-sf-gold text-black px-10 py-4 rounded-lg font-semibold text-lg hover:bg-sf-gold/90 transition-colors"
          >
            Join the Flame
          </button>
        </div>
      </div>

      <HotelInterestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default Hotel;