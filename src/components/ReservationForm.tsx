import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import { Calendar, Loader2, AlertCircle, Users, Clock, MapPin, Phone, Mail, Gift } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import type { Area, TimeSlot, Allergy, BookingStep } from '../lib/types';
import ReservationSteps from './ReservationSteps';

const occasions = [
  { value: 'None', label: 'None' },
  { value: 'Birthday', label: 'Birthday' },
  { value: 'Anniversary', label: 'Anniversary' },
  { value: 'Business', label: 'Business' },
  { value: 'Date Night', label: 'Date Night' },
  { value: 'Special Occasion', label: 'Special Occasion' },
];

const partySizes = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} ${i === 0 ? 'guest' : 'guests'}`
}));

// Helper function to parse local date
function parseLocalDate(dateString: string) {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

function ReservationForm() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<BookingStep>('booking');
  const [loading, setLoading] = useState(false);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ [key: string]: TimeSlot[] }>({});
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    time_slot_id: '',
    area_id: '',
    party_size: 0,
    occasion: 'None',
    dietary_restrictions: '',
    allergies: [] as string[],
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
  });

  const selectedDate = formData.date ? parseLocalDate(formData.date) : undefined;

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, phone, email')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData(prev => ({
            ...prev,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            telephone: data.phone?.replace(/^\+/, '') || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .order('name');

        if (error) throw error;
        if (data) {
          console.log('Fetched areas:', data);
          setAreas(data);
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
        setError('Failed to load areas');
      }
    }

    async function fetchAllergies() {
      const { data } = await supabase.from('allergies').select('*');
      if (data) setAllergies(data);
    }

    fetchAreas();
    fetchAllergies();
  }, []);

  useEffect(() => {
    async function fetchTimeSlots() {
      if (!formData.date || !formData.party_size) {
        console.log('Missing required data for time slots fetch');
        setTimeSlots({});
        return;
      }

      setTimeSlotsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching existing reservations...');
        const { data: existingReservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('time_slot_id, party_size, area_id')
          .eq('date', formData.date)
          .neq('status', 'cancelled');

        if (reservationsError) {
          console.error('Error fetching reservations:', reservationsError);
          throw reservationsError;
        }

        console.log('Existing reservations:', existingReservations);

        console.log('Fetching time slots...');
        const { data: slots, error: slotsError } = await supabase
          .from('time_slots')
          .select('*')
          .order('time');

        if (slotsError) {
          console.error('Error fetching time slots:', slotsError);
          throw slotsError;
        }

        console.log('Retrieved time slots:', slots);

        if (slots) {
          const groupedSlots = areas.reduce((acc, area) => {
            const areaSlots = slots.filter(slot => slot.area_id === area.id);
            const slotsWithAvailability = areaSlots.map(slot => {
              const reservations = existingReservations?.filter(r => 
                r.time_slot_id === slot.id && 
                r.area_id === area.id
              ) || [];
              const reserved = reservations.reduce((sum, r) => sum + r.party_size, 0);
              return {
                ...slot,
                available_seats: slot.max_capacity - reserved
              };
            }).filter(slot => slot.available_seats >= formData.party_size);

            if (slotsWithAvailability.length > 0) {
              acc[area.id] = slotsWithAvailability;
            }
            return acc;
          }, {} as { [key: string]: TimeSlot[] });

          console.log('Grouped slots:', groupedSlots);
          setTimeSlots(groupedSlots);
        }
      } catch (error) {
        console.error('Error in fetchTimeSlots:', error);
        setError('Failed to load available times');
      } finally {
        setTimeSlotsLoading(false);
      }
    }

    fetchTimeSlots();
  }, [formData.date, formData.party_size, areas]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const selectedTimeSlot = Object.values(timeSlots)
        .flat()
        .find(slot => slot.id === formData.time_slot_id);

      if (!selectedTimeSlot) throw new Error('Invalid time slot selected');

      const { data: newReservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          venue_id: selectedTimeSlot.venue_id,
          area_id: selectedTimeSlot.area_id,
          date: formData.date,
          time_slot_id: formData.time_slot_id,
          time: selectedTimeSlot.time,
          party_size: formData.party_size,
          occasion: formData.occasion === 'None' ? null : formData.occasion,
          dietary_restrictions: formData.dietary_restrictions || null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          telephone: `+${formData.telephone}`,
          status: 'confirmed',
          user_id: user?.id || null
        }])
        .select()
        .single();

      if (reservationError) throw reservationError;
      if (!newReservation) throw new Error('Failed to create reservation');

      if (formData.allergies.length > 0) {
        const { error: allergiesError } = await supabase
          .from('reservation_allergies')
          .insert(
            formData.allergies.map(allergyId => ({
              reservation_id: newReservation.id,
              allergy_id: allergyId,
            }))
          );

        if (allergiesError) throw allergiesError;
      }

      navigate('/reservations/confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const steps: BookingStep[] = ['booking', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['booking', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleTimeSlotSelect = (slotId: string) => {
    const selectedSlot = Object.values(timeSlots)
      .flat()
      .find(slot => slot.id === slotId);

    if (selectedSlot) {
      setFormData(prev => ({ 
        ...prev, 
        time_slot_id: slotId,
        area_id: selectedSlot.area_id
      }));
      setCurrentStep('details');
    }
  };

  const timeSlotVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  const renderTimeSlots = (areaTimeSlots: TimeSlot[], areaName: string) => {
    if (!areaTimeSlots.length) return null;

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-sf-gold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {areaName}
          </h3>
          <span className="text-sm text-gray-400">
            {areaTimeSlots.length} available times
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {areaTimeSlots.map((slot, index) => (
            <motion.button
              key={slot.id}
              custom={index}
              variants={timeSlotVariants}
              onClick={() => handleTimeSlotSelect(slot.id)}
              className={`time-slot-button group ${
                formData.time_slot_id === slot.id ? 'time-slot-button-selected' : ''
              }`}
            >
              <span className="relative">
                {format(parse(slot.time, 'HH:mm:ss', new Date()), 'h:mm a')}
                <span className={`absolute -top-1 -right-1 flex h-2 w-2 ${
                  slot.available_seats > 10 
                    ? 'bg-green-500' 
                    : slot.available_seats > 5 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                } rounded-full opacity-75 group-hover:opacity-100 transition-opacity`} />
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const formSectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'booking':
        return (
          !!formData.date &&
          !!formData.time_slot_id &&
          formData.party_size > 0 &&
          formData.party_size <= 10
        );
      case 'details':
        return (
          !!formData.first_name.trim() &&
          !!formData.last_name.trim() &&
          !!formData.email.trim() &&
          !!formData.telephone.trim()
        );
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-picker-container')) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8">
      <ReservationSteps currentStep={currentStep} />
      
      <div className="glass-morphism">
        <AnimatePresence mode="wait">
          {currentStep === 'booking' && (
            <motion.div
              key="booking"
              variants={formSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 space-y-6"
            >
              <div className="relative date-picker-container">
                <label className="label">Select Date</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCalendarOpen(!isCalendarOpen);
                  }}
                  className="input flex items-center"
                >
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className={selectedDate ? '' : 'text-gray-400'}>
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select date'}
                  </span>
                </button>
                {isCalendarOpen && (
                  <div className="absolute z-50 mt-2">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({
                            ...prev,
                            date: format(date, 'yyyy-MM-dd'),
                            time_slot_id: ''
                          }));
                          setIsCalendarOpen(false);
                        }
                      }}
                      modifiers={{
                        today: new Date(),
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                )}
              </div>

              {formData.date && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="label">Party Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <Select
                      options={partySizes}
                      value={partySizes.find(size => size.value === formData.party_size)}
                      onChange={(option) => setFormData(prev => ({
                        ...prev,
                        party_size: option?.value || 0,
                        time_slot_id: ''
                      }))}
                      placeholder="Select number of guests"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          paddingLeft: '2.5rem'
                        })
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {formData.party_size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="label">Available Times</label>
                  {timeSlotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-sf-gold" />
                    </div>
                  ) : Object.keys(timeSlots).length > 0 ? (
                    <div className="space-y-8">
                      {areas.map(area => {
                        const areaTimeSlots = timeSlots[area.id] || [];
                        if (areaTimeSlots.length === 0) return null;

                        return (
                          <div key={area.id}>
                            {renderTimeSlots(areaTimeSlots, area.name)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 p-4 rounded-lg bg-amber-400/10 border border-amber-400/20">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p>No available time slots for the selected date and party size</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'details' && (
            <motion.div
              key="details"
              variants={formSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <PhoneInput
                  country="gr"
                  value={formData.telephone}
                  onChange={(value) => setFormData(prev => ({ ...prev, telephone: value }))}
                  containerClass="react-phone-input"
                  inputClass="input"
                  buttonClass="phone-select-button"
                  dropdownClass="phone-select-dropdown"
                />
              </div>

              <div>
                <label className="label">Occasion</label>
                <Select
                  options={occasions}
                  value={occasions.find(o => o.value === formData.occasion)}
                  onChange={(option) => setFormData(prev => ({ ...prev, occasion: option?.value || 'None' }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="label">Allergies</label>
                <div className="mt-2 grid grid-cols-2 gap-2 glass-morphism p-4">
                  {allergies.map((allergy) => (
                    <label
                      key={allergy.id}
                      className="flex items-center space-x-2 text-sm"
                    >
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
                      <span>{allergy.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Additional Dietary Restrictions</label>
                <textarea
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                  rows={3}
                  className="input"
                  placeholder="Any additional dietary restrictions..."
                />
              </div>
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <motion.div
              key="confirmation"
              variants={formSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 space-y-6"
            >
              <h3 className="heading-3">Confirm Your Reservation</h3>
              <div className="glass-morphism p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Area</p>
                    <p className="font-semibold">{areas.find(a => a.id === formData.area_id)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-semibold">{format(parseLocalDate(formData.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-semibold">{
                      Object.values(timeSlots).flat().find(slot => slot.id === formData.time_slot_id)?.time
                      ? format(parse(Object.values(timeSlots).flat().find(slot => slot.id === formData.time_slot_id)?.time || '', 'HH:mm:ss', new Date()), 'h:mm a')
                      : ''
                    }</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Party Size</p>
                    <p className="font-semibold">{formData.party_size} {formData.party_size === 1 ? 'guest' : 'guests'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="font-semibold">{formData.first_name} {formData.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Contact</p>
                    <p className="font-semibold">+{formData.telephone}</p>
                  </div>
                  {formData.occasion !== 'None' && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Occasion</p>
                      <p className="font-semibold">{formData.occasion}</p>
                    </div>
                  )}
                  {formData.allergies.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Allergies</p>
                      <p className="font-semibold">{
                        formData.allergies
                          .map(id => allergies.find(a => a.id === id)?.name)
                          .join(', ')
                      }</p>
                    </div>
                  )}
                  {formData.dietary_restrictions && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Additional Restrictions</p>
                      <p className="font-semibold">{formData.dietary_restrictions}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="flex justify-between">
        {currentStep !== 'booking' && (
          <button
            onClick={handleBack}
            className="btn-secondary"
          >
            Back
          </button>
        )}
        {currentStep === 'confirmation' ? (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="btn-primary ml-auto"
          >
            {loading ? 'Processing...' : 'Complete Reservation'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary ml-auto"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default ReservationForm;