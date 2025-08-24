/*
  # Create fuel records table for SmartFuel app

  1. New Tables
    - `fuel_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `odometer_reading` (integer) - Current odometer reading in km
      - `petrol_left` (decimal) - Current petrol level in liters
      - `mileage` (decimal) - Current calculated mileage in km/L
      - `is_reserve` (boolean) - Whether the tank is on reserve
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `fuel_records` table
    - Add policy for authenticated users to manage their own fuel records
    - Users can only access their own data

  3. Indexes
    - Index on user_id and created_at for efficient querying
    - Index on user_id and is_reserve for reserve tracking
*/

CREATE TABLE IF NOT EXISTS fuel_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  odometer_reading integer NOT NULL DEFAULT 0,
  petrol_left decimal(5,2) NOT NULL DEFAULT 0,
  mileage decimal(5,2) NOT NULL DEFAULT 15.0,
  is_reserve boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own fuel records"
  ON fuel_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fuel records"
  ON fuel_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fuel records"
  ON fuel_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fuel records"
  ON fuel_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fuel_records_user_created 
  ON fuel_records(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fuel_records_user_reserve 
  ON fuel_records(user_id, is_reserve);