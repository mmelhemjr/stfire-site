import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Search, Calendar, Building2, Gift, AlertCircle, Pencil, XCircle, RefreshCw, X, CheckCircle, FileSpreadsheet, File as FilePdf, Loader2, ChevronDown } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import AuthModal from '../components/AuthModal';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Venue } from '../lib/types';
import EditReservationModal from '../components/EditReservationModal';

interface Booking {
  id: string;
  venue: { name: string };
  venue_id: string;
  date: string;
  time: string;
  time_slot_id: string;
  party_size: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  status: string;
  confirmation_number: string;
  occasion: string | null;
  dietary_restrictions: string | null;
  allergies: { allergy: { name: string; id: string } }[];
  tables: {
    id: string;
    venue_table: {
      table_type: {
        name: string;
        seats: number;
      };
    };
  }[];
}

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  booking: Booking;
  isLoading: boolean;
}

type SortField = 'date' | 'time' | 'first_name' | 'venue' | 'party_size' | 'status';
type SortDirection = 'asc' | 'desc';

function CancelModal({ isOpen, onClose, onConfirm, booking, isLoading }: CancelModalProps) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={`w-full max-w-lg rounded-xl shadow-2xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-900 to-sf-black border border-gray-800' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
          <h2 className="text-xl font-bold">Cancel Reservation</h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="mb-2">
              Are you sure you want to cancel this reservation?
            </p>
            <div className="text-gray-500 space-y-1 text-sm">
              <p>Confirmation: <span className="font-mono">{booking.confirmation_number}</span></p>
              <p>Guest: {booking.first_name} {booking.last_name}</p>
              <p>Date: {format(parseISO(booking.date), 'MMMM d, yyyy')}</p>
              <p>Time: {format(new Date(`2000-01-01T${booking.time}`), 'h:mm a')}</p>
              <p>Venue: {booking.venue.name}</p>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">
            This action cannot be undone. The guest will need to make a new reservation if they wish to dine with us.
          </p>
        </div>

        <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex justify-end space-x-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={isLoading}
          >
            Keep Reservation
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Cancelling...' : 'Cancel Reservation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Bookings() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: endOfWeek(new Date())
  });
  const [selectedVenue, setSelectedVenue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    async function fetchVenues() {
      const { data } = await supabase
        .from('venues')
        .select('*')
        .order('name');
      if (data) setVenues(data);
    }

    async function fetchBookings() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('reservations')
          .select(`
            *,
            venue:venues(name)
          `);

        if (dateRange?.from) {
          query = query.gte('date', format(dateRange.from, 'yyyy-MM-dd'));
        }
        if (dateRange?.to) {
          query = query.lte('date', format(dateRange.to, 'yyyy-MM-dd'));
        }

        query = query.order(sortField, { ascending: sortDirection === 'asc' });

        if (selectedVenue) {
          query = query.eq('venue_id', selectedVenue);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (data) setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchBookings();
      fetchVenues();
    }
  }, [user, sortField, sortDirection, dateRange, selectedVenue, refreshKey]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      booking.first_name.toLowerCase().includes(searchTerm) ||
      booking.last_name.toLowerCase().includes(searchTerm) ||
      booking.email.toLowerCase().includes(searchTerm) ||
      booking.telephone.includes(searchTerm)
    );
  });

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      setBookings(bookings.map(booking =>
        booking.id === selectedBooking.id ? { ...booking, status: 'cancelled' } : booking
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setIsRefreshing(false);
  };

  const exportToExcel = () => {
    const data = filteredBookings.map(booking => ({
      Confirmation: booking.confirmation_number,
      Venue: booking.venue.name,
      DateTime: format(parseISO(booking.date), 'MMMM d, yyyy') + ' ' + format(new Date(`2000-01-01T${booking.time}`), 'h:mm a'),
      Guest: booking.first_name + ' ' + booking.last_name,
      Contact: booking.email + ' / ' + booking.telephone,
      PartySize: booking.party_size,
      Status: booking.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    XLSX.writeFile(wb, `bookings-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    const data = filteredBookings.map(booking => [
      booking.confirmation_number,
      booking.venue.name,
      format(parseISO(booking.date), 'MMMM d, yyyy') + ' ' + format(new Date(`2000-01-01T${booking.time}`), 'h:mm a'),
      booking.first_name + ' ' + booking.last_name,
      booking.email + ' / ' + booking.telephone,
      booking.party_size.toString(),
      booking.status
    ]);

    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Confirmation', 'Venue', 'Date & Time', 'Guest', 'Contact', 'Party Size', 'Status']],
      body: data,
    });

    doc.save(`bookings-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleEdit = (booking: any) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    setRefreshKey(prev => prev + 1);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user && !authLoading) {
    return (
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          navigate('/');
        }}
      />
    );
  }

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

  const containerClasses = theme === 'dark'
    ? 'bg-gray-800/50'
    : 'bg-white border border-gray-200';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Bookings</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Refresh bookings"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportToExcel}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Export to Excel"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
            <button
              onClick={exportToPDF}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Export to PDF"
            >
              <FilePdf className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className={`${containerClasses} p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-colors ${inputClasses}`}
              />
            </div>

            <div className="relative date-picker-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCalendarOpen(!isCalendarOpen);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span>
                    {dateRange?.from ? (
                      <>
                        {format(dateRange.from, 'MMM d, yyyy')} -{' '}
                        {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : '...'}
                      </>
                    ) : (
                      'Select date'
                    )}
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              {isCalendarOpen && (
                <div className="absolute z-50 mt-2">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setIsCalendarOpen(false);
                    }}
                    modifiers={{ today: new Date() }}
                    numberOfMonths={2}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg appearance-none transition ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-900'
                }`}
              >
                <option value="">All Venues</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
              <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sf-gold" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('confirmation')} className="flex items-center space-x-2">
                      <span>Confirmation</span>
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('venue')} className="flex items-center space-x-2">
                      <span>Venue</span>
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('date')} className="flex items-center space-x-2">
                      <span>Date & Time</span>
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('first_name')} className="flex items-center space-x-2">
                      <span>Guest</span>
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('party_size')} className="flex items-center space-x-2">
                      <span>Details</span>
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('status')} className="flex items-center space-x-2">
                      <span>Status</span>
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className={theme === 'dark' ? 'border-b border-gray-700/50' : 'border-b border-gray-100'}>
                    <td className="py-3 px-4">{booking.confirmation_number}</td>
                    <td className="py-3 px-4">{booking.venue.name}</td>
                    <td className="py-3 px-4">
                      {format(parseISO(booking.date), 'MMMM d, yyyy')}
                      <br />
                      {format(new Date(`2000-01-01T${booking.time}`), 'h:mm a')}
                    </td>
                    <td className="py-3 px-4">{booking.first_name} {booking.last_name}</td>
                    <td className="py-3 px-4">
                      <div>{booking.email}</div>
                      <div>{booking.telephone}</div>
                    </td>
                    <td className="py-3 px-4">
                      Party of {booking.party_size}
                      {booking.occasion && booking.occasion !== 'None' && (
                        <>
                          <br />
                          <Gift className="inline-block h-4 w-4 mr-1" />
                          {booking.occasion}
                        </>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {booking.status === 'confirmed' && <span className="text-green-500 flex items-center"><CheckCircle className="h-4 w-4 mr-1" />Confirmed</span>}
                      {booking.status === 'cancelled' && <span className="text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1" />Cancelled</span>}
                      {booking.status === 'completed' && <span className="text-gray-500 flex items-center"><CheckCircle className="h-4 w-4 mr-1" />Completed</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(booking)}
                          className={`p-2 rounded-lg transition ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Edit reservation"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleCancel(booking)}
                          className={`p-2 rounded-lg transition ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Cancel reservation"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bookings.length === 0 && !loading && (
          <div className="flex items-center gap-2 text-gray-400 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            No bookings found
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          navigate('/');
        }}
      />

      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        booking={selectedBooking!}
        isLoading={cancelling}
      />

      {selectedBooking && (
        <EditReservationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          booking={selectedBooking}
          onUpdate={handleUpdate}
          venues={venues}
        />
      )}
    </div>
  );
}