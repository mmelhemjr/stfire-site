import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Search, Trash2, Download, CheckCircle, Circle,
  ChevronUp, ChevronDown, Loader2, AlertCircle, RefreshCw,
  UtensilsCrossed, Hotel, ShieldCheck, Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Reservation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  date: string;
  time: string;
  party_size: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  occasion?: string;
  dietary_restrictions?: string;
  confirmation_number: string;
  created_at: string;
  area?: { name: string };
}

interface HotelLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  check_in?: string;
  check_out?: string;
  comments?: string;
  contacted: boolean;
  created_at: string;
}

type SortDir = 'asc' | 'desc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const val = r[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Restaurant CRM ──────────────────────────────────────────────────────────

function RestaurantCRM({ theme }: { theme: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Reservation>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardClass = theme === 'dark' ? 'bg-gray-800/30' : 'bg-white border border-gray-200';
  const inputClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900';

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('reservations')
      .select('*, area:areas(name)')
      .order('created_at', { ascending: true });
    if (err) {
      setError('Failed to load reservations');
    } else {
      // Deduplicate by email — keep earliest (first visit)
      const seen = new Set<string>();
      const unique = (data || []).filter(r => {
        if (seen.has(r.email.toLowerCase())) return false;
        seen.add(r.email.toLowerCase());
        return true;
      });
      setReservations(unique);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reservation?')) return;
    setDeletingId(id);
    await supabase.from('reservations').delete().eq('id', id);
    setReservations(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  };

  const handleSort = (field: keyof Reservation) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = reservations
    .filter(r => {
      const q = search.toLowerCase();
      return (
        r.first_name.toLowerCase().includes(q) ||
        r.last_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.telephone.includes(q) ||
        r.confirmation_number.includes(q)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortField] ?? '');
      const bv = String(b[sortField] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const SortIcon = ({ field }: { field: keyof Reservation }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
      : null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
            />
          </div>
          <button onClick={fetchReservations} className="p-2 rounded-lg hover:bg-gray-700 transition">
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <button
          onClick={() => exportCSV('restaurant-guests.csv', filtered.map(r => ({
            Name: `${r.first_name} ${r.last_name}`,
            Email: r.email,
            Phone: r.telephone,
            'First Visit': format(new Date(r.created_at), 'MMM d, yyyy'),
          })))}
          className="flex items-center gap-2 px-4 py-2 bg-sf-gold/10 text-sf-gold border border-sf-gold/30 rounded-lg text-sm hover:bg-sf-gold/20 transition"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-3">{filtered.length} guest{filtered.length !== 1 ? 's' : ''}</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sf-gold" /></div>
      ) : (
        <div className={`${cardClass} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                  {[
                    { label: 'Name', field: 'first_name' as keyof Reservation },
                    { label: 'Email', field: 'email' as keyof Reservation },
                    { label: 'Phone', field: 'telephone' as keyof Reservation },
                    { label: 'First Visit', field: 'created_at' as keyof Reservation },
                    { label: 'Delete', field: null as any },
                  ].map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.field && handleSort(col.field)}
                      className={`px-4 py-3 text-left font-medium ${col.field ? 'cursor-pointer hover:text-white' : ''}`}
                    >
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b transition ${
                      theme === 'dark'
                        ? `border-gray-700/50 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/5`
                        : `border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'} hover:bg-gray-100`
                    }`}
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.first_name} {r.last_name}</td>
                    <td className="px-4 py-3 text-gray-400">{r.email}</td>
                    <td className="px-4 py-3 text-gray-400">{r.telephone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="text-red-400 hover:text-red-300 transition disabled:opacity-40"
                      >
                        {deletingId === r.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No guests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hotel CRM ───────────────────────────────────────────────────────────────

function HotelCRM({ theme }: { theme: string }) {
  const [leads, setLeads] = useState<HotelLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [contactedFilter, setContactedFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof HotelLead>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardClass = theme === 'dark' ? 'bg-gray-800/30' : 'bg-white border border-gray-200';
  const inputClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900';

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('hotel_interest')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError('Failed to load hotel interest list');
    else setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const toggleContacted = async (id: string, current: boolean) => {
    await supabase.from('hotel_interest').update({ contacted: !current }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, contacted: !current } : l));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    setDeletingId(id);
    await supabase.from('hotel_interest').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setDeletingId(null);
  };

  const handleSort = (field: keyof HotelLead) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = leads
    .filter(l => contactedFilter === 'all' || (contactedFilter === 'contacted' ? l.contacted : !l.contacted))
    .filter(l => {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.country ?? '').toLowerCase().includes(q) ||
        (l.phone ?? '').includes(q)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortField] ?? '');
      const bv = String(b[sortField] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const SortIcon = ({ field }: { field: keyof HotelLead }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
      : null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search name, email, country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
            />
          </div>
          <select
            value={contactedFilter}
            onChange={e => setContactedFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
          >
            <option value="all">All</option>
            <option value="contacted">Contacted</option>
            <option value="not_contacted">Not Contacted</option>
          </select>
          <button onClick={fetchLeads} className="p-2 rounded-lg hover:bg-gray-700 transition">
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <button
          onClick={() => exportCSV('hotel-interest.csv', filtered.map(l => ({
            Name: l.name,
            Email: l.email,
            Phone: l.phone ?? '',
            Country: l.country ?? '',
            'Check-in': l.check_in ?? '',
            'Check-out': l.check_out ?? '',
            Comments: l.comments ?? '',
            Contacted: l.contacted ? 'Yes' : 'No',
            Submitted: format(new Date(l.created_at), 'MMM d, yyyy h:mm a'),
          })))}
          className="flex items-center gap-2 px-4 py-2 bg-sf-gold/10 text-sf-gold border border-sf-gold/30 rounded-lg text-sm hover:bg-sf-gold/20 transition"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-3">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sf-gold" /></div>
      ) : (
        <div className={`${cardClass} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                  {[
                    { label: 'Name', field: 'name' as keyof HotelLead },
                    { label: 'Email', field: 'email' as keyof HotelLead },
                    { label: 'Phone', field: 'phone' as keyof HotelLead },
                    { label: 'Country', field: 'country' as keyof HotelLead },
                    { label: 'Check-in', field: 'check_in' as keyof HotelLead },
                    { label: 'Check-out', field: 'check_out' as keyof HotelLead },
                    { label: 'Comments', field: null as any },
                    { label: 'Contacted', field: 'contacted' as keyof HotelLead },
                    { label: 'Submitted', field: 'created_at' as keyof HotelLead },
                    { label: 'Delete', field: null as any },
                  ].map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.field && handleSort(col.field)}
                      className={`px-4 py-3 text-left font-medium ${col.field ? 'cursor-pointer hover:text-white' : ''}`}
                    >
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr
                    key={l.id}
                    className={`border-b transition ${
                      theme === 'dark'
                        ? `border-gray-700/50 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/5`
                        : `border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'} hover:bg-gray-100`
                    }`}
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{l.name}</td>
                    <td className="px-4 py-3 text-gray-400">{l.email}</td>
                    <td className="px-4 py-3 text-gray-400">{l.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{l.country ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                      {l.check_in ? format(new Date(l.check_in), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                      {l.check_out ? format(new Date(l.check_out), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate" title={l.comments ?? ''}>
                      {l.comments || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleContacted(l.id, l.contacted)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition ${
                          l.contacted ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {l.contacted
                          ? <CheckCircle className="h-4 w-4" />
                          : <Circle className="h-4 w-4" />
                        }
                        {l.contacted ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                      {format(new Date(l.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={deletingId === l.id}
                        className="text-red-400 hover:text-red-300 transition disabled:opacity-40"
                      >
                        {deletingId === l.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500">No contacts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Team Management ─────────────────────────────────────────────────────────

interface SiteUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin';
  created_at: string;
}

function TeamManager({ theme }: { theme: string }) {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const cardClass = theme === 'dark' ? 'bg-gray-800/30' : 'bg-white border border-gray-200';
  const inputClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900';

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .order('role', { ascending: true })
      .order('created_at', { ascending: false });
    if (err) setError('Failed to load users');
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (newRole === 'user' && !confirm('Remove admin access for this user?')) return;
    setUpdatingId(id);
    const { error: err } = await supabase.from('users').update({ role: newRole }).eq('id', id);
    if (err) setError('Failed to update role');
    else setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole as 'user' | 'admin' } : u));
    setUpdatingId(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.first_name ?? '').toLowerCase().includes(q) ||
      (u.last_name ?? '').toLowerCase().includes(q)
    );
  });

  const admins = filtered.filter(u => u.role === 'admin');
  const regularUsers = filtered.filter(u => u.role === 'user');

  const UserRow = ({ u, i }: { u: SiteUser; i: number }) => (
    <tr
      className={`border-b transition ${
        theme === 'dark'
          ? `border-gray-700/50 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/5`
          : `border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'} hover:bg-gray-100`
      }`}
    >
      <td className="px-4 py-3 font-medium whitespace-nowrap">
        {u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}
      </td>
      <td className="px-4 py-3 text-gray-400">{u.email}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          u.role === 'admin' ? 'bg-sf-gold/20 text-sf-gold' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {u.role}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-400">
        {format(new Date(u.created_at), 'MMM d, yyyy')}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => toggleRole(u.id, u.role)}
          disabled={updatingId === u.id}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40 ${
            u.role === 'admin'
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-sf-gold/10 text-sf-gold hover:bg-sf-gold/20'
          }`}
        >
          {updatingId === u.id
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : u.role === 'admin'
              ? <><Shield className="h-3.5 w-3.5" /> Remove Admin</>
              : <><ShieldCheck className="h-3.5 w-3.5" /> Make Admin</>
          }
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
          />
        </div>
        <button onClick={fetchUsers} className="p-2 rounded-lg hover:bg-gray-700 transition">
          <RefreshCw className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sf-gold" /></div>
      ) : (
        <div className="space-y-6">
          {/* Admins */}
          <div>
            <h3 className="text-sm font-semibold text-sf-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Admins ({admins.length})
            </h3>
            <div className={`${cardClass} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Role</th>
                      <th className="px-4 py-3 text-left font-medium">Joined</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((u, i) => <UserRow key={u.id} u={u} i={i} />)}
                    {admins.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No admins found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* All Users */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" /> All Users ({regularUsers.length})
            </h3>
            <div className={`${cardClass} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Role</th>
                      <th className="px-4 py-3 text-left font-medium">Joined</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularUsers.map((u, i) => <UserRow key={u.id} u={u} i={i} />)}
                    {regularUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CRM Page ────────────────────────────────────────────────────────────

export default function CRM() {
  const { theme } = useTheme();
  const [section, setSection] = useState<'restaurant' | 'hotel' | 'team'>('restaurant');

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition ${
      active
        ? 'bg-sf-gold text-black'
        : theme === 'dark'
          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Guests</h2>
        <div className="flex gap-2">
          <button className={tabClass(section === 'restaurant')} onClick={() => setSection('restaurant')}>
            <UtensilsCrossed className="h-4 w-4" />
            Restaurant
          </button>
          <button className={tabClass(section === 'hotel')} onClick={() => setSection('hotel')}>
            <Hotel className="h-4 w-4" />
            Hotel Interest
          </button>
          <button className={tabClass(section === 'team')} onClick={() => setSection('team')}>
            <ShieldCheck className="h-4 w-4" />
            Team
          </button>
        </div>
      </div>

      {section === 'restaurant' && <RestaurantCRM theme={theme} />}
      {section === 'hotel' && <HotelCRM theme={theme} />}
      {section === 'team' && <TeamManager theme={theme} />}
    </div>
  );
}
