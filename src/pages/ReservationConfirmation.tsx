import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, Clock, MapPin, Phone, Mail, Gift, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Reservation } from '../lib/types';

export default function ReservationConfirmation() {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLatestReservation() {
      const { data: reservationData } = await supabase
        .from('reservations')
        .select(`
          *,
          venue:venues(name)
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!reservationData) {
        navigate('/reservations');
        return;
      }

      const { data: allergyData } = await supabase
        .from('reservation_allergies')
        .select(`
          allergy:allergies(name)
        `)
        .eq('reservation_id', reservationData.id);

      const allergyNames = allergyData?.map(a => a.allergy.name) || [];

      setReservation(reservationData);
      setAllergies(allergyNames);
      setLoading(false);
    }

    fetchLatestReservation();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-16 bg-dark-gradient">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="heading-2 heading-gradient mb-4">Reservation Confirmed!</h1>
          <p className="body-large text-gray-400">
            Your reservation has been successfully confirmed. Please save your confirmation number.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item} className="glass-morphism p-8">
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-2">Confirmation Number</p>
              <p className="text-3xl font-mono font-bold text-sf-gold">{reservation.confirmation_number}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <motion.div variants={item} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-sf-gold" />
                  <div>
                    <p className="text-sm text-gray-400">Venue</p>
                    <p className="font-semibold">{(reservation as any).venue.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-sf-gold" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-semibold">
                      {new Date(reservation.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-sf-gold" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-semibold">
                      {new Date(`2000-01-01T${reservation.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-sf-gold" />
                  <div>
                    <p className="text-sm text-gray-400">Party Size</p>
                    <p className="font-semibold">{reservation.party_size} guests</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-sf-gold" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-semibold">{reservation.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-sf-gold" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="font-semibold">{reservation.telephone}</p>
                  </div>
                </div>

                {reservation.occasion && reservation.occasion !== 'None' && (
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-sf-gold" />
                    <div>
                      <p className="text-sm text-gray-400">Occasion</p>
                      <p className="font-semibold">{reservation.occasion}</p>
                    </div>
                  </div>
                )}

                {(allergies.length > 0 || reservation.dietary_restrictions) && (
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-sf-gold mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Dietary Information</p>
                      {allergies.length > 0 && (
                        <p className="font-semibold">Allergies: {allergies.join(', ')}</p>
                      )}
                      {reservation.dietary_restrictions && (
                        <p className="font-semibold">
                          Restrictions: {reservation.dietary_restrictions}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            variants={item}
            className="mt-8 text-center"
          >
            <Link
              to="/"
              className="btn-primary inline-flex items-center"
            >
              Return to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}