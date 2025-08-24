/*
  # Enhanced Vehicle Mileage Tracking System

  1. New Columns
    - `tank_capacity` (numeric) - Maximum fuel tank capacity
    - `last_full_tank_odo` (integer) - Odometer reading at last full tank
    - `last_full_tank_date` (timestamp) - When tank was last filled
    - `last_reserve_odo` (integer) - Odometer reading when last set to reserve
    - `last_reserve_date` (timestamp) - When last set to reserve
    - `mileage_calculation_method` (text) - Track which method was used

  2. Enhanced Tracking
    - Support for full tank to full tank calculations
    - Reserve to reserve cycle tracking
    - Automatic mileage learning and updates
*/

-- Add new columns for enhanced mileage tracking
DO $$
BEGIN
  -- Tank capacity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'tank_capacity'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN tank_capacity numeric(5,2) DEFAULT 15.0;
  END IF;

  -- Last full tank tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'last_full_tank_odo'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN last_full_tank_odo integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'last_full_tank_date'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN last_full_tank_date timestamptz;
  END IF;

  -- Last reserve tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'last_reserve_odo'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN last_reserve_odo integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'last_reserve_date'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN last_reserve_date timestamptz;
  END IF;

  -- Mileage calculation method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'mileage_calculation_method'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN mileage_calculation_method text DEFAULT 'manual';
  END IF;
END $$;

-- Update default tank capacities based on vehicle type
UPDATE vehicles 
SET tank_capacity = CASE 
  WHEN vehicle_type = 'bike' THEN 15.0
  WHEN vehicle_type = 'car' THEN 50.0
  ELSE 15.0
END
WHERE tank_capacity = 15.0;