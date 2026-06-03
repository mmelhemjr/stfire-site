import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Venue, TimeSlot, Allergy } from '../lib/types';

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onUpdate: () => Promise<void>;
  venues: Venue[];
}

export default function EditReservationModal({
  isOpen,
  onClose,
  booking,
  onUpdate,
  venues
}: EditReservationModalProps) {
  const [formData, setFormData] = useState({
    venue_id: '',
    date: '',
    time_slot_id: '',
    party_size: 0,
    occasion: '',
    dietary_restrictions: '',
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    allergies: [] as string[]
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form data when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        venue_id: booking.venue_id || '',
        date: booking.date || '',
        time_slot_id: booking.time_slot_id || '',
        party_size: booking.party_size || 0,
        occasion: booking.occasion || 'None',
        dietary_restrictions: booking.dietary_restrictions || '',
        first_name: booking.first_name || '',
        last_name: booking.last_name || '',
        email: booking.email || '',
        telephone: booking.telephone || '',
        allergies: booking.allergies?.map((a: any) => a.allergy.id) || []
      });
    }
  }, [booking]);

  // Fetch allergies
  useEffect(() => {
    async function fetchAllergies() {
      const { data } = await supabase.from('allergies').select('*');
      if (data) setAllergies(data);
    }
    fetchAllergies();
  }, []);

  // Fetch time slots whenever relevant form data changes
  useEffect(() => {
    async function fetchTimeSlots() {
      if (!formData.date || !formData.venue_id || !formData.party_size) {
        setTimeSlots([]);
        return;
      }

      const { data: existingReservations } = await supabase
        .from('reservations')
        .select('time_slot_id, party_size')
        .eq('date', formData.date)
        .eq('venue_id', formData.venue_id)
        .neq('status', 'cancelled')
        .neq('id', booking.id);

      const { data: slots } = await supabase
        .from('time_slots')
        .select('*')
        .eq('venue_id', formData.venue_id)
        .order('time');

      if (slots) {
        const slotsWithAvailability = slots.map(slot => {
          const reservations = existingReservations?.filter(r => r.time_slot_id === slot.id) || [];
          const reserved = reservations.reduce((sum, r) => sum + r.party_size, 0);
          return {
            ...slot,
            available_seats: slot.max_capacity - reserved
          };
        }).filter(slot => slot.available_seats >= formData.party_size);

        setTimeSlots(slotsWithAvailability);

        // If current time slot is not in available slots, reset it
        if (formData.time_slot_id && !slotsWithAvailability.find(s => s.id === formData.time_slot_id)) {
          setFormData(prev => ({ ...prev, time_slot_id: '' }));
        }
      }
    }

    fetchTimeSlots();
  }, [formData.date, formData.venue_id, formData.party_size, booking.id]);

  const validateForm = () => {
    if (!formData.venue_id) return 'Please select a venue';
    if (!formData.date) return 'Please select a date';
    if (!formData.time_slot_id) return 'Please select a time';
    if (!formData.party_size || formData.party_size < 1) return 'Please select party size';
    if (!formData.first_name.trim()) return 'Please enter first name';
    if (!formData.last_name.trim()) return 'Please enter last name';
    if (!formData.email.trim()) return 'Please enter email';
    if (!formData.telephone.trim()) return 'Please enter phone number';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the time from the selected time slot
      const selectedTimeSlot = timeSlots.find(slot => slot.id === formData.time_slot_id);
      if (!selectedTimeSlot) {
        throw new Error('Selected time slot not found');
      }

      // Start a transaction
      const { data: updatedReservation, error: updateError } = await supabase
        .from('reservations')
        .update({
          venue_id: formData.venue_id,
          date: formData.date,
          time: selectedTimeSlot.time,
          time_slot_id: formData.time_slot_id,
          party_size: formData.party_size,
          occasion: formData.occasion === 'None' ? null : formData.occasion,
          dietary_restrictions: formData.dietary_restrictions || null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          telephone: formData.telephone
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!updatedReservation) throw new Error('Failed to update reservation');

      // Delete existing allergies
      const { error: deleteError } = await supabase
        .from('reservation_allergies')
        .delete()
        .eq('reservation_id', booking.id);

      if (deleteError) throw deleteError;

      // Insert new allergies if any
      if (formData.allergies.length > 0) {
        const { error: insertError } = await supabase
          .from('reservation_allergies')
          .insert(
            formData.allergies.map(allergyId => ({
              reservation_id: booking.id,
              allergy_id: allergyId
            }))
          );

        if (insertError) throw insertError;
      }

      // Call onUpdate to refresh the bookings list
      await onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating reservation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the reservation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = "w-full rounded-md bg-gray-800/50 border border-gray-600 text-white p-2.5 shadow-inner shadow-black/20 focus:border-sf-gold focus:ring-1 focus:ring-sf-gold focus:outline-none transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";
  const sectionClasses = "bg-gray-900/50 rounded-lg p-4 shadow-lg shadow-black/10";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-gray-900 to-sf-black w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-800">
        <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 px-6 py-4 border-b border-gray-800 backdrop-blur-sm z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Edit Reservation</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800/50 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className={sectionClasses}>
            <h3 className="text-lg font-semibold mb-4 text-sf-gold">Reservation Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Venue</label>
                <select
                  value={formData.venue_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue_id: e.target.value, time_slot_id: '' }))}
                  className={inputClasses}
                >
                  <option value="">Select venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>Date</label>
                <input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, time_slot_id: '' }))}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Party Size</label>
                <select
                  value={formData.party_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, party_size: parseInt(e.target.value), time_slot_id: '' }))}
                  className={inputClasses}
                >
                  <option value="0">Select size</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>Time</label>
                <select
                  value={formData.time_slot_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_slot_id: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {format(new Date(`2000-01-01T${slot.time}`), 'h:mm a')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={sectionClasses}>
            <h3 className="text-lg font-semibold mb-4 text-sf-gold">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Phone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className={sectionClasses}>
            <h3 className="text-lg font-semibold mb-4 text-sf-gold">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Occasion</label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="None">None</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Business">Business</option>
                  <option value="Date Night">Date Night</option>
                  <option value="Special Occasion">Special Occasion</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Allergies</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-800/30 p-3 rounded-lg">
                  {allergies.map((allergy) => (
                    <label key={allergy.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergy.id)}
                        onChange={(e) => {
                          const newAllergies = e.target.checked
                            ? [...formData.allergies, allergy.id]
                            : formData.allergies.filter(id => id !== allergy.id);
                          setFormData(prev => ({ ...prev, allergies: newAllergies }));
                        }}
                        className="rounded border-gray-600 bg-gray-800 text-sf-gold focus:ring-sf-gold focus:ring-offset-0"
                      />
                      <span className="text-sm">{allergy.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClasses}>Dietary Restrictions</label>
                <textarea
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                  rows={3}
                  className={inputClasses}
                  placeholder="Any dietary restrictions..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-gray-900/95 px-6 py-4 -mx-6 -mb-6 border-t border-gray-800 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-sf-gold text-sf-black rounded-lg hover:bg-sf-gold/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}