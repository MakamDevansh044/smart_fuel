import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { X, Plus } from 'lucide-react';
import type { Vehicle } from '../types';

interface AddPetrolModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export const AddPetrolModal: React.FC<AddPetrolModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const { updateVehicle } = useVehicles();
  const [petrolAmount, setPetrolAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(petrolAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid petrol amount');
      return;
    }

    if (amount > 20) {
      setError('Petrol amount seems too large. Please check.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newPetrolLevel = Math.min(vehicle.current_fuel_level + amount, vehicle.tank_capacity);
      
      console.log(`Adding petrol: ${amount}L, New level: ${newPetrolLevel.toFixed(2)}L`);

      await updateVehicle(vehicle.id, {
        current_fuel_level: newPetrolLevel,
        is_on_reserve: false, // No longer on reserve after refueling
      });
      
      onClose();
      setPetrolAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add petrol');
    } finally {
      setLoading(false);
    }
  };

  const tankCapacity = vehicle.tank_capacity;
  const estimatedNewLevel = Math.min(vehicle.current_fuel_level + parseFloat(petrolAmount || '0'), tankCapacity);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Petrol</h2>
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
            <label htmlFor="petrolAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Petrol Amount (Liters)
            </label>
            <input
              id="petrolAmount"
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={petrolAmount}
              onChange={(e) => setPetrolAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="Enter amount in liters"
              required
            />
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current Level</p>
                <p className="font-semibold">{vehicle.current_fuel_level.toFixed(1)}L</p>
              </div>
              {petrolAmount && (
                <div>
                  <p className="text-gray-600">After Adding</p>
                  <p className="font-semibold text-green-600">{estimatedNewLevel.toFixed(1)}L</p>
                </div>
              )}
            </div>
          </div>

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
              disabled={loading || !petrolAmount}
             className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Petrol
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};