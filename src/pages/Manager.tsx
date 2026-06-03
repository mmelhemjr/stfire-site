import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Filter, Loader2, RefreshCw, AlertCircle, Lock, Users, Clock, MapPin } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import Select from 'react-select';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import ManagerTabs from '../components/ManagerTabs';
import Analytics from './Analytics';
import { default as BookingsPage } from './Bookings';
import TableLegend from '../components/TableLegend';
import type { Area, TableType, TimeSlot, VenueTable } from '../lib/types';

interface TableLayout {
  id: string;
  originalId: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'partial';
  x: number;
  y: number;
  reservation?: any;
  tableType: string;
  assignedSeats?: number;
  isPartOfSplit?: boolean;
  splitGroupId?: string;
}

interface AreaLayout {
  id: string;
  name: string;
  tables: TableLayout[];
  capacity: number;
  availableSeats: number;
  utilization: number;
}

interface TableAvailability {
  table_type_id: string;
  total_tables: number;
  available_tables: number;
  seats_per_table: number;
}

interface ReservationSummary {
  total: number;
  assigned: number;
  unassigned: number;
  partial: number;
}

function Manager() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string | null>(null);
  const [layout, setLayout] = useState<AreaLayout[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tableAvailability, setTableAvailability] = useState<{ [areaId: string]: TableAvailability[] }>({});
  const [summary, setSummary] = useState<ReservationSummary>({
    total: 0,
    assigned: 0,
    unassigned: 0,
    partial: 0
  });
  const [activeTab, setActiveTab] = useState('tables');

  const [timeBlocks, setTimeBlocks] = useState<{ start: string; end: string; label: string }[]>([]);

  const fetchLayout = async () => {
    if (!selectedDate || !selectedArea || !selectedTimeBlock) return;

    try {
      setLoading(true);
      setError(null);

      const { data: venueTables, error: tablesError } = await supabase
        .from('venue_tables')
        .select(`
          *,
          table_type:table_types(*)
        `)
        .eq('area_id', selectedArea);

      if (tablesError) throw tablesError;

      const { data: allReservations, error: allReservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          reservation_tables(venue_table_id)
        `)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .eq('area_id', selectedArea)
        .eq('status', 'confirmed')
        .gte('time', selectedTimeBlock)
        .lte('time', timeBlocks.find(block => block.start === selectedTimeBlock)?.end || '23:59');

      if (allReservationsError) throw allReservationsError;

      const areaLayouts: AreaLayout[] = [];
      
      if (venueTables) {
        const area = areas.find(a => a.id === selectedArea);
        if (!area) throw new Error('Area not found');

        const tables: TableLayout[] = [];
        let totalSeats = 0;
        let occupiedSeats = 0;

        const tableReservations = new Map<string, any[]>();
        allReservations?.forEach(reservation => {
          reservation.reservation_tables.forEach((rt: any) => {
            const reservations = tableReservations.get(rt.venue_table_id) || [];
            reservations.push(reservation);
            tableReservations.set(rt.venue_table_id, reservations);
          });
        });

        // Create a map to track split reservations
        const splitReservations = new Map<string, string[]>();
        allReservations?.forEach(reservation => {
          if (reservation.reservation_tables.length > 1) {
            splitReservations.set(
              reservation.id,
              reservation.reservation_tables.map((rt: any) => rt.venue_table_id)
            );
          }
        });

        venueTables.forEach((venueTable) => {
          const tableType = venueTable.table_type as TableType;
          const tableId = venueTable.id;
          const reservation = tableReservations.get(tableId)?.[0];
          const isPartOfSplit = splitReservations.has(reservation?.id);
          const splitGroupId = isPartOfSplit ? reservation.id : '';

          if (reservation) {
            occupiedSeats += tableType.seats;
          }

          totalSeats += tableType.seats;

          tables.push({
            id: tableId,
            originalId: tableId,
            number: tables.length + 1,
            seats: tableType.seats,
            status: reservation ? 'occupied' : 'available',
            x: 0,
            y: 0,
            tableType: tableType.name,
            reservation,
            assignedSeats: reservation?.party_size,
            isPartOfSplit,
            splitGroupId
          });
        });

        areaLayouts.push({
          id: area.id,
          name: area.name,
          tables,
          capacity: totalSeats,
          availableSeats: totalSeats - occupiedSeats,
          utilization: (occupiedSeats / totalSeats) * 100
        });
      }

      if (allReservations) {
        const total = allReservations.length;
        const assigned = allReservations.filter(r => r.reservation_tables.length > 0).length;
        const unassigned = allReservations.filter(r => r.reservation_tables.length === 0).length;
        const partial = allReservations.filter(r => {
          const assignedSeats = r.reservation_tables.reduce((sum: number, rt: any) => {
            const table = venueTables?.find(t => t.id === rt.venue_table_id);
            return sum + (table?.table_type.seats || 0);
          }, 0);
          return assignedSeats > 0 && assignedSeats < r.party_size;
        }).length;

        setSummary({
          total,
          assigned,
          unassigned,
          partial
        });
      }

      setLayout(areaLayouts);
      setReservations(allReservations || []);
    } catch (error) {
      console.error('Error fetching layout:', error);
      setError('Failed to load table layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [areasData, tableTypesData] = await Promise.all([
          supabase.from('areas').select('*').order('name'),
          supabase.from('table_types').select('*').order('seats')
        ]);

        if (areasData.error) throw areasData.error;
        if (tableTypesData.error) throw tableTypesData.error;

        setAreas(areasData.data || []);
        setTableTypes(tableTypesData.data || []);

        // If no area is selected, default to the first one
        if (!selectedArea && areasData.data?.length > 0) {
          setSelectedArea(areasData.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data');
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const area = areas.find(a => a.id === selectedArea);
      if (!area) return;

      // For Beach Club, show single time block
      if (area.name === 'Beach Club') {
        const blocks = [{
          start: '09:00',
          end: '11:30',
          label: '9:00 AM - 11:30 AM'
        }];
        setTimeBlocks(blocks);
        setSelectedTimeBlock(blocks[0].start);
        return;
      }

      // For other areas, use their regular opening/closing times
      const blocks = [];
      const start = new Date(`2000-01-01 ${area.opening_time}`);
      const end = new Date(`2000-01-01 ${area.closing_time}`);
      
      let currentTime = start;
      while (currentTime < end) {
        const blockStart = format(currentTime, 'HH:mm');
        const blockEnd = format(new Date(currentTime.getTime() + 2 * 60 * 60 * 1000), 'HH:mm');
        
        blocks.push({
          start: blockStart,
          end: blockEnd,
          label: `${format(currentTime, 'h:mm a')}–${format(new Date(currentTime.getTime() + 2 * 60 * 60 * 1000), 'h:mm a')}`
        });
        
        currentTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
      }
      
      setTimeBlocks(blocks);
      setSelectedTimeBlock(blocks[0]?.start || null);
    }
  }, [selectedArea, areas]);

  useEffect(() => {
    async function fetchTableAvailability() {
      if (!selectedDate) return;

      try {
        const availability: { [areaId: string]: TableAvailability[] } = {};
        
        const areasToCheck = selectedArea ? [areas.find(a => a.id === selectedArea)!] : areas;
        
        for (const area of areasToCheck) {
          const { data: reservedTables } = await supabase
            .from('reservations')
            .select(`
              id,
              reservation_tables (
                venue_table_id
              )
            `)
            .eq('date', format(selectedDate, 'yyyy-MM-dd'))
            .eq('area_id', area.id)
            .eq('status', 'confirmed');

          const { data: venueTables } = await supabase
            .from('venue_tables')
            .select(`
              id,
              table_type_id,
              walk_in_reserved,
              table_type:table_types (
                seats
              )
            `)
            .eq('area_id', area.id);

          if (venueTables) {
            const tablesByType = venueTables.reduce((acc, table) => {
              if (!acc[table.table_type_id]) {
                acc[table.table_type_id] = {
                  total: 0,
                  reserved: 0,
                  walkIn: 0,
                  seats: table.table_type.seats
                };
              }
              acc[table.table_type_id].total += 1;
              acc[table.table_type_id].walkIn += table.walk_in_reserved ? 1 : 0;
              return acc;
            }, {} as Record<string, { total: number; reserved: number; walkIn: number; seats: number }>);

            if (reservedTables) {
              reservedTables.forEach(reservation => {
                reservation.reservation_tables.forEach((rt: any) => {
                  const table = venueTables.find(vt => vt.id === rt.venue_table_id);
                  if (table) {
                    tablesByType[table.table_type_id].reserved++;
                  }
                });
              });
            }

            availability[area.id] = Object.entries(tablesByType).map(([typeId, stats]) => ({
              table_type_id: typeId,
              total_tables: stats.total,
              available_tables: stats.total - stats.reserved - stats.walkIn,
              seats_per_table: stats.seats
            }));
          }
        }

        setTableAvailability(availability);
      } catch (error) {
        console.error('Error fetching table availability:', error);
        setError('Failed to load table availability');
      }
    }

    fetchTableAvailability();
  }, [selectedDate, areas, refreshKey, selectedArea]);

  useEffect(() => {
    fetchLayout();
  }, [selectedDate, selectedArea, selectedTimeBlock, areas, refreshKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    await fetchLayout();
    setIsRefreshing(false);
  };

  const handleDrop = async (e: React.DragEvent, tableId: string) => {
    e.preventDefault();
    const reservationId = e.dataTransfer.getData('text/plain');

    try {
      setError(null);

      const table = layout
        .flatMap(area => area.tables)
        .find(t => t.id === tableId);

      if (!table) throw new Error('Selected table not found');
      if (table.status === 'occupied') throw new Error('This table is already occupied');

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('id, status, party_size, area_id')
        .eq('id', reservationId)
        .eq('status', 'confirmed')
        .single();

      if (reservationError) throw reservationError;
      if (!reservation) throw new Error('Reservation not found');

      const area = layout.find(a => a.tables.some(t => t.id === tableId));
      if (!area) throw new Error('Area not found');

      const tableIndex = area.tables.findIndex(t => t.id === tableId);
      const tablesToAssign = [table];
      let totalSeats = table.seats;

      if (totalSeats < reservation.party_size) {
        let currentIndex = tableIndex;
        
        while (totalSeats < reservation.party_size && currentIndex < area.tables.length - 1) {
          currentIndex++;
          const nextTable = area.tables[currentIndex];
          if (nextTable.status === 'available' && nextTable.tableType === table.tableType) {
            tablesToAssign.push(nextTable);
            totalSeats += nextTable.seats;
          } else {
            break;
          }
        }

        currentIndex = tableIndex;
        while (totalSeats < reservation.party_size && currentIndex > 0) {
          currentIndex--;
          const prevTable = area.tables[currentIndex];
          if (prevTable.status === 'available' && prevTable.tableType === table.tableType) {
            tablesToAssign.unshift(prevTable);
            totalSeats += prevTable.seats;
          } else {
            break;
          }
        }
      }

      if (totalSeats < reservation.party_size) {
        throw new Error(`Cannot accommodate party of ${reservation.party_size}. Need ${reservation.party_size - totalSeats} more seats.`);
      }

      const { error: assignError } = await supabase.rpc(
        'assign_tables_to_reservation',
        {
          p_reservation_id: reservationId,
          p_table_ids: tablesToAssign.map(t => t.originalId)
        }
      );

      if (assignError) {
        throw new Error(assignError.message);
      }

      handleRefresh();

    } catch (error) {
      console.error('Error assigning table:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign table');
    }
  };

  const getTableColor = (table: TableLayout) => {
    const textOpacity = theme === 'dark' ? '400' : '600';

    if (table.isPartOfSplit) {
      return `border-purple-500 text-purple-${textOpacity} ring-1 ring-purple-500/30`;
    }

    if (table.status === 'occupied' && table.assignedSeats === table.seats) {
      return `border-red-500 text-red-${textOpacity} ring-1 ring-red-500/30`;
    }
    if (table.status === 'occupied' && table.assignedSeats !== table.seats) {
      return `border-amber-500 text-amber-${textOpacity} ring-1 ring-amber-500/30`;
    }

    // Available tables are green
    return `border-green-500 text-green-${textOpacity} ring-1 ring-green-500/30`;
  };

  const containerClasses = theme === 'dark'
    ? 'bg-gray-800/30'
    : 'bg-white border border-gray-200';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className={`pt-24 min-h-screen ${theme === 'dark' ? 'bg-dark-gradient' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <ManagerTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'bookings' && <BookingsPage />}
        {activeTab === 'tables' && (
          <>
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className={`${containerClasses} p-6 mb-8`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative date-picker-container flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCalendarOpen(!isCalendarOpen);
                }}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg focus:outline-none transition-colors ${inputClasses}`}
              >
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
              </button>
              {isCalendarOpen && (
                <div className="absolute z-50 mt-2">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    modifiers={{ today: new Date() }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex space-x-2">
                {areas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedArea(area.id)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedArea === area.id
                        ? 'bg-sf-gold text-sf-black'
                        : theme === 'dark'
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {area.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedArea && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {timeBlocks.map(block => (
                <button
                  key={block.start}
                  onClick={() => setSelectedTimeBlock(block.start)}
                  className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                    selectedTimeBlock === block.start
                      ? 'bg-sf-gold text-sf-black'
                      : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {block.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className={`${containerClasses} p-6 lg:sticky lg:top-[22rem]`}>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-colors ${inputClasses}`}
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-sf-gold mb-4">Unassigned Reservations</h2>
              <div className="space-y-4 max-h-[calc(100vh-24rem)] overflow-y-auto">
                {reservations
                  .filter(res => !res.reservation_tables.length)
                  .filter(res => 
                    res.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    res.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    res.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    res.telephone.includes(searchQuery)
                  )
                  .map(reservation => (
                    <div
                      key={reservation.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', reservation.id);
                      }}
                      className={`p-4 rounded-lg border cursor-move ${
                        theme === 'dark'
                          ? 'bg-gray-800/30 border-gray-700/30 hover:border-sf-gold/50'
                          : 'bg-white border-gray-200/50 hover:border-sf-gold/50'
                      } transition-colors shadow-sm hover:shadow-md`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {reservation.first_name} {reservation.last_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            Party of {reservation.party_size}
                          </div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(`2000-01-01T${reservation.time}`), 'h:mm a')}
                          </div>
                        </div>
                        {reservation.occasion && (
                          <div className="text-sm font-medium text-sf-gold">
                            {reservation.occasion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className={`${containerClasses} p-6`}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-sf-gold" />
                </div>
              ) : (
                <div className="space-y-8">
                  {layout.map(area => (
                    <div key={area.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{area.name}</h3>
                        <div className="text-sm text-gray-400">
                          {area.availableSeats}/{area.capacity} seats available ({area.utilization.toFixed(1)}% utilized)
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {area.tables.map(table => (
                          <div
                            key={table.id}
                            className={`p-4 rounded-lg ${getTableColor(table)} relative hover:shadow-lg transition-all group ${
                              table.status === 'occupied' ? 'cursor-not-allowed' : 'cursor-move'
                            }`}
                            onDragOver={(e) => table.status === 'available' ? e.preventDefault() : null}
                            onDrop={(e) => table.status === 'available' ? handleDrop(e, table.id) : null}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Table {table.number}</span>
                              {table.status === 'occupied' && (
                                <Lock className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-4 w-4" />
                              <span>{table.seats}</span>
                            </div>
                            {table.reservation && (
                              <div className="mt-2 text-sm border-t border-current pt-2 opacity-75">
                                <div className="font-medium truncate">
                                  {table.reservation.first_name} {table.reservation.last_name}
                                </div>
                                <div className="text-xs opacity-75">
                                  Party of {table.reservation.party_size}
                                  {table.isPartOfSplit && ' (Split)'}
                                </div>
                              </div>
                            )}
                            {table.reservation && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="font-medium">{table.reservation.first_name} {table.reservation.last_name}</p>
                                <p>Party of {table.reservation.party_size}</p>
                                <p>{format(new Date(`2000-01-01T${table.reservation.time}`), 'h:mm a')}</p>
                                {table.reservation.occasion && (
                                  <p>Occasion: {table.reservation.occasion}</p>
                                )}
                                {table.isPartOfSplit && (
                                  <p className="text-purple-400">Split across multiple tables</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <details className="mt-4">
              <summary className="text-sm font-semibold text-gray-400 cursor-pointer hover:text-gray-300 transition">
                Show Table Legend
              </summary>
              <TableLegend className="mt-2" />
            </details>
          </div>
        </div>

        <div className={`${containerClasses} p-6 mt-8`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">Total Reservations</div>
              <div className="text-2xl font-bold">{summary.total}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Assigned</div>
              <div className="text-2xl font-bold text-green-500">{summary.assigned}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Unassigned</div>
              <div className="text-2xl font-bold text-red-500">{summary.unassigned}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Partial</div>
              <div className="text-2xl font-bold text-amber-500">{summary.partial}</div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Manager;