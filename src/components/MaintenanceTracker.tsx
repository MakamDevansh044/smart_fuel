import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Car,
  Bike
} from 'lucide-react';
import type { Vehicle, MaintenanceRecord } from '../types';

interface MaintenanceTrackerProps {
  vehicles: Vehicle[];
}

export const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({ vehicles }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (error) {
        console.error('Error fetching maintenance records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    // Real-time subscription
    const subscription = supabase
      .channel(`maintenance_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_records',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchRecords()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const upcomingMaintenance = records.filter(r => !r.is_completed && r.due_date);
  const overdueMaintenance = upcomingMaintenance.filter(r => 
    new Date(r.due_date!) < new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Maintenance Tracker</h2>
          <p className="text-gray-600">Keep your vehicles in perfect condition</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Add Maintenance
        </button>
      </div>

      {/* Alerts */}
      {overdueMaintenance.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="font-bold text-red-900">Overdue Maintenance</h3>
          </div>
          <div className="space-y-2">
            {overdueMaintenance.slice(0, 3).map(record => (
              <div key={record.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-red-900">{record.maintenance_type}</p>
                  <p className="text-sm text-red-700">
                    Due: {new Date(record.due_date!).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-900">
                    {vehicles.find(v => v.id === record.vehicle_id)?.vehicle_number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map(vehicle => {
          const vehicleRecords = records.filter(r => r.vehicle_id === vehicle.id);
          const pendingCount = vehicleRecords.filter(r => !r.is_completed).length;
          
          return (
            <div key={vehicle.id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className={`bg-gradient-to-r ${
                vehicle.vehicle_type === 'bike' 
                  ? 'from-blue-600 to-cyan-600' 
                  : 'from-purple-600 to-pink-600'
              } p-4 text-white`}>
                <div className="flex items-center gap-3">
                  {vehicle.vehicle_type === 'bike' ? (
                    <Bike className="h-6 w-6" />
                  ) : (
                    <Car className="h-6 w-6" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{vehicle.vehicle_number}</h3>
                    <p className="text-white/80 text-sm">
                      {pendingCount} pending maintenance{pendingCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {vehicleRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No maintenance records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {vehicleRecords.slice(0, 5).map(record => (
                      <div key={record.id} className={`p-3 rounded-lg border ${
                        record.is_completed 
                          ? 'bg-green-50 border-green-200' 
                          : record.due_date && new Date(record.due_date) < new Date()
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{record.maintenance_type}</p>
                            <p className="text-sm text-gray-600">{record.description}</p>
                            {record.due_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {new Date(record.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {record.is_completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-orange-600" />
                            )}
                            {record.cost > 0 && (
                              <p className="text-sm font-medium text-gray-900">
                                ₹{record.cost.toFixed(0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Maintenance Form Modal */}
      {showAddForm && (
        <AddMaintenanceModal
          vehicles={vehicles}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// Add Maintenance Modal Component
const AddMaintenanceModal: React.FC<{
  vehicles: Vehicle[];
  onClose: () => void;
}> = ({ vehicles, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    vehicle_id: vehicles[0]?.id || '',
    maintenance_type: '',
    description: '',
    cost: '',
    odometer_reading: '',
    due_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('maintenance_records')
        .insert([{
          ...formData,
          user_id: user.id,
          cost: parseFloat(formData.cost) || 0,
          odometer_reading: parseInt(formData.odometer_reading) || 0,
          due_date: formData.due_date || null,
        }]);

      if (error) throw error;
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Maintenance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number} ({vehicle.vehicle_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
            <input
              type="text"
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Oil Change, Tire Replacement"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={formData.odometer_reading}
                onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Current reading"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (Optional)</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};