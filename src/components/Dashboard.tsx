import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { 
  Fuel, 
  LogOut, 
  Plus, 
  Edit, 
  AlertTriangle, 
  TrendingUp,
  Gauge,
  Clock
} from 'lucide-react';
import { AddPetrolModal } from './AddPetrolModal';
import { UpdateOdometerModal } from './UpdateOdometerModal';
import { HistoryLog } from './HistoryLog';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { records, latestRecord, loading } = useFuelRecords();
  const [showAddPetrol, setShowAddPetrol] = useState(false);
  const [showUpdateOdometer, setShowUpdateOdometer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600">Loading your fuel data...</p>
        </div>
      </div>
    );
  }

  // Calculate current stats
  const currentPetrol = latestRecord?.petrol_left || 0;
  const currentMileage = latestRecord?.estimated_mileage || 15;
  const currentRange = currentPetrol * currentMileage;
  const isOnReserve = latestRecord?.is_reserve || false;
  const isLowFuel = currentPetrol < 2 || currentRange < 10;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartFuel</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Clock className="h-5 w-5" />
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {isLowFuel && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Low Fuel Alert!</h3>
              <p className="text-sm text-red-700">
                {currentPetrol < 1 
                  ? 'Your tank is nearly empty. Refuel immediately!'
                  : `Only ${currentRange.toFixed(0)} km range remaining. Consider refueling soon.`
                }
              </p>
            </div>
          </div>
        )}

        {isOnReserve && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Fuel className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900">Running on Reserve</h3>
              <p className="text-sm text-amber-700">
                You're currently on reserve fuel. The system is learning your mileage.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Petrol Left</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPetrol.toFixed(1)}L
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${currentPetrol < 2 ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Fuel className={`h-6 w-6 ${currentPetrol < 2 ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mileage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentMileage.toFixed(1)} km/L
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Range</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentRange.toFixed(0)} km
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${currentRange < 10 ? 'bg-red-100' : 'bg-purple-100'}`}>
                    <Gauge className={`h-6 w-6 ${currentRange < 10 ? 'text-red-600' : 'text-purple-600'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Odometer Info */}
            {latestRecord && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Reading</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Odometer Reading</p>
                    <p className="text-xl font-bold text-gray-900">
                      {latestRecord.odometer_reading.toLocaleString()} km
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {new Date(latestRecord.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpdateOdometer(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddPetrol(true)}
                  className="w-full flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Petrol
                </button>
                
                <button
                  onClick={() => setShowUpdateOdometer(true)}
                  className="w-full flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-5 w-5" />
                  Update Odometer
                </button>

                {!isOnReserve && (
                  <SetToReserveButton 
                    currentRecord={latestRecord}
                    records={records}
                  />
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Smart Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Update your odometer regularly for accurate tracking</li>
                <li>• Set to reserve when your fuel warning light comes on</li>
                <li>• The app learns your mileage automatically over time</li>
                <li>• Keep at least 10km range for safety</li>
              </ul>
            </div>
          </div>
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="mt-8">
            <HistoryLog records={records} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddPetrol && (
        <AddPetrolModal
          isOpen={showAddPetrol}
          onClose={() => setShowAddPetrol(false)}
          currentRecord={latestRecord}
        />
      )}

      {showUpdateOdometer && (
        <UpdateOdometerModal
          isOpen={showUpdateOdometer}
          onClose={() => setShowUpdateOdometer(false)}
          currentRecord={latestRecord}
        />
      )}
    </div>
  );
};

// Set to Reserve Button Component
const SetToReserveButton: React.FC<{ 
  currentRecord: any; 
  records: any[] 
}> = ({ currentRecord, records }) => {
  const { updateLatestRecord, addRecord } = useFuelRecords();
  const [loading, setLoading] = useState(false);

  const handleSetToReserve = async () => {
    if (!currentRecord || loading) return;

    setLoading(true);
    try {
      // Find the last reserve record to calculate mileage
      const lastReserveIndex = records.findIndex((record, index) => 
        index > 0 && record.is_reserve
      );

      let newMileage = currentRecord.mileage;

      if (lastReserveIndex > 0) {
        const lastReserveRecord = records[lastReserveIndex];
        const newEstimatedMileage = (currentMileage + (distance / petrolUsed)) / 2;
        
        if (distanceTraveled > 0) {
          // Assume tank capacity is about 15L (adjust as needed)
          const petrolUsed = 15 - 1; // Full tank minus reserve
          const recentMileage = distanceTraveled / petrolUsed;
          
          // Update mileage: average of old and new
          newMileage = (currentRecord.mileage + recentMileage) / 2;
        }
      }

      if (currentRecord) {
        await updateLatestRecord({
          petrol_left: 1, // Reserve level
          is_reserve: true,
          estimated_mileage: newEstimatedMileage,
        });
      } else {
        // Create first record
        await addRecord({
          odometer_reading: 0,
          petrol_left: 1,
          estimated_mileage: currentMileage,
          is_reserve: true,
        });
      }
    } catch (error) {
      console.error('Error setting to reserve:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSetToReserve}
      disabled={loading}
      className="w-full flex items-center gap-3 bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <AlertTriangle className="h-5 w-5" />
      {loading ? 'Setting...' : 'Set to Reserve'}
    </button>
  );
};