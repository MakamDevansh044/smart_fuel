/*
  # Add Maintenance and Problems Tracking

  1. New Tables
    - `maintenance_records`
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `maintenance_type` (text)
      - `description` (text)
      - `cost` (numeric)
      - `odometer_reading` (integer)
      - `due_date` (date)
      - `completed_date` (date)
      - `is_completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `vehicle_problems`
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `problem_title` (text)
      - `description` (text)
      - `priority` (text)
      - `status` (text)
      - `estimated_cost` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for efficient querying by vehicle and user
*/

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maintenance_type text NOT NULL,
  description text,
  cost numeric(10,2) DEFAULT 0,
  odometer_reading integer NOT NULL,
  due_date date,
  completed_date date,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_problems table
CREATE TABLE IF NOT EXISTS vehicle_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'ignored')),
  estimated_cost numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_problems ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_records
CREATE POLICY "Users can manage own maintenance records"
  ON maintenance_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for vehicle_problems
CREATE POLICY "Users can manage own vehicle problems"
  ON vehicle_problems
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_user 
  ON maintenance_records(vehicle_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_due_date 
  ON maintenance_records(user_id, due_date) WHERE is_completed = false;

CREATE INDEX IF NOT EXISTS idx_vehicle_problems_vehicle_user 
  ON vehicle_problems(vehicle_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_problems_status 
  ON vehicle_problems(user_id, status, priority);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_maintenance_records_updated_at'
  ) THEN
    CREATE TRIGGER update_maintenance_records_updated_at
      BEFORE UPDATE ON maintenance_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_vehicle_problems_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicle_problems_updated_at
      BEFORE UPDATE ON vehicle_problems
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;