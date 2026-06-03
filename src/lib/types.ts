import type { Database } from './database.types';

export type Area = {
  id: string;
  name: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  max_seating_duration: string | null;
  walk_in_percentage: number;
  created_at: string;
}

export type TableType = {
  id: string;
  name: string;
  seats: number;
  created_at: string;
}

export type VenueTable = {
  id: string;
  venue_id: string;
  walk_in_reserved: boolean;
  created_at: string;
  area_id: string;
  table_type: TableType;
}

export type ReservationTable = {
  id: string;
  reservation_id: string;
  venue_table_id: string;
  created_at: string;
  venue_table: VenueTable;
}

export type TimeSlot = {
  id: string;
  venue_id: string;
  area_id: string;
  time: string;
  max_capacity: number;
  available_seats: number;
  tables?: {
    [tableTypeId: string]: {
      total: number;
      available: number;
      seats: number;
      name: string;
    };
  };
}

export type Allergy = {
  id: string;
  name: string;
  description: string;
}

export type Reservation = {
  id: string;
  venue_id: string;
  area_id: string;
  time_slot_id: string;
  date: string;
  time: string;
  party_size: number;
  occasion?: string;
  dietary_restrictions?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  allergies: { allergy: { name: string; id: string } }[];
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  confirmation_number: string;
  user_id?: string;
  tables?: ReservationTable[];
}

export type BookingStep = 'booking' | 'details' | 'confirmation';

export type UserPreferences = {
  dietaryRestrictions?: string[];
  seatingPreference?: 'window' | 'outdoor' | 'indoor' | 'quiet' | 'bar';
  serviceNotes?: string[];
  favoriteWines?: string[];
  favoriteDishes?: string[];
}

export type SpecialDates = {
  birthday?: string;
  anniversary?: string;
  otherDates?: Array<{
    date: string;
    description: string;
  }>;
}

export type CommunicationPreferences = {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

export type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_image: string | null;
  role: string;
  preferences: UserPreferences;
  notes: string | null;
  loyalty_points: number;
  visit_count: number;
  last_visit: string | null;
  preferred_area_id: string | null;
  preferred_table_type_id: string | null;
  special_dates: SpecialDates;
  vip_status: boolean;
  communication_preferences: CommunicationPreferences;
  created_at: string | null;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      allergies: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
      }
      areas: {
        Row: {
          capacity: number
          closing_time: string
          created_at: string | null
          id: string
          max_seating_duration: string | null
          name: string
          opening_time: string
          walk_in_percentage: number | null
        }
        Insert: {
          capacity: number
          closing_time: string
          created_at?: string | null
          id?: string
          max_seating_duration?: string | null
          name: string
          opening_time: string
          walk_in_percentage?: number | null
        }
        Update: {
          capacity?: number
          closing_time?: string
          created_at?: string | null
          id?: string
          max_seating_duration?: string | null
          name?: string
          opening_time?: string
          walk_in_percentage?: number | null
        }
      }
      reservation_allergies: {
        Row: {
          allergy_id: string
          reservation_id: string
        }
        Insert: {
          allergy_id: string
          reservation_id: string
        }
        Update: {
          allergy_id?: string
          reservation_id?: string
        }
      }
      reservation_tables: {
        Row: {
          created_at: string | null
          id: string
          reservation_id: string
          venue_table_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reservation_id: string
          venue_table_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reservation_id?: string
          venue_table_id?: string
        }
      }
      reservations: {
        Row: {
          area_id: string
          confirmation_number: string
          created_at: string | null
          date: string
          dietary_restrictions: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          occasion: string | null
          party_size: number
          status: string
          telephone: string
          time: string
          time_slot_id: string | null
          user_id: string | null
          venue_id: string
        }
        Insert: {
          area_id: string
          confirmation_number?: string
          created_at?: string | null
          date: string
          dietary_restrictions?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          occasion?: string | null
          party_size: number
          status?: string
          telephone: string
          time: string
          time_slot_id?: string | null
          user_id?: string | null
          venue_id: string
        }
        Update: {
          area_id?: string
          confirmation_number?: string
          created_at?: string | null
          date?: string
          dietary_restrictions?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          occasion?: string | null
          party_size?: number
          status?: string
          telephone?: string
          time?: string
          time_slot_id?: string | null
          user_id?: string | null
          venue_id?: string
        }
      }
      table_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          seats: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          seats: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          seats?: number
        }
      }
      time_slots: {
        Row: {
          area_id: string
          id: string
          max_capacity: number
          time: string
          venue_id: string
        }
        Insert: {
          area_id: string
          id?: string
          max_capacity: number
          time: string
          venue_id: string
        }
        Update: {
          area_id?: string
          id?: string
          max_capacity?: number
          time?: string
          venue_id?: string
        }
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_image: string | null
          role: string
          preferences: Json
          notes: string | null
          loyalty_points: number
          visit_count: number
          last_visit: string | null
          preferred_area_id: string | null
          preferred_table_type_id: string | null
          special_dates: Json
          vip_status: boolean
          communication_preferences: Json
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          profile_image?: string | null
          role?: string
          preferences?: Json
          notes?: string | null
          loyalty_points?: number
          visit_count?: number
          last_visit?: string | null
          preferred_area_id?: string | null
          preferred_table_type_id?: string | null
          special_dates?: Json
          vip_status?: boolean
          communication_preferences?: Json
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_image?: string | null
          role?: string
          preferences?: Json
          notes?: string | null
          loyalty_points?: number
          visit_count?: number
          last_visit?: string | null
          preferred_area_id?: string | null
          preferred_table_type_id?: string | null
          special_dates?: Json
          vip_status?: boolean
          communication_preferences?: Json
        }
      }
      venue_tables: {
        Row: {
          area_id: string
          created_at: string | null
          id: string
          quantity: number
          table_type_id: string
          venue_id: string
          walk_in_reserved: number
        }
        Insert: {
          area_id: string
          created_at?: string | null
          id?: string
          quantity: number
          table_type_id: string
          venue_id: string
          walk_in_reserved?: number
        }
        Update: {
          area_id?: string
          created_at?: string | null
          id?: string
          quantity?: number
          table_type_id?: string
          venue_id?: string
          walk_in_reserved?: number
        }
      }
      venues: {
        Row: {
          capacity: number
          closing_time: string
          id: string
          max_seating_duration: string | null
          name: string
          opening_time: string
          walk_in_percentage: number | null
        }
        Insert: {
          capacity: number
          closing_time: string
          id?: string
          max_seating_duration?: string | null
          name: string
          opening_time: string
          walk_in_percentage?: number | null
        }
        Update: {
          capacity?: number
          closing_time?: string
          id?: string
          max_seating_duration?: string | null
          name?: string
          opening_time?: string
          walk_in_percentage?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_available_tables: {
        Args: {
          p_area_id: string;
          p_date: string;
          p_time: string;
          p_party_size: number;
        };
        Returns: {
          table_type_id: string;
          total_tables: number;
          available_tables: number;
          seats_per_table: number;
        }[];
      };
      can_seat_party: {
        Args: {
          p_area_id: string;
          p_date: string;
          p_time: string;
          p_party_size: number;
        };
        Returns: boolean;
      };
      check_table_availability: {
        Args: {
          p_area_id: string;
          p_date: string;
          p_time: string;
          p_party_size: number;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    }
    Enums: {
      [_ in never]: never;
    }
    CompositeTypes: {
      [_ in never]: never;
    }
  }
}