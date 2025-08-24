export interface User {
  id: string;
  email: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_number: string;
  vehicle_type: 'car' | 'bike';
  mileage: number;
  has_reserve_tank: boolean;
  reserve_tank_capacity: number;
  tank_capacity: number;
  current_odometer: number;
  current_fuel_level: number;
  is_on_reserve: boolean;
  last_full_tank_odo: number;
  last_full_tank_date: string | null;
  last_reserve_odo: number;
  last_reserve_date: string | null;
  mileage_calculation_method: string;
  created_at: string;
  updated_at: string;
}

export interface FuelRecord {
  id: string;
  user_id: string;
  vehicle_id?: string;
  odometer_reading: number;
  petrol_left: number;
  estimated_mileage: number;
  is_reserve: boolean;
  distance_traveled?: number;
  petrol_used?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}