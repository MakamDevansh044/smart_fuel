import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertCircle, 
  Plus, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Car,
  Bike,
  X,
  DollarSign
} from 'lucide-react';
import type { Vehicle, VehicleProblem } from '../types';

interface ProblemsTrackerProps {
  vehicles: Vehicle[];
}

export const ProblemsTracker: React.FC<ProblemsTrackerProps> = ({ vehicles }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<VehicleProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProblems = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_problems')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProblems(data || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();

    // Real-time subscription
    const subscription = supabase
      .channel(`problems_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_problems',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchProblems()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  const openProblems = problems.filter(p => p.status === 'open');
  const criticalProblems = openProblems.filter(p => p.priority === 'critical');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'ignored': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900">Vehicle Issues</h2>
          <p className="text-gray-600">Track and resolve vehicle problems</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Report Issue
        </button>
      </div>

      {/* Critical Issues Alert */}
      {criticalProblems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
            <h3 className="font-bold text-red-900">Critical Issues Require Immediate Attention!</h3>
          </div>
          <div className="space-y-2">
            {criticalProblems.map(problem => (
              <div key={problem.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-red-900">{problem.problem_title}</p>
                  <p className="text-sm text-red-700">{problem.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-900">
                    {vehicles.find(v => v.id === problem.vehicle_id)?.vehicle_number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problems by Vehicle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map(vehicle => {
          const vehicleProblems = problems.filter(p => p.vehicle_id === vehicle.id);
          const openCount = vehicleProblems.filter(p => p.status === 'open').length;
          
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
                      {openCount} open issue{openCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {vehicleProblems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No issues reported</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {vehicleProblems.slice(0, 5).map(problem => (
                      <div key={problem.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{problem.problem_title}</p>
                            <p className="text-sm text-gray-600">{problem.description}</p>
                          </div>
                          <div className="flex flex-col gap-1 ml-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(problem.priority)}`}>
                              {problem.priority.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(problem.status)}`}>
                              {problem.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        {problem.estimated_cost > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            <span>Est. Cost: ₹{problem.estimated_cost.toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Problem Form Modal */}
      {showAddForm && (
        <AddProblemModal
          vehicles={vehicles}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// Add Problem Modal Component
const AddProblemModal: React.FC<{
  vehicles: Vehicle[];
  onClose: () => void;
}> = ({ vehicles, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    vehicle_id: vehicles[0]?.id || '',
    problem_title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    estimated_cost: '',
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
        .from('vehicle_problems')
        .insert([{
          ...formData,
          user_id: user.id,
          estimated_cost: parseFloat(formData.estimated_cost) || 0,
        }]);

      if (error) throw error;
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Report Issue</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Problem Title</label>
            <input
              type="text"
              value={formData.problem_title}
              onChange={(e) => setFormData({ ...formData, problem_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="e.g., Engine making strange noise"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Describe the problem in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Est. Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="0.00"
              />
            </div>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Reporting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};