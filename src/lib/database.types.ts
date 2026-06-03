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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "reservation_allergies_allergy_id_fkey"
            columns: ["allergy_id"]
            isOneToOne: false
            referencedRelation: "allergies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_allergies_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          }
        ]
      }
      reservation_tables: {
        Row: {
          id: string
          reservation_id: string
          venue_table_id: string
          created_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          venue_table_id: string
          created_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          venue_table_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_tables_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_tables_venue_table_id_fkey"
            columns: ["venue_table_id"]
            isOneToOne: false
            referencedRelation: "venue_tables"
            referencedColumns: ["id"]
          }
        ]
      }
      reservations: {
        Row: {
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
        Relationships: [
          {
            foreignKeyName: "reservations_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
      }
      table_types: {
        Row: {
          id: string
          name: string
          seats: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          seats: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          seats?: number
          created_at?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          id: string
          max_capacity: number
          time: string
          venue_id: string
        }
        Insert: {
          id?: string
          max_capacity: number
          time: string
          venue_id: string
        }
        Update: {
          id?: string
          max_capacity?: number
          time?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
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
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      venue_tables: {
        Row: {
          id: string
          venue_id: string
          table_type_id: string
          quantity: number
          walk_in_reserved: number
          created_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          table_type_id: string
          quantity: number
          walk_in_reserved?: number
          created_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          table_type_id?: string
          quantity?: number
          walk_in_reserved?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_tables_table_type_id_fkey"
            columns: ["table_type_id"]
            isOneToOne: false
            referencedRelation: "table_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_tables_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_availability: {
        Args: {
          p_venue_id: string
          p_date: string
          p_time: string
          p_party_size: number
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}