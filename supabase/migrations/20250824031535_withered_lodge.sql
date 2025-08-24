/*
  # Create vehicles table

  1. New Tables
    - `vehicles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `vehicle_number` (text, vehicle registration number)
      - `vehicle_type` (text, bike/car/etc)
      - `mileage` (numeric, fuel efficiency)
      - `has_reserve_tank` (boolean, whether vehicle has reserve)
      - `reserve_tank_capacity` (numeric, reserve capacity in liters)
      - `tank_capacity` (numeric, total tank capacity in liters)
      - `current_odometer` (integer, current odometer reading)
      - `current_fuel_level` (numeric, current fuel in liters)
      - `is_on_reserve` (boolean, currently on reserve)
      - `last_full_tank_odo` (integer, odometer at last full tank)
      - `last_full_tank_date` (timestamp, when tank was last filled)
      - `last_reserve_odo` (integer, odometer at last reserve)
      - `last_reserve_date` (timestamp, when last set to reserve)
      - `mileage_calculation_method` (text, calculation method used)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `vehicles` table
    - Add policies for authenticated users to manage their own vehicles
    - Add foreign key constraint to auth.users

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  vehicle_number text NOT NULL,
  vehicle_type text NOT NULL,
  mileage numeric NOT NULL,
  has_reserve_tank boolean NOT NULL DEFAULT false,
  reserve_tank_capacity numeric NOT NULL DEFAULT 0.0,
  tank_capacity numeric NOT NULL,
  current_odometer integer NOT NULL,
  current_fuel_level numeric NOT NULL,
  is_on_reserve boolean NOT NULL DEFAULT false,
  last_full_tank_odo integer,
  last_full_tank_date timestamp with time zone,
  last_reserve_odo integer,
  last_reserve_date timestamp with time zone,
  mileage_calculation_method text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = user_id);

GRANT ALL ON TABLE public.vehicles TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();