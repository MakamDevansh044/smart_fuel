import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { X, Edit } from 'lucide-react';
import type { Vehicle } from '../types';

interface UpdateOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export const UpdateOdometerModal: React.FC<UpdateOdometerModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const { updateVehicle } = useVehicles();
  const [odometerReading, setOdometerReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReading = parseInt(odometerReading);
    if (isNaN(newReading) || newReading <= 0) {
      setError('Please enter a valid odometer reading');
      return;
    }

    if (newReading <= vehicle.current_odometer) {
      setError('Odometer reading must be greater than the previous reading');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate distance and petrol consumption
      const distance = newReading - vehicle.current_odometer;
      const petrolUsed = distance / vehicle.mileage;
      const newPetrolLevel = Math.max(
        vehicle.current_fuel_level - petrolUsed, 
        vehicle.is_on_reserve ? 0 : (vehicle.has_reserve_tank ? vehicle.reserve_tank_capacity : 0)
      );

      console.log(`Odometer update: Distance: ${distance}km, Petrol used: ${petrolUsed.toFixed(2)}L, New level: ${newPetrolLevel.toFixed(2)}L`);

      await updateVehicle(vehicle.id, {
        current_odometer: newReading,
        current_fuel_level: newPetrolLevel,
      });
      
      onClose();
      setOdometerReading('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update odometer');
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated values
  const distance = parseInt(odometerReading || '0') - vehicle.current_odometer;
  const estimatedPetrolUsed = distance > 0 ? distance / vehicle.mileage : 0;
  const estimatedPetrolLeft = Math.max(vehicle.current_fuel_level - estimatedPetrolUsed, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Update Odometer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="odometerReading" className="block text-sm font-medium text-gray-700 mb-2">
              Odometer Reading (km)
            </label>
            <input
              id="odometerReading"
              type="number"
              min="0"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter current odometer reading"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Previous reading: {vehicle.current_odometer.toLocaleString()} km
            </p>
          </div>

          {/* Calculations */}
          {distance > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Estimated Impact</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Distance Traveled</p>
                  <p className="font-semibold text-blue-900">{distance} km</p>
                </div>
                <div>
                  <p className="text-blue-700">Petrol Used</p>
                  <p className="font-semibold text-blue-900">{estimatedPetrolUsed.toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-blue-700">Current Petrol</p>
                  <p className="font-semibold">{vehicle.current_fuel_level.toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-blue-700">Estimated Left</p>
                  <p className={`font-semibold ${estimatedPetrolLeft < 2 ? 'text-red-600' : 'text-blue-900'}`}>
                    {estimatedPetrolLeft.toFixed(1)}L
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !odometerReading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};