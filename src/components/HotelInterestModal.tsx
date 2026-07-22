import React, { useState } from 'react';
import { X, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HotelInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HotelInterestModal = ({ isOpen, onClose }: HotelInterestModalProps) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    check_in: '',
    check_out: '',
    comments: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: supabaseError } = await supabase.from('hotel_interest').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      country: form.country || null,
      check_in: form.check_in || null,
      check_out: form.check_out || null,
      comments: form.comments || null,
    });

    setLoading(false);

    if (supabaseError) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-sf-black border border-sf-gold/30 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {submitted ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Flame className="h-12 w-12 text-sf-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">You're on the List</h2>
              <p className="text-gray-300 mb-6">
                Thank you for joining the flame. We'll be in touch with exclusive updates as Saint Fire Hotel prepares to open.
              </p>
              <button
                onClick={onClose}
                className="bg-sf-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-sf-gold/90 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-3">
                  <Flame className="h-8 w-8 text-sf-gold" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Join the Flame</h2>
                <p className="text-gray-400 text-sm">
                  Be among the first to experience Saint Fire Hotel. Join our priority list for exclusive updates, early access, and special offers.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Full Name <span className="text-sf-gold">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sf-gold/60 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Email Address <span className="text-sf-gold">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sf-gold/60 transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Phone Number <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (000) 000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sf-gold/60 transition-colors"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Country <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="e.g. Greece, United States, Turkey"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sf-gold/60 transition-colors"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Preferred Check-in <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="date"
                      name="check_in"
                      value={form.check_in}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sf-gold/60 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Preferred Check-out <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="date"
                      name="check_out"
                      value={form.check_out}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sf-gold/60 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Comments <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <textarea
                    name="comments"
                    value={form.comments}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any questions or special requests..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sf-gold/60 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sf-gold text-black py-3 rounded-lg font-semibold hover:bg-sf-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Joining...' : 'Join the Flame'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelInterestModal;
