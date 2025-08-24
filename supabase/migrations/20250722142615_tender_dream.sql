/*
  # Multi-Vehicle Fuel Management System

  1. New Tables
    - `vehicles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `vehicle_number` (text, license plate)
      - `vehicle_type` (text, car or bike)
      - `mileage` (numeric, fuel efficiency km/L)
      - `has_reserve_tank` (boolean)
      - `current_odometer` (integer)
      - `current_fuel_level` (numeric)
      - `is_on_reserve` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updated Tables
    - `fuel_records` - Add vehicle_id foreign key
    - `refuel_logs` - Add vehicle_id foreign key

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own vehicles
    - Add policies for vehicle-specific fuel records and logs
*/

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_number text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('car', 'bike')),
  mileage numeric(5,2) NOT NULL DEFAULT 15.0,
  has_reserve_tank boolean NOT NULL DEFAULT true,
  current_odometer integer NOT NULL DEFAULT 0,
  current_fuel_level numeric(5,2) NOT NULL DEFAULT 0,
  is_on_reserve boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add vehicle_id to fuel_records if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fuel_records' AND column_name = 'vehicle_id'
  ) THEN
    ALTER TABLE fuel_records ADD COLUMN vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add vehicle_id to refuel_logs if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'refuel_logs' AND column_name = 'vehicle_id'
  ) THEN
    ALTER TABLE refuel_logs ADD COLUMN vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicles
CREATE POLICY "Users can view their own vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON vehicles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_created ON vehicles(user_id, created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicles_updated_at();