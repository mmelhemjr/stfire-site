import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Clock, Calendar, Download, FileSpreadsheet, File as FilePdf, Filter, Loader2, ChevronDown, RefreshCw, MousePointer, Globe } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DayPicker, DateRange } from 'react-day-picker';

interface AnalyticsSummary {
  totalReservations: number;
  totalGuests: number;
  avgPartySize: number;
  completionRate: number;
  cancellationRate: number;
  pageViews: number;
  uniqueVisitors: number;
  totalEvents: number;
}

interface DailyStats {
  date: string;
  reservations: number;
  guests: number;
}

interface AreaStats {
  area: string;
  reservations: number;
  guests: number;
  avgPartySize: number;
}

interface TimeSlotStats {
  hour: number;
  reservations: number;
}

interface Area {
  id: string;
  name: string;
  capacity: number;
}

interface AreaAvailability {
  area: string;
  totalCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  upcomingReservations: number;
}

export default function Analytics() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [areaStats, setAreaStats] = useState<AreaStats[]>([]);
  const [timeSlotStats, setTimeSlotStats] = useState<TimeSlotStats[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [siteStats, setSiteStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [areaAvailability, setAreaAvailability] = useState<AreaAvailability[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    async function fetchAreas() {
      const { data } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      if (data) setAreas(data);
    }
    fetchAreas();
  }, []);

  const fetchAnalytics = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch site statistics
      const { data: siteStatsData, error: siteStatsError } = await supabase
        .from('site_statistics')
        .select('*')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (siteStatsError) throw siteStatsError;

      const totalPageViews = siteStatsData?.reduce((sum, day) => sum + day.page_views, 0) || 0;
      const totalUniqueVisitors = siteStatsData?.reduce((sum, day) => sum + day.unique_visitors, 0) || 0;
      const totalEvents = siteStatsData?.reduce((sum, day) => sum + day.total_events, 0) || 0;

      setSiteStats(siteStatsData);

      // Create base query
      let query = supabase
        .from('reservations')
        .select('party_size, status, area_id')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'));

      // Only add area filter if an area is selected
      if (selectedArea) {
        query = query.eq('area_id', selectedArea);
      }

      // Fetch summary statistics
      const { data: summaryData } = await query;

      if (summaryData) {
        const total = summaryData.length;
        const totalGuests = summaryData.reduce((sum, r) => sum + r.party_size, 0);
        const completed = summaryData.filter(r => r.status === 'completed').length;
        const cancelled = summaryData.filter(r => r.status === 'cancelled').length;

        setSummary({
          totalReservations: total,
          totalGuests,
          avgPartySize: total ? totalGuests / total : 0,
          completionRate: total ? (completed / total) * 100 : 0,
          cancellationRate: total ? (cancelled / total) * 100 : 0,
          pageViews: totalPageViews,
          uniqueVisitors: totalUniqueVisitors,
          totalEvents: totalEvents
        });
      }

      // Fetch daily statistics
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const dailyPromises = days.map(async (date) => {
        let query = supabase
          .from('reservations')
          .select('party_size')
          .eq('date', format(date, 'yyyy-MM-dd'));

        if (selectedArea) {
          query = query.eq('area_id', selectedArea);
        }

        const { data } = await query;

        return {
          date: format(date, 'yyyy-MM-dd'),
          reservations: data?.length || 0,
          guests: data?.reduce((sum, r) => sum + r.party_size, 0) || 0
        };
      });

      const dailyResults = await Promise.all(dailyPromises);
      setDailyStats(dailyResults);

      // Fetch area statistics
      let areaQuery = supabase
        .from('reservations')
        .select(`
          party_size,
          areas (
            name
          )
        `)
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedArea) {
        areaQuery = areaQuery.eq('area_id', selectedArea);
      }

      const { data: areaData } = await areaQuery;

      if (areaData) {
        const areaStats = areaData.reduce((acc, r) => {
          const areaName = r.areas?.name || 'Unknown';
          if (!acc[areaName]) {
            acc[areaName] = { reservations: 0, guests: 0 };
          }
          acc[areaName].reservations++;
          acc[areaName].guests += r.party_size;
          return acc;
        }, {} as Record<string, { reservations: number; guests: number }>);

        setAreaStats(Object.entries(areaStats).map(([area, stats]) => ({
          area,
          reservations: stats.reservations,
          guests: stats.guests,
          avgPartySize: stats.guests / stats.reservations
        })));
      }

      // Fetch time slot statistics
      let timeQuery = supabase
        .from('reservations')
        .select('time')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedArea) {
        timeQuery = timeQuery.eq('area_id', selectedArea);
      }

      const { data: timeData } = await timeQuery;

      if (timeData) {
        const timeStats = timeData.reduce((acc, r) => {
          const hour = parseInt(r.time.split(':')[0]);
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        setTimeSlotStats(Object.entries(timeStats).map(([hour, reservations]) => ({
          hour: parseInt(hour),
          reservations
        })).sort((a, b) => a.hour - b.hour));
      }

      // Fetch area availability
      const availabilityPromises = areas.map(async (area) => {
        const { data: timeSlots } = await supabase
          .from('time_slots')
          .select('*')
          .eq('area_id', area.id);

        const { data: upcomingReservations } = await supabase
          .from('reservations')
          .select('party_size')
          .eq('area_id', area.id)
          .eq('status', 'confirmed')
          .gte('date', format(new Date(), 'yyyy-MM-dd'));

        const totalCapacity = area.capacity;
        const bookedCapacity = upcomingReservations?.reduce((sum, r) => sum + r.party_size, 0) || 0;
        const availableCapacity = Math.max(0, totalCapacity - bookedCapacity);
        const utilizationRate = (bookedCapacity / totalCapacity) * 100;

        return {
          area: area.name,
          totalCapacity,
          availableCapacity,
          utilizationRate,
          upcomingReservations: upcomingReservations?.length || 0
        };
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      setAreaAvailability(availabilityResults);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin, dateRange, selectedArea, areas]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportToExcel = () => {
    if (!summary || !dailyStats || !areaStats || !timeSlotStats) return;

    const summarySheet = [
      ['Metric', 'Value'],
      ['Total Reservations', summary.totalReservations],
      ['Total Guests', summary.totalGuests],
      ['Average Party Size', summary.avgPartySize.toFixed(1)],
      ['Completion Rate', `${summary.completionRate.toFixed(1)}%`],
      ['Cancellation Rate', `${summary.cancellationRate.toFixed(1)}%`]
    ];

    const dailySheet = [
      ['Date', 'Reservations', 'Guests'],
      ...dailyStats.map(stat => [
        format(new Date(stat.date), 'MMM d, yyyy'),
        stat.reservations,
        stat.guests
      ])
    ];

    const areaSheet = [
      ['Area', 'Reservations', 'Guests', 'Avg Party Size'],
      ...areaStats.map(stat => [
        stat.area,
        stat.reservations,
        stat.guests,
        stat.avgPartySize.toFixed(1)
      ])
    ];

    const timeSheet = [
      ['Hour', 'Reservations'],
      ...timeSlotStats.map(stat => [
        `${stat.hour}:00`,
        stat.reservations
      ])
    ];

    const availabilitySheet = [
      ['Area', 'Total Capacity', 'Available Capacity', 'Utilization Rate', 'Upcoming Reservations'],
      ...areaAvailability.map(stat => [
        stat.area,
        stat.totalCapacity,
        stat.availableCapacity,
        `${stat.utilizationRate.toFixed(1)}%`,
        stat.upcomingReservations
      ])
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summarySheet), 'Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dailySheet), 'Daily Stats');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(areaSheet), 'Area Stats');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(timeSheet), 'Time Stats');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(availabilitySheet), 'Availability');
    
    XLSX.writeFile(wb, `saint-fire-analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    if (!summary || !dailyStats || !areaStats || !timeSlotStats) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Saint Fire Analytics Report', 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, 14, 25);
    if (dateRange?.from && dateRange?.to) {
      doc.text(`Report Period: ${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`, 14, 35);
    }

    // Summary
    doc.setFontSize(16);
    doc.text('Summary', 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Reservations', summary.totalReservations.toString()],
        ['Total Guests', summary.totalGuests.toString()],
        ['Average Party Size', summary.avgPartySize.toFixed(1)],
        ['Completion Rate', `${summary.completionRate.toFixed(1)}%`],
        ['Cancellation Rate', `${summary.cancellationRate.toFixed(1)}%`]
      ]
    });

    // Area Statistics
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Area Statistics', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Area', 'Reservations', 'Guests', 'Avg Party Size']],
      body: areaStats.map(stat => [
        stat.area,
        stat.reservations.toString(),
        stat.guests.toString(),
        stat.avgPartySize.toFixed(1)
      ])
    });

    // Area Availability
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Area Availability', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Area', 'Total Capacity', 'Available', 'Utilization', 'Upcoming']],
      body: areaAvailability.map(stat => [
        stat.area,
        stat.totalCapacity.toString(),
        stat.availableCapacity.toString(),
        `${stat.utilizationRate.toFixed(1)}%`,
        stat.upcomingReservations.toString()
      ])
    });

    // Time Slot Statistics
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Time Slot Statistics', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Hour', 'Reservations']],
      body: timeSlotStats.map(stat => [
        `${stat.hour}:00`,
        stat.reservations.toString()
      ])
    });

    doc.save(`saint-fire-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (authLoading || !user || !isAdmin) {
    return null;
  }

  const cardClasses = theme === 'dark'
    ? 'bg-gray-800/50 border border-gray-700'
    : 'bg-white border border-gray-200';

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics & Business Insights</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              } disabled:opacity-50`}
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportToExcel}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
              title="Export to Excel"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
            <button
              onClick={exportToPDF}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
              title="Export to PDF"
            >
              <FilePdf className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative date-picker-container flex-1">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
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
                    'Select date range'
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
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </div>
            )}
          </div>

          <div className="relative flex-1">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg appearance-none transition ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sf-gold" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Page Views</h3>
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold">{summary?.pageViews || 0}</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Unique Visitors</h3>
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{summary?.uniqueVisitors || 0}</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total Events</h3>
                  <MousePointer className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold">{summary?.totalEvents || 0}</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total Reservations</h3>
                  <BarChart3 className="h-5 w-5 text-sf-gold" />
                </div>
                <p className="text-3xl font-bold">{summary?.totalReservations}</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total Guests</h3>
                  <Users className="h-5 w-5 text-sf-gold" />
                </div>
                <p className="text-3xl font-bold">{summary?.totalGuests}</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Avg Party Size</h3>
                  <Users className="h-5 w-5 text-sf-gold" />
                </div>
                <p className="text-3xl font-bold">{summary?.avgPartySize.toFixed(1)}</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Completion Rate</h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{summary?.completionRate.toFixed(1)}%</p>
              </div>

              <div className={`p-6 rounded-lg ${cardClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Cancellation Rate</h3>
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold">{summary?.cancellationRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Site Statistics Chart */}
            {siteStats && siteStats.length > 0 && (
              <div className={`p-6 rounded-lg ${cardClasses} mt-8`}>
                <h2 className="text-xl font-bold mb-6">Site Traffic</h2>
                <div className="h-64">
                  <div className="flex h-full items-end space-x-2">
                    {siteStats.map((stat: any, index: number) => {
                      const maxViews = Math.max(...siteStats.map((s: any) => s.page_views));
                      const height = (stat.page_views / maxViews) * 100;
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div 
                            className="w-full bg-blue-500/20 rounded-t"
                            style={{ height: `${height}%` }}
                          >
                            <div className="text-center text-sm -mt-6">
                              {stat.page_views}
                            </div>
                          </div>
                          <div className="text-sm mt-2">
                            {format(new Date(stat.date), 'MMM d')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Area Availability */}
            <div className={`p-6 rounded-lg ${cardClasses}`}>
              <h2 className="text-xl font-bold mb-6">Area Availability</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3">Area</th>
                      <th className="text-left py-3">Total Capacity</th>
                      <th className="text-left py-3">Available Capacity</th>
                      <th className="text-left py-3">Utilization Rate</th>
                      <th className="text-left py-3">Upcoming Reservations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaAvailability.map((stat, index) => (
                      <tr 
                        key={index}
                        className={theme === 'dark' ? 'border-b border-gray-700/50' : 'border-b border-gray-100'}
                      >
                        <td className="py-3">{stat.area}</td>
                        <td className="py-3">{stat.totalCapacity}</td>
                        <td className="py-3">{stat.availableCapacity}</td>
                        <td className="py-3">{stat.utilizationRate.toFixed(1)}%</td>
                        <td className="py-3">{stat.upcomingReservations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Area Statistics */}
            <div className={`p-6 rounded-lg ${cardClasses}`}>
              <h2 className="text-xl font-bold mb-6">Area Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3">Area</th>
                      <th className="text-left py-3">Reservations</th>
                      <th className="text-left py-3">Total Guests</th>
                      <th className="text-left py-3">Avg Party Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaStats.map((stat, index) => (
                      <tr 
                        key={index}
                        className={theme === 'dark' ? 'border-b border-gray-700/50' : 'border-b border-gray-100'}
                      >
                        <td className="py-3">{stat.area}</td>
                        <td className="py-3">{stat.reservations}</td>
                        <td className="py-3">{stat.guests}</td>
                        <td className="py-3">{stat.avgPartySize.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Time Slot Analysis */}
            <div className={`p-6 rounded-lg ${cardClasses}`}>
              <h2 className="text-xl font-bold mb-6">Peak Hours Analysis</h2>
              <div className="h-64">
                <div className="flex h-full items-end space-x-2">
                  {timeSlotStats.map((stat, index) => {
                    const maxReservations = Math.max(...timeSlotStats.map(s => s.reservations));
                    const height = (stat.reservations / maxReservations) * 100;
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div 
                          className="w-full bg-sf-gold/20 rounded-t"
                          style={{ height: `${height}%` }}
                        >
                          <div className="text-center text-sm -mt-6">
                            {stat.reservations}
                          </div>
                        </div>
                        <div className="text-sm mt-2">
                          {stat.hour}:00
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}