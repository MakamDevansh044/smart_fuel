import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../contexts/AuthContext';
import { 
  Car, 
  Bike, 
  Fuel, 
  Gauge, 
  Plus, 
  Edit, 
  AlertTriangle, 
  LogOut,
  TrendingUp,
  Settings,
  Droplets,
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { VehicleRegistration } from './VehicleRegistration';
import { UpdateOdometerModal } from './UpdateOdometerModal';
import { AddPetrolModal } from './AddPetrolModal';
import { SetReserveModal } from './SetReserveModal';
import { TankFullModal } from './TankFullModal';
import { MaintenanceTracker } from './MaintenanceTracker';
import { ProblemsTracker } from './ProblemsTracker';
import type { Vehicle } from '../types';

// Animated Fuel Tank Component
const FuelTank: React.FC<{ 
  currentLevel: number; 
  capacity: number; 
  isReserve: boolean;
  vehicleType: 'car' | 'bike';
}> = ({ currentLevel, capacity, isReserve, vehicleType }) => {
  const percentage = Math.max(0, Math.min(100, (currentLevel / capacity) * 100));
  const isLow = percentage < 20;
  const isCritical = percentage < 10;
  
  return (
    <div className="relative">
      <div className="text-center mb-3">
        <p className="text-xs font-medium text-gray-600">Fuel Tank</p>
        <p className="text-2xl font-bold text-gray-900">{currentLevel.toFixed(1)}L</p>
        <p className="text-xs text-gray-500">of {capacity}L</p>
      </div>
      
      {/* Tank Container */}
      <div className={`relative mx-auto ${
        vehicleType === 'bike' ? 'w-20 h-32' : 'w-24 h-36'
      } bg-gray-200 rounded-2xl border-3 border-gray-300 overflow-hidden shadow-inner`}>
        
        {/* Fuel Level with Animation */}
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out rounded-b-2xl ${
            isCritical ? 'bg-gradient-to-t from-red-500 via-red-400 to-red-300' :
            isLow ? 'bg-gradient-to-t from-orange-500 via-orange-400 to-orange-300' :
            isReserve ? 'bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300' :
            'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300'
          }`}
          style={{ height: `${percentage}%` }}
        >
          {/* Liquid Animation Effect */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-white rounded-full animate-pulse" 
                 style={{ 
                   animation: 'wave 3s ease-in-out infinite',
                   transform: 'scale(0.9)'
                 }} />
          </div>
          
          {/* Fuel Surface Animation */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-full animate-bounce" 
               style={{ animationDuration: '2s' }} />
        </div>
        
        {/* Tank Markings */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((mark) => (
            <div 
              key={mark}
              className="absolute left-2 right-2 h-px bg-gray-400 opacity-60"
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>
        
        {/* Reserve Indicator */}
        {isReserve && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full animate-pulse font-bold">
              RESERVE
            </div>
          </div>
        )}
      </div>
      
      {/* Status Indicator */}
      <div className="text-center mt-3">
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
          isCritical ? 'bg-red-100 text-red-800 animate-pulse' :
          isLow ? 'bg-orange-100 text-orange-800' :
          isReserve ? 'bg-amber-100 text-amber-800' :
          'bg-green-100 text-green-800'
        }`}>
          <Droplets className="h-3 w-3" />
          {isCritical ? 'CRITICAL' : isLow ? 'LOW' : isReserve ? 'RESERVE' : 'GOOD'}
        </div>
      </div>
    </div>
  );
};

// Real-time Odometer Component with Decimal
const RealtimeOdometer: React.FC<{ 
  reading: number; 
  lastUpdated: string;
}> = ({ reading, lastUpdated }) => {
  const formatNumber = (num: number) => {
    return num.toFixed(1).padStart(8, '0');
  };

  const formattedReading = formatNumber(reading);
  const beforeDecimal = formattedReading.slice(0, -2);
  const afterDecimal = formattedReading.slice(-1);

  return (
    <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-center border-2 border-gray-700 shadow-xl">
      <div className="text-xs text-green-300 mb-2 tracking-wider">ODOMETER</div>
      <div className="text-2xl font-bold tracking-wider flex items-center justify-center">
        {beforeDecimal.split('').map((digit, index) => (
          <span 
            key={index}
            className="inline-block bg-gray-800 border border-gray-600 px-1 mx-0.5 rounded transition-all duration-300 hover:bg-gray-700"
          >
            {digit}
          </span>
        ))}
        <span className="mx-1 text-green-300">.</span>
        <span className="inline-block bg-gray-800 border border-gray-600 px-1 mx-0.5 rounded transition-all duration-300 hover:bg-gray-700">
          {afterDecimal}
        </span>
      </div>
      <div className="text-xs text-green-300 mt-2 tracking-wider">KILOMETERS</div>
      <div className="text-xs text-gray-400 mt-2">
        Updated: {new Date(lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const range = vehicle.current_fuel_level * vehicle.mileage;
  const fuelPercentage = (vehicle.current_fuel_level / vehicle.tank_capacity) * 100;
  
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
        <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
        <p className="text-xs text-blue-700 font-medium">Efficiency</p>
        <p className="text-lg font-bold text-blue-900">{vehicle.mileage.toFixed(1)}</p>
        <p className="text-xs text-blue-600">km/L</p>
      </div>
      
      <div className={`rounded-xl p-3 text-center border ${
        range < 10 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
        range < 30 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' :
        'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
      }`}>
        <Gauge className={`h-5 w-5 mx-auto mb-1 ${
          range < 10 ? 'text-red-600' : range < 30 ? 'text-orange-600' : 'text-green-600'
        }`} />
        <p className={`text-xs font-medium ${
          range < 10 ? 'text-red-700' : range < 30 ? 'text-orange-700' : 'text-green-700'
        }`}>Range</p>
        <p className={`text-lg font-bold ${
          range < 10 ? 'text-red-900' : range < 30 ? 'text-orange-900' : 'text-green-900'
        }`}>{range.toFixed(0)}</p>
        <p className={`text-xs ${
          range < 10 ? 'text-red-600' : range < 30 ? 'text-orange-600' : 'text-green-600'
        }`}>km</p>
      </div>
      
      <div className={`rounded-xl p-3 text-center border ${
        fuelPercentage < 10 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
        fuelPercentage < 25 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' :
        'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
      }`}>
        <Fuel className={`h-5 w-5 mx-auto mb-1 ${
          fuelPercentage < 10 ? 'text-red-600' : 
          fuelPercentage < 25 ? 'text-orange-600' : 'text-purple-600'
        }`} />
        <p className={`text-xs font-medium ${
          fuelPercentage < 10 ? 'text-red-700' : 
          fuelPercentage < 25 ? 'text-orange-700' : 'text-purple-700'
        }`}>Fuel %</p>
        <p className={`text-lg font-bold ${
          fuelPercentage < 10 ? 'text-red-900' : 
          fuelPercentage < 25 ? 'text-orange-900' : 'text-purple-900'
        }`}>{fuelPercentage.toFixed(0)}</p>
        <p className={`text-xs ${
          fuelPercentage < 10 ? 'text-red-600' : 
          fuelPercentage < 25 ? 'text-orange-600' : 'text-purple-600'
        }`}>%</p>
      </div>
    </div>
  );
};

export const VehicleDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { vehicles, loading } = useVehicles();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showUpdateOdometer, setShowUpdateOdometer] = useState(false);
  const [showAddPetrol, setShowAddPetrol] = useState(false);
  const [showSetReserve, setShowSetReserve] = useState(false);
  const [showTankFull, setShowTankFull] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showProblems, setShowProblems] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'maintenance' | 'problems'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-gray-600 text-xl font-medium">Loading SmartFuel Pro...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your vehicle data</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return <VehicleRegistration onComplete={() => window.location.reload()} />;
  }

  const handleSetReserve = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowSetReserve(true);
  };

  const handleTankFull = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowTankFull(true);
  };

  const handleUpdateOdometer = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowUpdateOdometer(true);
  };

  const handleAddPetrol = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowAddPetrol(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartFuel Pro
                </h1>
                <p className="text-sm text-gray-500">Welcome, {user?.email}</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Gauge className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'maintenance'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wrench className="h-4 w-4" />
                Maintenance
              </button>
              <button
                onClick={() => setActiveTab('problems')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'problems'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                Issues
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddVehicle(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:block">Add Vehicle</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-white/50 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex gap-1 bg-white/80 backdrop-blur-lg rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              <Gauge className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              <Wrench className="h-4 w-4" />
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'problems'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              Issues
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Your Vehicle Fleet</h2>
              <p className="text-gray-600 text-lg">Advanced fuel tracking with real-time analytics</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => {
                const range = vehicle.current_fuel_level * vehicle.mileage;
                const isLowFuel = vehicle.current_fuel_level < 2 || range < 10;
                
                return (
                  <div key={vehicle.id} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                    {/* Enhanced Vehicle Header */}
                    <div className={`bg-gradient-to-r ${
                      vehicle.vehicle_type === 'bike' 
                        ? 'from-blue-600 via-cyan-600 to-teal-600' 
                        : 'from-purple-600 via-pink-600 to-rose-600'
                    } p-6 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {vehicle.vehicle_type === 'bike' ? (
                              <Bike className="h-10 w-10 drop-shadow-lg" />
                            ) : (
                              <Car className="h-10 w-10 drop-shadow-lg" />
                            )}
                            <div>
                              <h3 className="font-bold text-2xl tracking-wide">{vehicle.vehicle_number}</h3>
                              <p className="text-white/90 text-sm capitalize font-medium">{vehicle.vehicle_type}</p>
                            </div>
                          </div>
                          {vehicle.is_on_reserve && (
                            <div className="bg-amber-500 text-amber-900 px-3 py-2 rounded-full text-xs font-bold animate-pulse shadow-lg">
                              🔥 RESERVE
                            </div>
                          )}
                        </div>
                        
                        {/* Mileage Display */}
                        <div className="flex items-center gap-2 text-white/90">
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm font-medium">Efficiency: {vehicle.mileage.toFixed(1)} km/L</span>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                            {vehicle.mileage_calculation_method?.replace('_', '-to-') || 'manual'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Critical Alerts */}
                    {isLowFuel && (
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 flex items-center gap-3 animate-pulse">
                        <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">
                            {vehicle.current_fuel_level < 1 
                              ? '🚨 CRITICAL: Tank nearly empty!'
                              : `⚠️ LOW FUEL WARNING`
                            }
                          </p>
                          <p className="text-xs opacity-90">
                            {range.toFixed(0)}km range remaining
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="p-6">
                      {/* Quick Stats */}
                      <QuickStats vehicle={vehicle} />
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Animated Fuel Tank */}
                        <FuelTank 
                          currentLevel={vehicle.current_fuel_level}
                          capacity={vehicle.tank_capacity}
                          isReserve={vehicle.is_on_reserve}
                          vehicleType={vehicle.vehicle_type}
                        />
                        
                        {/* Real-time Odometer */}
                        <div>
                          <RealtimeOdometer 
                            reading={vehicle.current_odometer}
                            lastUpdated={vehicle.updated_at || vehicle.created_at}
                          />
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleAddPetrol(vehicle)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-bold"
                          >
                            <Plus className="h-4 w-4" />
                            Add Fuel
                          </button>
                          <button
                            onClick={() => handleUpdateOdometer(vehicle)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-bold"
                          >
                            <Edit className="h-4 w-4" />
                            Update ODO
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {vehicle.has_reserve_tank && !vehicle.is_on_reserve && (
                            <button
                              onClick={() => handleSetReserve(vehicle)}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-bold"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Set Reserve
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleTankFull(vehicle)}
                            className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-bold ${
                              vehicle.has_reserve_tank && !vehicle.is_on_reserve ? '' : 'col-span-2'
                            }`}
                          >
                            <Fuel className="h-4 w-4" />
                            Tank Full
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <MaintenanceTracker vehicles={vehicles} />
        )}

        {/* Problems Tab */}
        {activeTab === 'problems' && (
          <ProblemsTracker vehicles={vehicles} />
        )}
      </div>

      {/* Modals */}
      {showAddVehicle && (
        <VehicleRegistration
          isModal={true}
          onComplete={() => {
            setShowAddVehicle(false);
          }}
          onClose={() => setShowAddVehicle(false)}
        />
      )}

      {showUpdateOdometer && selectedVehicle && (
        <UpdateOdometerModal
          isOpen={showUpdateOdometer}
          onClose={() => {
            setShowUpdateOdometer(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {showAddPetrol && selectedVehicle && (
        <AddPetrolModal
          isOpen={showAddPetrol}
          onClose={() => {
            setShowAddPetrol(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {showSetReserve && selectedVehicle && (
        <SetReserveModal
          isOpen={showSetReserve}
          onClose={() => {
            setShowSetReserve(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {showTankFull && selectedVehicle && (
        <TankFullModal
          isOpen={showTankFull}
          onClose={() => {
            setShowTankFull(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0px) scale(0.9); }
          50% { transform: translateY(-3px) scale(0.95); }
        }
      `}</style>
    </div>
  );
};