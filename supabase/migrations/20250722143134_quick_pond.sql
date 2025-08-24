/*
  # Add reserve tank capacity to vehicles table

  1. Changes
    - Add `reserve_tank_capacity` column to vehicles table with default value
    - Update existing records to have a default reserve capacity based on vehicle type

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'reserve_tank_capacity'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN reserve_tank_capacity numeric(5,2) DEFAULT 1.0;
  END IF;
END $$;

-- Update existing records with default reserve capacities
UPDATE vehicles 
SET reserve_tank_capacity = CASE 
  WHEN vehicle_type = 'bike' THEN 1.0
  WHEN vehicle_type = 'car' THEN 5.0
  ELSE 1.0
END
WHERE reserve_tank_capacity IS NULL;