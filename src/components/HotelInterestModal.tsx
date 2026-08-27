import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_38yzito';
const EMAILJS_TEMPLATE_ID = 'template_61q9oti';
const EMAILJS_PUBLIC_KEY = 'SrF3xGDupVRj8T5Tq';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#F0EBE3',
  border: '1px solid #D5CEC4',
  padding: '12px 16px',
  color: '#1A1A1A',
  fontSize: '14px',
  fontFamily: "SaintFireBody, Inter, sans-serif",
  outline: 'none',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#888',
  marginBottom: '6px',
  fontFamily: "SaintFireBody, Inter, sans-serif",
};

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

    if (supabaseError) {
      setLoading(false);
      setError('Something went wrong. Please try again.');
      return;
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          phone: form.phone || '—',
          country: form.country || '—',
          check_in: form.check_in || '—',
          check_out: form.check_out || '—',
          comments: form.comments || '—',
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch {
      // Email failure is silent — submission already saved to Supabase
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: '#F8F4EF' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 transition-opacity hover:opacity-60"
          style={{ color: '#1A1A1A' }}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-10">
          {submitted ? (
            /* ── Success ── */
            <div className="text-center py-8">
              <p
                className="text-xs tracking-widest uppercase mb-6"
                style={{ color: '#888', letterSpacing: '0.25em', fontFamily: "SaintFireBody, Inter, sans-serif" }}
              >
                Saint Fire Hotel
              </p>
              <h2
                className="text-3xl font-light mb-4"
                style={{ fontFamily: "SaintFireDisplay, 'Cormorant Garamond', serif", color: '#1A1A1A' }}
              >
                You're on the List
              </h2>
              <p className="mb-8 text-sm leading-relaxed" style={{ color: '#666', fontFamily: "SaintFireBody, Inter, sans-serif" }}>
                Thank you for joining the flame. We'll be in touch with exclusive updates as Saint Fire Hotel prepares to open in Summer 2027.
              </p>
              <button
                onClick={onClose}
                className="px-10 py-3 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                style={{ backgroundColor: '#1A1A1A', color: '#F8F4EF', letterSpacing: '0.2em', fontFamily: "SaintFireBody, Inter, sans-serif" }}
              >
                Close
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="mb-8">
                <p
                  className="text-xs tracking-widest uppercase mb-4"
                  style={{ color: '#888', letterSpacing: '0.25em', fontFamily: "SaintFireBody, Inter, sans-serif" }}
                >
                  Saint Fire Hotel · Coming Summer 2027
                </p>
                <h2
                  className="text-3xl font-light mb-3"
                  style={{ fontFamily: "SaintFireDisplay, 'Cormorant Garamond', serif", color: '#1A1A1A' }}
                >
                  Join the Flame
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#666', fontFamily: "SaintFireBody, Inter, sans-serif" }}>
                  Be among the first to experience Saint Fire Hotel. Join our priority list for exclusive updates, early access, and special offers.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label style={LABEL_STYLE}>Full Name <span style={{ color: '#1A1A1A' }}>*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" style={INPUT_STYLE} />
                </div>

                <div>
                  <label style={LABEL_STYLE}>Email Address <span style={{ color: '#1A1A1A' }}>*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" style={INPUT_STYLE} />
                </div>

                <div>
                  <label style={LABEL_STYLE}>Phone <span style={{ color: '#aaa', fontSize: '10px' }}>(optional)</span></label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (000) 000-0000" style={INPUT_STYLE} />
                </div>

                <div>
                  <label style={LABEL_STYLE}>Country <span style={{ color: '#aaa', fontSize: '10px' }}>(optional)</span></label>
                  <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="e.g. Greece, United States" style={INPUT_STYLE} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={LABEL_STYLE}>Check-in <span style={{ color: '#aaa', fontSize: '10px' }}>(optional)</span></label>
                    <input
                      type="date"
                      name="check_in"
                      value={form.check_in}
                      onChange={handleChange}
                      onFocus={() => { if (!form.check_in) setForm(f => ({ ...f, check_in: '2027-06-01' })); }}
                      style={{ ...INPUT_STYLE, colorScheme: 'light' }}
                    />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Check-out <span style={{ color: '#aaa', fontSize: '10px' }}>(optional)</span></label>
                    <input
                      type="date"
                      name="check_out"
                      value={form.check_out}
                      onChange={handleChange}
                      onFocus={() => { if (!form.check_out) setForm(f => ({ ...f, check_out: '2027-06-30' })); }}
                      style={{ ...INPUT_STYLE, colorScheme: 'light' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Comments <span style={{ color: '#aaa', fontSize: '10px' }}>(optional)</span></label>
                  <textarea
                    name="comments"
                    value={form.comments}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any questions or special requests..."
                    style={{ ...INPUT_STYLE, resize: 'none' }}
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-xs tracking-widest uppercase transition-opacity hover:opacity-70 disabled:opacity-40 mt-2"
                  style={{ backgroundColor: '#1A1A1A', color: '#F8F4EF', letterSpacing: '0.2em', fontFamily: "SaintFireBody, Inter, sans-serif" }}
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
