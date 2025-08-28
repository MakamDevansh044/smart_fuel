import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          user_id: string
          vehicle_number: string
          vehicle_type: string
          mileage: number
          has_reserve_tank: boolean
          reserve_tank_capacity: number
          tank_capacity: number
          current_odometer: number
          current_fuel_level: number
          is_on_reserve: boolean
          last_full_tank_odo: number | null
          last_full_tank_date: string | null
          last_reserve_odo: number | null
          last_reserve_date: string | null
          mileage_calculation_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_number: string
          vehicle_type: string
          mileage: number
          has_reserve_tank?: boolean
          reserve_tank_capacity?: number
          tank_capacity: number
          current_odometer: number
          current_fuel_level: number
          is_on_reserve?: boolean
          last_full_tank_odo?: number | null
          last_full_tank_date?: string | null
          last_reserve_odo?: number | null
          last_reserve_date?: string | null
          mileage_calculation_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_number?: string
          vehicle_type?: string
          mileage?: number
          has_reserve_tank?: boolean
          reserve_tank_capacity?: number
          tank_capacity?: number
          current_odometer?: number
          current_fuel_level?: number
          is_on_reserve?: boolean
          last_full_tank_odo?: number | null
          last_full_tank_date?: string | null
          last_reserve_odo?: number | null
          last_reserve_date?: string | null
          mileage_calculation_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fuel_records: {
        Row: {
          id: string
          user_id: string
          odometer_reading: number
          petrol_left: number
          mileage: number
          is_reserve: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          odometer_reading: number
          petrol_left: number
          mileage: number
          is_reserve?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          odometer_reading?: number
          petrol_left?: number
          mileage?: number
          is_reserve?: boolean
          created_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          vehicle_id: string
          user_id: string
          maintenance_type: string
          description: string | null
          cost: number
          odometer_reading: number
          due_date: string | null
          completed_date: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          user_id: string
          maintenance_type: string
          description?: string | null
          cost?: number
          odometer_reading: number
          due_date?: string | null
          completed_date?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          user_id?: string
          maintenance_type?: string
          description?: string | null
          cost?: number
          odometer_reading?: number
          due_date?: string | null
          completed_date?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_problems: {
        Row: {
          id: string
          user_id: string
          odometer_reading: number
          petrol_left: number
          mileage: number
          is_reserve: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          odometer_reading: number
          petrol_left: number
          mileage: number
          is_reserve?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          odometer_reading?: number
          petrol_left?: number
          mileage?: number
          is_reserve?: boolean
          created_at?: string
        }
      }
    }
  }
}