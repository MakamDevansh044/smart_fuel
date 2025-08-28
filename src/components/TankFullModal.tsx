import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { X, Fuel, Calculator, Droplets } from 'lucide-react';
import type { Vehicle } from '../types';

interface TankFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export const TankFullModal: React.FC<TankFullModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const { updateVehicle } = useVehicles();
  const [currentOdometer, setCurrentOdometer] = useState(vehicle.current_odometer.toString());
  const [fuelAdded, setFuelAdded] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOdometer = parseFloat(currentOdometer);
    const addedFuel = parseFloat(fuelAdded);
    
    if (isNaN(newOdometer) || newOdometer < 0) {
      setError('Please enter a valid odometer reading');
      return;
    }

    if (isNaN(addedFuel) || addedFuel <= 0) {
      setError('Please enter a valid fuel amount');
      return;
    }

    if (newOdometer < vehicle.current_odometer) {
      setError('Odometer reading cannot be less than previous reading');
      return;
    }

    if (addedFuel > vehicle.tank_capacity) {
      setError('Fuel added cannot exceed tank capacity');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('=== TANK FULL CALCULATION ===');
      console.log('Vehicle:', vehicle.vehicle_number);
      console.log('Previous ODO:', vehicle.current_odometer);
      console.log('Current ODO:', newOdometer);
      console.log('Last Full Tank ODO:', vehicle.last_full_tank_odo);
      console.log('Previous Fuel Level:', vehicle.current_fuel_level);
      console.log('Fuel Added:', addedFuel);
      console.log('Tank Capacity:', vehicle.tank_capacity);
      
      let newMileage = vehicle.mileage;
      let calculationMethod = vehicle.mileage_calculation_method;

      // Full-Tank-to-Full-Tank Calculation (CORRECTED FORMULA)
      if (vehicle.last_full_tank_odo && vehicle.last_full_tank_odo > 0 && newOdometer > vehicle.last_full_tank_odo) {
        const distanceTraveled = newOdometer - vehicle.last_full_tank_odo;
        
        // Petrol used = Tank capacity - Previous fuel level
        // This represents how much fuel was consumed since last full tank
        const petrolUsed = vehicle.tank_capacity - vehicle.current_fuel_level;
        
        console.log('Distance since last full tank:', distanceTraveled, 'km');
        console.log('Petrol used calculation:', `${vehicle.tank_capacity} - ${vehicle.current_fuel_level} = ${petrolUsed}L`);
        
        if (petrolUsed > 0 && distanceTraveled > 0) {
          const calculatedMileage = distanceTraveled / petrolUsed;
          newMileage = (vehicle.mileage + calculatedMileage) / 2; // Average with previous
          calculationMethod = 'full_to_full';
          
          console.log('Calculated Mileage:', calculatedMileage.toFixed(2), 'km/L');
          console.log('New Average Mileage:', newMileage.toFixed(2), 'km/L');
        }
      }

      // Verify fuel added makes sense
      const expectedFuelNeeded = vehicle.tank_capacity - vehicle.current_fuel_level;
      if (Math.abs(addedFuel - expectedFuelNeeded) > 2) {
        console.warn('Fuel added differs significantly from expected amount');
      }

      await updateVehicle(vehicle.id, {
        current_odometer: newOdometer,
        current_fuel_level: vehicle.tank_capacity, // Set to full capacity
        is_on_reserve: false,
        mileage: newMileage,
        last_full_tank_odo: newOdometer,
        last_full_tank_date: new Date().toISOString(),
        mileage_calculation_method: calculationMethod,
      });
      
      console.log('Tank full set successfully!');
      console.log('=== END CALCULATION ===');
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set tank full');
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated values
  const distanceTraveled = parseFloat(currentOdometer) - vehicle.current_odometer;
  const expectedFuelNeeded = vehicle.tank_capacity - vehicle.current_fuel_level;
  const canCalculateMileage = vehicle.last_full_tank_odo && vehicle.last_full_tank_odo > 0 && parseFloat(currentOdometer) > vehicle.last_full_tank_odo;
  const fullToFullDistance = canCalculateMileage ? parseFloat(currentOdometer) - vehicle.last_full_tank_odo : 0;
  const estimatedPetrolUsed = canCalculateMileage ? vehicle.tank_capacity - vehicle.current_fuel_level : 0;
  const estimatedMileage = canCalculateMileage && estimatedPetrolUsed > 0 ? fullToFullDistance / estimatedPetrolUsed : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-2">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tank Full</h2>
              <p className="text-sm text-gray-500">{vehicle.vehicle_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="currentOdometer" className="block text-sm font-medium text-gray-700 mb-2">
                Current Odometer Reading (km)
              </label>
              <input
                id="currentOdometer"
                type="number"
                step="0.1"
                min={vehicle.current_odometer}
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg font-mono"
                placeholder="Enter exact current reading"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Previous reading: {vehicle.current_odometer.toFixed(1)} km
              </p>
            </div>

            <div>
              <label htmlFor="fuelAdded" className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Added (Liters)
              </label>
              <input
                id="fuelAdded"
                type="number"
                step="0.1"
                min="0.1"
                max={vehicle.tank_capacity}
                value={fuelAdded}
                onChange={(e) => setFuelAdded(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg"
                placeholder="Enter fuel amount added"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Expected needed: ~{expectedFuelNeeded.toFixed(1)}L to fill tank
              </p>
            </div>
          </div>

          {/* Mileage Calculation Preview */}
          {canCalculateMileage && distanceTraveled > 0 && parseFloat(fuelAdded) > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Mileage Calculation (Full-to-Full)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-700">Distance Traveled</p>
                  <p className="font-bold text-purple-900">{fullToFullDistance.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-purple-700">Petrol Used</p>
                  <p className="font-bold text-purple-900">{estimatedPetrolUsed.toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-purple-700">Calculated Mileage</p>
                  <p className="font-bold text-purple-900">{estimatedMileage.toFixed(2)} km/L</p>
                </div>
                <div>
                  <p className="text-purple-700">New Average</p>
                  <p className="font-bold text-purple-900">{((vehicle.mileage + estimatedMileage) / 2).toFixed(2)} km/L</p>
                </div>
              </div>
            </div>
          )}

          {/* Tank Status */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tank Status</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current Level</p>
                <p className="font-bold text-gray-900">{vehicle.current_fuel_level.toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-gray-600">Adding</p>
                <p className="font-bold text-green-600">+{parseFloat(fuelAdded || '0').toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-gray-600">Final Level</p>
                <p className="font-bold text-purple-600">{vehicle.tank_capacity.toFixed(1)}L</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !fuelAdded}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Fuel className="h-4 w-4" />
                  Set Tank Full
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};