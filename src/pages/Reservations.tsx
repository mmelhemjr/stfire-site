import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ReservationForm from '../components/ReservationForm';

export default function Reservations() {
  const { t } = useTranslation();

  return (
    <div className="pt-16 min-h-screen bg-dark-gradient">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="heading-1 heading-gradient mb-4">
            {t('reservations.title')}
          </h1>
          <p className="body-large text-gray-400">
            Experience luxury dining at Saint Fire. Select your preferred time and let us take care of the rest.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-morphism p-8">
            <ReservationForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}