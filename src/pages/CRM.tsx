import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Search, Trash2, Download, CheckCircle, Circle,
  ChevronUp, ChevronDown, Loader2, AlertCircle, RefreshCw,
  UtensilsCrossed, Hotel, ShieldCheck, Shield, BarChart2
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

// ─── Hotel Analytics ─────────────────────────────────────────────────────────

function HotelAnalytics({ leads, theme }: { leads: HotelLead[]; theme: string }) {
  const cardClass = theme === 'dark' ? 'bg-gray-800/30 border border-gray-700/50' : 'bg-white border border-gray-200';

  // ── Stat Cards ──────────────────────────────────────────────────────────────
  const total = leads.length;
  const contacted = leads.filter(l => l.contacted).length;

  const stayLengths = leads
    .filter(l => l.check_in && l.check_out)
    .map(l => {
      const diff = (new Date(l.check_out!).getTime() - new Date(l.check_in!).getTime()) / (1000 * 60 * 60 * 24);
      return diff;
    })
    .filter(d => d > 0);
  const avgStay = stayLengths.length
    ? Math.round(stayLengths.reduce((a, b) => a + b, 0) / stayLengths.length)
    : null;

  // ── Country normalisation map ────────────────────────────────────────────────
  const COUNTRY_ALIASES: Record<string, string> = {
    // United States
    'usa': 'United States', 'u.s.a.': 'United States', 'u.s.': 'United States',
    'us': 'United States', 'united states': 'United States',
    'united states of america': 'United States', 'america': 'United States',
    // Turkey
    'turkey': 'Turkey', 'türkiye': 'Turkey', 'turkiye': 'Turkey',
    'turkei': 'Turkey', 'turquie': 'Turkey', 'tr': 'Turkey',
    // Greece
    'greece': 'Greece', 'hellas': 'Greece', 'gr': 'Greece', 'ελλάδα': 'Greece', 'ellada': 'Greece',
    // UK
    'uk': 'United Kingdom', 'united kingdom': 'United Kingdom',
    'great britain': 'United Kingdom', 'england': 'United Kingdom',
    'britain': 'United Kingdom', 'gb': 'United Kingdom',
    // Germany
    'germany': 'Germany', 'deutschland': 'Germany', 'de': 'Germany',
    // France
    'france': 'France', 'fr': 'France',
    // Italy
    'italy': 'Italy', 'italia': 'Italy', 'it': 'Italy',
    // Australia
    'australia': 'Australia', 'aus': 'Australia', 'au': 'Australia',
    // Canada
    'canada': 'Canada', 'ca': 'Canada',
    // India
    'india': 'India', 'in': 'India',
  };

  const normalizeCountry = (raw: string): string => {
    const key = raw.trim().toLowerCase();
    return COUNTRY_ALIASES[key] ?? raw.trim().replace(/\b\w/g, c => c.toUpperCase());
  };

  const countryCounts = leads.reduce((acc, l) => {
    const c = l.country?.trim() ? normalizeCountry(l.country) : 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];

  // ── Most popular check-in date ───────────────────────────────────────────────
  const checkinDateCounts = leads.reduce((acc, l) => {
    if (!l.check_in) return acc;
    acc[l.check_in] = (acc[l.check_in] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCheckinEntry = Object.entries(checkinDateCounts).sort((a, b) => b[1] - a[1])[0];
  const topCheckinDate = topCheckinEntry
    ? new Date(topCheckinEntry[0]).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  // ── Signups per month ────────────────────────────────────────────────────────
  const signupsByMonth = leads.reduce((acc, l) => {
    const key = l.created_at.slice(0, 7); // "YYYY-MM"
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const signupMonths = Object.entries(signupsByMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const maxSignups = Math.max(...signupMonths.map(m => m[1]), 1);

  // ── Check-in month demand ────────────────────────────────────────────────────
  const checkinByMonth = leads.reduce((acc, l) => {
    if (!l.check_in) return acc;
    const key = l.check_in.slice(0, 7);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const checkinMonths = Object.entries(checkinByMonth).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCheckin = Math.max(...checkinMonths.map(m => m[1]), 1);

  // ── Countries ────────────────────────────────────────────────────────────────
  const topCountries = Object.entries(countryCounts)
    .filter(([c]) => c !== 'Unknown')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxCountry = Math.max(...topCountries.map(c => c[1]), 1);

  // ── Stay length buckets ───────────────────────────────────────────────────────
  const buckets: Record<string, number> = { '1–3 nights': 0, '4–7 nights': 0, '8–14 nights': 0, '15+ nights': 0 };
  stayLengths.forEach(d => {
    if (d <= 3) buckets['1–3 nights']++;
    else if (d <= 7) buckets['4–7 nights']++;
    else if (d <= 14) buckets['8–14 nights']++;
    else buckets['15+ nights']++;
  });
  const maxBucket = Math.max(...Object.values(buckets), 1);

  // ── Check-out month demand ────────────────────────────────────────────────────
  const checkoutByMonth = leads.reduce((acc, l) => {
    if (!l.check_out) return acc;
    const key = l.check_out.slice(0, 7);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const checkoutMonths = Object.entries(checkoutByMonth).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCheckout = Math.max(...checkoutMonths.map(m => m[1]), 1);

  // ── This week vs last week ────────────────────────────────────────────────────
  const now = new Date();
  const startOfThisWeek = new Date(now); startOfThisWeek.setDate(now.getDate() - now.getDay()); startOfThisWeek.setHours(0,0,0,0);
  const startOfLastWeek = new Date(startOfThisWeek); startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const thisWeekCount = leads.filter(l => new Date(l.created_at) >= startOfThisWeek).length;
  const lastWeekCount = leads.filter(l => new Date(l.created_at) >= startOfLastWeek && new Date(l.created_at) < startOfThisWeek).length;
  const weekTrend = lastWeekCount === 0 ? null : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

  // ── No date provided ─────────────────────────────────────────────────────────
  const noDateCount = leads.filter(l => !l.check_in && !l.check_out).length;

  // ── Latest signup ─────────────────────────────────────────────────────────────
  const latestSignup = leads.length
    ? new Date(leads[0].created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  // ── Recent signups (last 5) ───────────────────────────────────────────────────
  const recentSignups = leads.slice(0, 5);

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  const StatCard = ({ label, value, sub, trend }: { label: string; value: string | number; sub?: string; trend?: number | null }) => (
    <div className={`${cardClass} rounded-xl p-4`}>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 leading-tight">{label}</p>
      <p className="text-2xl font-bold text-sf-gold break-words">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      {trend !== undefined && trend !== null && (
        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </p>
      )}
    </div>
  );

  const BarRow = ({ label, value, max, color = 'bg-sf-gold' }: { label: string; value: number; max: number; color?: string }) => (
    <div className="flex items-center gap-2 text-sm min-w-0">
      <span className="w-20 sm:w-28 truncate text-gray-300 text-right shrink-0 text-xs sm:text-sm">{label}</span>
      <div className="flex-1 bg-gray-700/40 rounded-full h-2.5 overflow-hidden min-w-0">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-5 text-gray-400 text-xs shrink-0">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Row 1: primary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Signups" value={total} />
        <StatCard label="Contacted" value={contacted} sub={total ? `${Math.round((contacted / total) * 100)}% of list` : undefined} />
        <StatCard label="This Week" value={thisWeekCount} trend={weekTrend} />
        <StatCard label="Avg Stay" value={avgStay !== null ? `${avgStay}d` : '—'} sub={stayLengths.length ? `${stayLengths.length} entries` : 'No dates yet'} />
        <StatCard label="Top Country" value={topCountry ? topCountry[0] : '—'} sub={topCountry ? `${topCountry[1]} signup${topCountry[1] !== 1 ? 's' : ''}` : undefined} />
      </div>

      {/* Row 2: secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Top Check-in Date" value={topCheckinDate ?? '—'} sub={topCheckinEntry ? `${topCheckinEntry[1]} request${topCheckinEntry[1] !== 1 ? 's' : ''}` : undefined} />
        <StatCard label="Latest Signup" value={latestSignup ?? '—'} />
        <StatCard label="No Dates Given" value={noDateCount} sub={total ? `${Math.round((noDateCount / total) * 100)}% of list` : undefined} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Signups over time */}
        <div className={`${cardClass} rounded-xl p-5 min-w-0`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Signups Over Time</h3>
          {signupMonths.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {signupMonths.map(([month, count]) => (
                <BarRow key={month} label={formatMonth(month)} value={count} max={maxSignups} color="bg-sf-gold" />
              ))}
            </div>
          )}
        </div>

        {/* Check-in demand */}
        <div className={`${cardClass} rounded-xl p-5 min-w-0`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Most Requested Check-in Months</h3>
          {checkinMonths.length === 0 ? (
            <p className="text-gray-500 text-sm">No check-in dates submitted yet</p>
          ) : (
            <div className="space-y-3">
              {checkinMonths.map(([month, count]) => (
                <BarRow key={month} label={formatMonth(month)} value={count} max={maxCheckin} color="bg-amber-400" />
              ))}
            </div>
          )}
        </div>

        {/* Check-out demand */}
        <div className={`${cardClass} rounded-xl p-5 min-w-0`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Most Requested Check-out Months</h3>
          {checkoutMonths.length === 0 ? (
            <p className="text-gray-500 text-sm">No check-out dates submitted yet</p>
          ) : (
            <div className="space-y-3">
              {checkoutMonths.map(([month, count]) => (
                <BarRow key={month} label={formatMonth(month)} value={count} max={maxCheckout} color="bg-purple-400" />
              ))}
            </div>
          )}
        </div>

        {/* Countries */}
        <div className={`${cardClass} rounded-xl p-5 min-w-0`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Top Countries</h3>
          {topCountries.length === 0 ? (
            <p className="text-gray-500 text-sm">No country data yet</p>
          ) : (
            <div className="space-y-3">
              {topCountries.map(([country, count]) => (
                <BarRow key={country} label={country} value={count} max={maxCountry} color="bg-blue-400" />
              ))}
            </div>
          )}
        </div>

        {/* Stay length distribution */}
        <div className={`${cardClass} rounded-xl p-5 min-w-0`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Stay Length Distribution</h3>
          {stayLengths.length === 0 ? (
            <p className="text-gray-500 text-sm">No check-in/out dates submitted yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(buckets).map(([label, count]) => (
                <BarRow key={label} label={label} value={count} max={maxBucket} color="bg-emerald-400" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent signups */}
      {recentSignups.length > 0 && (
        <div className={`${cardClass} rounded-xl p-5`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">5 Most Recent Signups</h3>
          <div className="space-y-3">
            {recentSignups.map(l => (
              <div key={l.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'} last:border-0`}>
                <div>
                  <span className="font-medium text-sm">{l.name}</span>
                  <span className="text-gray-400 text-xs ml-2">{l.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  {l.country && <span>{l.country}</span>}
                  {l.check_in && <span>Check-in: {format(new Date(l.check_in), 'MMM d, yyyy')}</span>}
                  <span>{format(new Date(l.created_at), 'MMM d, yyyy')}</span>
                  {l.contacted && <span className="text-emerald-400 font-medium">Contacted</span>}
                </div>
              </div>
            ))}
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
  const [view, setView] = useState<'list' | 'analytics'>('list');

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
      {/* View toggle */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            view === 'list'
              ? 'bg-sf-gold text-black'
              : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Search className="h-4 w-4" /> List
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            view === 'analytics'
              ? 'bg-sf-gold text-black'
              : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BarChart2 className="h-4 w-4" /> Analytics
        </button>
      </div>

      {view === 'analytics' ? (
        loading
          ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sf-gold" /></div>
          : <HotelAnalytics leads={leads} theme={theme} />
      ) : (
      <>
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
                    { label: 'Name', field: 'name' as keyof HotelLead, hide: '' },
                    { label: 'Email', field: 'email' as keyof HotelLead, hide: 'hidden sm:table-cell' },
                    { label: 'Phone', field: 'phone' as keyof HotelLead, hide: 'hidden md:table-cell' },
                    { label: 'Country', field: 'country' as keyof HotelLead, hide: 'hidden sm:table-cell' },
                    { label: 'Check-in', field: 'check_in' as keyof HotelLead, hide: 'hidden lg:table-cell' },
                    { label: 'Check-out', field: 'check_out' as keyof HotelLead, hide: 'hidden lg:table-cell' },
                    { label: 'Comments', field: null as any, hide: 'hidden xl:table-cell' },
                    { label: 'Contacted', field: 'contacted' as keyof HotelLead, hide: '' },
                    { label: 'Submitted', field: 'created_at' as keyof HotelLead, hide: 'hidden md:table-cell' },
                    { label: 'Delete', field: null as any, hide: '' },
                  ].map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.field && handleSort(col.field)}
                      className={`px-4 py-3 text-left font-medium ${col.field ? 'cursor-pointer hover:text-white' : ''} ${col.hide}`}
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
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{l.email}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{l.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{l.country ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 hidden lg:table-cell">
                      {l.check_in ? format(new Date(l.check_in), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 hidden lg:table-cell">
                      {l.check_out ? format(new Date(l.check_out), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate hidden xl:table-cell" title={l.comments ?? ''}>
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
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 hidden md:table-cell">
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
      </>
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

export function TeamManager() {
  const { theme } = useTheme();
  const [admins, setAdmins] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Add admin form
  const [addEmail, setAddEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const cardClass = theme === 'dark' ? 'bg-gray-800/30' : 'bg-white border border-gray-200';
  const inputClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900';

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    if (err) setError('Failed to load admins');
    else setAdmins(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleRemove = async (id: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}?`)) return;
    setRemovingId(id);
    const { error: err } = await supabase.from('users').update({ role: 'user' }).eq('id', id);
    if (err) setError('Failed to remove admin');
    else setAdmins(prev => prev.filter(u => u.id !== id));
    setRemovingId(null);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');

    const { data, error: err } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('email', addEmail.trim().toLowerCase())
      .single();

    if (err || !data) {
      setAddError('No account found with that email. They need to sign up first.');
      setAddLoading(false);
      return;
    }

    if (data.role === 'admin') {
      setAddError('This user is already an admin.');
      setAddLoading(false);
      return;
    }

    const { error: updateErr } = await supabase.from('users').update({ role: 'admin' }).eq('id', data.id);
    if (updateErr) {
      setAddError('Failed to grant admin access. Please try again.');
    } else {
      setAdmins(prev => [{ ...data, role: 'admin' }, ...prev]);
      setAddSuccess(`${addEmail} is now an admin.`);
      setAddEmail('');
    }
    setAddLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8">Team</h2>

      {/* Add Admin */}
      <div className={`${cardClass} rounded-xl p-6 mb-8`}>
        <h3 className="text-sm font-semibold text-sf-gold uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Add Admin
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Enter the email address of an existing user to grant them admin access.
        </p>
        <form onSubmit={handleAddAdmin} className="flex gap-3">
          <input
            type="email"
            value={addEmail}
            onChange={e => { setAddEmail(e.target.value); setAddError(''); setAddSuccess(''); }}
            placeholder="email@example.com"
            required
            className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-sf-gold/60 transition-colors ${inputClass}`}
          />
          <button
            type="submit"
            disabled={addLoading}
            className="px-5 py-2.5 bg-sf-gold text-black rounded-lg font-semibold text-sm hover:bg-sf-gold/90 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Grant Access'}
          </button>
        </form>
        {addError && <p className="text-red-400 text-sm mt-3">{addError}</p>}
        {addSuccess && <p className="text-green-400 text-sm mt-3">✓ {addSuccess}</p>}
      </div>

      {/* Current Admins */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" /> Current Admins ({admins.length})
        </h3>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sf-gold" /></div>
        ) : (
          <div className={`${cardClass} rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Added</th>
                  <th className="px-4 py-3 text-left font-medium">Remove</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b transition ${
                      theme === 'dark'
                        ? `border-gray-700/50 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/5`
                        : `border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'} hover:bg-gray-100`
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {format(new Date(u.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(u.id, u.email)}
                        disabled={removingId === u.id}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-40"
                      >
                        {removingId === u.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <><Trash2 className="h-3.5 w-3.5" /> Remove</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No admins yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main CRM Page ────────────────────────────────────────────────────────────

export default function CRM() {
  const { theme } = useTheme();
  const [section, setSection] = useState<'restaurant' | 'hotel'>('restaurant');

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
        </div>
      </div>

      {section === 'restaurant' && <RestaurantCRM theme={theme} />}
      {section === 'hotel' && <HotelCRM theme={theme} />}
    </div>
  );
}
