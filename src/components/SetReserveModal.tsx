import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { X, AlertTriangle, Calculator } from 'lucide-react';
import type { Vehicle } from '../types';

interface SetReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export const SetReserveModal: React.FC<SetReserveModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const { updateVehicle } = useVehicles();
  const [currentOdometer, setCurrentOdometer] = useState(vehicle.current_odometer.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOdometer = parseFloat(currentOdometer);
    if (isNaN(newOdometer) || newOdometer < 0) {
      setError('Please enter a valid odometer reading');
      return;
    }

    if (newOdometer < vehicle.current_odometer) {
      setError('Odometer reading cannot be less than previous reading');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('=== SET RESERVE CALCULATION ===');
      console.log('Vehicle:', vehicle.vehicle_number);
      console.log('Previous ODO:', vehicle.current_odometer);
      console.log('Current ODO:', newOdometer);
      console.log('Last Reserve ODO:', vehicle.last_reserve_odo);
      console.log('Current Fuel:', vehicle.current_fuel_level);
      console.log('Tank Capacity:', vehicle.tank_capacity);
      console.log('Reserve Capacity:', vehicle.reserve_tank_capacity);
      
      let newMileage = vehicle.mileage;
      let calculationMethod = vehicle.mileage_calculation_method;

      // Reserve-to-Reserve Calculation (CORRECTED FORMULA)
      if (vehicle.last_reserve_odo && vehicle.last_reserve_odo > 0 && newOdometer > vehicle.last_reserve_odo) {
        const distanceTraveled = newOdometer - vehicle.last_reserve_odo;
        
        // Petrol used = Full tank capacity minus reserve capacity
        // (This is the usable fuel between reserve cycles)
        const petrolUsed = vehicle.tank_capacity - vehicle.reserve_tank_capacity;
        
        console.log('Distance since last reserve:', distanceTraveled, 'km');
        console.log('Petrol used (reserve-to-reserve):', petrolUsed, 'L');
        
        if (petrolUsed > 0 && distanceTraveled > 0) {
          const calculatedMileage = distanceTraveled / petrolUsed;
          newMileage = (vehicle.mileage + calculatedMileage) / 2; // Average with previous
          calculationMethod = 'reserve_to_reserve';
          
          console.log('Calculated Mileage:', calculatedMileage.toFixed(2), 'km/L');
          console.log('New Average Mileage:', newMileage.toFixed(2), 'km/L');
        }
      }

      await updateVehicle(vehicle.id, {
        current_odometer: newOdometer,
        is_on_reserve: true,
        current_fuel_level: vehicle.reserve_tank_capacity,
        mileage: newMileage,
        last_reserve_odo: newOdometer,
        last_reserve_date: new Date().toISOString(),
        mileage_calculation_method: calculationMethod,
      });
      
      console.log('Reserve set successfully!');
      console.log('=== END CALCULATION ===');
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set reserve');
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated values
  const distanceTraveled = parseFloat(currentOdometer) - vehicle.current_odometer;
  const canCalculateMileage = vehicle.last_reserve_odo && vehicle.last_reserve_odo > 0 && parseFloat(currentOdometer) > vehicle.last_reserve_odo;
  const reserveToReserveDistance = canCalculateMileage ? parseFloat(currentOdometer) - vehicle.last_reserve_odo : 0;
  const estimatedPetrolUsed = canCalculateMileage ? vehicle.tank_capacity - vehicle.reserve_tank_capacity : 0;
  const estimatedMileage = canCalculateMileage && estimatedPetrolUsed > 0 ? reserveToReserveDistance / estimatedPetrolUsed : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-2">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set to Reserve</h2>
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

          <div className="mb-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-lg font-mono"
              placeholder="Enter exact current reading"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Previous reading: {vehicle.current_odometer.toFixed(1)} km
            </p>
          </div>

          {/* Mileage Calculation Preview */}
          {canCalculateMileage && distanceTraveled > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-medium text-amber-900">Mileage Calculation (Reserve-to-Reserve)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-amber-700">Distance Traveled</p>
                  <p className="font-bold text-amber-900">{reserveToReserveDistance.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-amber-700">Petrol Used</p>
                  <p className="font-bold text-amber-900">{estimatedPetrolUsed.toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-amber-700">Calculated Mileage</p>
                  <p className="font-bold text-amber-900">{estimatedMileage.toFixed(2)} km/L</p>
                </div>
                <div>
                  <p className="text-amber-700">New Average</p>
                  <p className="font-bold text-amber-900">{((vehicle.mileage + estimatedMileage) / 2).toFixed(2)} km/L</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current Fuel</p>
                <p className="font-bold text-gray-900">{vehicle.current_fuel_level.toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-gray-600">After Reserve</p>
                <p className="font-bold text-amber-600">{vehicle.reserve_tank_capacity.toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-gray-600">Distance Traveled</p>
                <p className="font-bold text-gray-900">{distanceTraveled.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-gray-600">Current Mileage</p>
                <p className="font-bold text-gray-900">{vehicle.mileage.toFixed(1)} km/L</p>
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
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Set to Reserve
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};