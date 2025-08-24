import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { Car, Bike, Plus, X, Check } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleRegistrationProps {
  onComplete: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const VehicleRegistration: React.FC<VehicleRegistrationProps> = ({ 
  onComplete, 
  isModal = false, 
  onClose 
}) => {
  const { addVehicle } = useVehicles();
  const [vehicles, setVehicles] = useState<Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState({
    vehicle_number: '',
    vehicle_type: 'bike' as 'car' | 'bike',
    mileage: 15,
    has_reserve_tank: true,
    reserve_tank_capacity: 1.0,
    tank_capacity: 15.0,
    current_odometer: 0,
    current_fuel_level: 0,
    is_on_reserve: false,
    last_full_tank_odo: 0,
    last_full_tank_date: null,
    last_reserve_odo: 0,
    last_reserve_date: null,
    mileage_calculation_method: 'manual',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddVehicle = () => {
    if (!currentVehicle.vehicle_number.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    if (currentVehicle.mileage <= 0) {
      setError('Please enter a valid mileage');
      return;
    }

    setVehicles([...vehicles, { ...currentVehicle }]);
    setCurrentVehicle({
      vehicle_number: '',
      vehicle_type: 'bike',
      mileage: 15,
      has_reserve_tank: true,
      reserve_tank_capacity: 1.0,
      tank_capacity: 15.0,
      current_odometer: 0,
      current_fuel_level: 0,
      is_on_reserve: false,
      last_full_tank_odo: 0,
      last_full_tank_date: null,
      last_reserve_odo: 0,
      last_reserve_date: null,
      mileage_calculation_method: 'manual',
    });
    setError(null);
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (vehicles.length === 0) {
      setError('Please add at least one vehicle');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const vehicle of vehicles) {
        await addVehicle(vehicle);
      }
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register vehicles');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Your Vehicles</h2>
        <p className="text-gray-600">Add your vehicles to start tracking fuel usage</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <X className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Current Vehicle Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Vehicle</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              value={currentVehicle.vehicle_number}
              onChange={(e) => setCurrentVehicle({ ...currentVehicle, vehicle_number: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ABC-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentVehicle({ ...currentVehicle, vehicle_type: 'bike' })}
                onClick={() => setCurrentVehicle({ 
                  ...currentVehicle, 
                  vehicle_type: 'bike',
                  tank_capacity: 15.0,
                  reserve_tank_capacity: currentVehicle.has_reserve_tank ? 1.0 : 0
                })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
                  currentVehicle.vehicle_type === 'bike'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Bike className="h-4 w-4" />
                Bike
              </button>
              <button
                type="button"
                onClick={() => setCurrentVehicle({ 
                  ...currentVehicle, 
                  vehicle_type: 'car',
                  tank_capacity: 50.0,
                  reserve_tank_capacity: currentVehicle.has_reserve_tank ? 5.0 : 0
                })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
                  currentVehicle.vehicle_type === 'car'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Car className="h-4 w-4" />
                Car
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tank Capacity (L)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="100"
              value={currentVehicle.tank_capacity}
              onChange={(e) => setCurrentVehicle({ ...currentVehicle, tank_capacity: parseFloat(e.target.value) || 15.0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 15 for bikes, 50 for cars"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total fuel tank capacity when completely full
            </p>
          </div>

          {currentVehicle.has_reserve_tank && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reserve Tank Capacity (L)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={currentVehicle.reserve_tank_capacity}
                onChange={(e) => setCurrentVehicle({ ...currentVehicle, reserve_tank_capacity: parseFloat(e.target.value) || 1.0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1.0 for bikes, 5.0 for cars"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typical: 1-2L for bikes, 3-5L for cars
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mileage (km/L)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={currentVehicle.mileage}
              onChange={(e) => setCurrentVehicle({ ...currentVehicle, mileage: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Odometer (km)
            </label>
            <input
              type="number"
              min="0"
              value={currentVehicle.current_odometer}
              onChange={(e) => setCurrentVehicle({ ...currentVehicle, current_odometer: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Fuel Level (L)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={currentVehicle.current_fuel_level}
              onChange={(e) => setCurrentVehicle({ ...currentVehicle, current_fuel_level: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentVehicle.has_reserve_tank}
                onChange={(e) => setCurrentVehicle({ 
                  ...currentVehicle, 
                  has_reserve_tank: e.target.checked,
                  reserve_tank_capacity: e.target.checked ? (currentVehicle.vehicle_type === 'bike' ? 1.0 : 5.0) : 0
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has Reserve Tank</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleAddVehicle}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* Added Vehicles List */}
      {vehicles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Added Vehicles ({vehicles.length})</h3>
          {vehicles.map((vehicle, index) => (
            <div key={index} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {vehicle.vehicle_type === 'bike' ? (
                  <Bike className="h-5 w-5 text-blue-600" />
                ) : (
                  <Car className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{vehicle.vehicle_number}</p>
                  <p className="text-sm text-gray-500">
                    {vehicle.mileage} km/L • {vehicle.has_reserve_tank ? `Reserve: ${vehicle.reserve_tank_capacity}L` : 'No Reserve'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveVehicle(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || vehicles.length === 0}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4" />
              {isModal ? 'Add Vehicles' : 'Complete Registration'}
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        {content}
      </div>
    </div>
  );
};