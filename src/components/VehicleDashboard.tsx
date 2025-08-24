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
  Droplets
} from 'lucide-react';
import { VehicleRegistration } from './VehicleRegistration';
import { UpdateOdometerModal } from './UpdateOdometerModal';
import { AddPetrolModal } from './AddPetrolModal';
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
      <div className="text-center mb-2">
        <p className="text-xs font-medium text-gray-600">Fuel Tank</p>
        <p className="text-lg font-bold text-gray-900">{currentLevel.toFixed(1)}L</p>
        <p className="text-xs text-gray-500">of {capacity}L</p>
      </div>
      
      {/* Tank Container */}
      <div className={`relative mx-auto ${
        vehicleType === 'bike' ? 'w-16 h-24' : 'w-20 h-28'
      } bg-gray-200 rounded-lg border-2 border-gray-300 overflow-hidden shadow-inner`}>
        
        {/* Fuel Level with Animation */}
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
            isCritical ? 'bg-gradient-to-t from-red-500 to-red-400' :
            isLow ? 'bg-gradient-to-t from-orange-500 to-orange-400' :
            isReserve ? 'bg-gradient-to-t from-amber-500 to-amber-400' :
            'bg-gradient-to-t from-blue-500 to-blue-400'
          }`}
          style={{ height: `${percentage}%` }}
        >
          {/* Liquid Animation Effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-white rounded-full animate-pulse" 
                 style={{ 
                   animation: 'wave 2s ease-in-out infinite',
                   transform: 'scale(0.8)'
                 }} />
          </div>
        </div>
        
        {/* Tank Markings */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((mark) => (
            <div 
              key={mark}
              className="absolute left-0 right-0 h-px bg-gray-400 opacity-50"
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>
        
        {/* Reserve Indicator */}
        {isReserve && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-amber-600 text-white text-xs px-1 py-0.5 rounded animate-pulse">
              R
            </div>
          </div>
        )}
      </div>
      
      {/* Status Indicator */}
      <div className="text-center mt-2">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isCritical ? 'bg-red-100 text-red-800' :
          isLow ? 'bg-orange-100 text-orange-800' :
          isReserve ? 'bg-amber-100 text-amber-800' :
          'bg-green-100 text-green-800'
        }`}>
          <Droplets className="h-3 w-3" />
          {isCritical ? 'Critical' : isLow ? 'Low' : isReserve ? 'Reserve' : 'Good'}
        </div>
      </div>
    </div>
  );
};

// Real-time Odometer Component
const RealtimeOdometer: React.FC<{ 
  reading: number; 
  lastUpdated: string;
}> = ({ reading, lastUpdated }) => {
  const formatNumber = (num: number) => {
    return num.toFixed(1).padStart(8, '0');
  };

  return (
    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-center border-2 border-gray-700 shadow-lg">
      <div className="text-xs text-green-300 mb-1">ODOMETER</div>
      <div className="text-2xl font-bold tracking-wider">
        {formatNumber(reading).split('').map((digit, index) => (
          <span 
            key={index}
            className="inline-block bg-gray-800 border border-gray-600 px-1 mx-0.5 rounded transition-all duration-300"
          >
            {digit}
          </span>
        ))}
      </div>
      <div className="text-xs text-green-300 mt-1">KM</div>
      <div className="text-xs text-gray-400 mt-2">
        Updated: {new Date(lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export const VehicleDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { vehicles, loading, updateVehicle } = useVehicles();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showUpdateOdometer, setShowUpdateOdometer] = useState(false);
  const [showAddPetrol, setShowAddPetrol] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600 text-lg">Loading your vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return <VehicleRegistration onComplete={() => window.location.reload()} />;
  }

  // Fixed Mileage Calculation Functions
  const handleSetReserve = async (vehicle: Vehicle) => {
    try {
      console.log('=== SET RESERVE CALCULATION ===');
      console.log('Vehicle:', vehicle.vehicle_number);
      console.log('Current ODO:', vehicle.current_odometer);
      console.log('Last Reserve ODO:', vehicle.last_reserve_odo);
      console.log('Current Fuel:', vehicle.current_fuel_level);
      console.log('Tank Capacity:', vehicle.tank_capacity);
      console.log('Reserve Capacity:', vehicle.reserve_tank_capacity);
      
      let newMileage = vehicle.mileage;
      let calculationMethod = vehicle.mileage_calculation_method;

      // Reserve-to-Reserve Calculation (FIXED FORMULA)
      if (vehicle.last_reserve_odo > 0 && vehicle.current_odometer > vehicle.last_reserve_odo) {
        const distanceTraveled = vehicle.current_odometer - vehicle.last_reserve_odo;
        
        // Petrol used = (Tank capacity - Reserve capacity) - Current fuel level + Reserve capacity
        // This represents: Full tank minus reserve, minus what's left, plus reserve we're setting to
        const petrolUsed = (vehicle.tank_capacity - vehicle.reserve_tank_capacity) - vehicle.current_fuel_level + vehicle.reserve_tank_capacity;
        
        console.log('Distance since last reserve:', distanceTraveled, 'km');
        console.log('Petrol used calculation:', `(${vehicle.tank_capacity} - ${vehicle.reserve_tank_capacity}) - ${vehicle.current_fuel_level} + ${vehicle.reserve_tank_capacity} = ${petrolUsed}L`);
        
        if (petrolUsed > 0 && distanceTraveled > 0) {
          const calculatedMileage = distanceTraveled / petrolUsed;
          newMileage = (vehicle.mileage + calculatedMileage) / 2; // Average with previous
          calculationMethod = 'reserve_to_reserve';
          
          console.log('Calculated Mileage:', calculatedMileage.toFixed(2), 'km/L');
          console.log('New Average Mileage:', newMileage.toFixed(2), 'km/L');
        }
      }

      await updateVehicle(vehicle.id, {
        is_on_reserve: true,
        current_fuel_level: vehicle.reserve_tank_capacity,
        mileage: newMileage,
        last_reserve_odo: vehicle.current_odometer,
        last_reserve_date: new Date().toISOString(),
        mileage_calculation_method: calculationMethod,
      });
      
      console.log('Reserve set successfully!');
      console.log('=== END CALCULATION ===');
    } catch (error) {
      console.error('Error setting reserve:', error);
    }
  };

  const handleTankFull = async (vehicle: Vehicle) => {
    try {
      console.log('=== TANK FULL CALCULATION ===');
      console.log('Vehicle:', vehicle.vehicle_number);
      console.log('Current ODO:', vehicle.current_odometer);
      console.log('Last Full Tank ODO:', vehicle.last_full_tank_odo);
      console.log('Current Fuel:', vehicle.current_fuel_level);
      console.log('Tank Capacity:', vehicle.tank_capacity);
      
      let newMileage = vehicle.mileage;
      let calculationMethod = vehicle.mileage_calculation_method;

      // Full-Tank-to-Full-Tank Calculation (FIXED FORMULA)
      if (vehicle.last_full_tank_odo > 0 && vehicle.current_odometer > vehicle.last_full_tank_odo) {
        const distanceTraveled = vehicle.current_odometer - vehicle.last_full_tank_odo;
        
        // Petrol used = Tank capacity - Current fuel level
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

      await updateVehicle(vehicle.id, {
        current_fuel_level: vehicle.tank_capacity,
        is_on_reserve: false,
        mileage: newMileage,
        last_full_tank_odo: vehicle.current_odometer,
        last_full_tank_date: new Date().toISOString(),
        mileage_calculation_method: calculationMethod,
      });
      
      console.log('Tank full set successfully!');
      console.log('=== END CALCULATION ===');
    } catch (error) {
      console.error('Error setting tank full:', error);
    }
  };

  const handleUpdateOdometer = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowUpdateOdometer(true);
  };

  const handleAddPetrol = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowAddPetrol(true);
  };

  const calculateRange = (fuelLevel: number, mileage: number) => {
    return fuelLevel * mileage;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2 shadow-lg">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartFuel Pro
                </h1>
                <p className="text-sm text-gray-500">Welcome, {user?.email}</p>
              </div>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Vehicle Fleet</h2>
          <p className="text-gray-600">Advanced fuel tracking with real-time analytics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => {
            const range = calculateRange(vehicle.current_fuel_level, vehicle.mileage);
            const isLowFuel = vehicle.current_fuel_level < 2 || range < 10;
            
            return (
              <div key={vehicle.id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                {/* Enhanced Vehicle Header */}
                <div className={`bg-gradient-to-r ${
                  vehicle.vehicle_type === 'bike' 
                    ? 'from-blue-600 to-cyan-600' 
                    : 'from-purple-600 to-pink-600'
                } p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {vehicle.vehicle_type === 'bike' ? (
                          <Bike className="h-8 w-8" />
                        ) : (
                          <Car className="h-8 w-8" />
                        )}
                        <div>
                          <h3 className="font-bold text-xl">{vehicle.vehicle_number}</h3>
                          <p className="text-white/80 text-sm capitalize">{vehicle.vehicle_type}</p>
                        </div>
                      </div>
                      {vehicle.is_on_reserve && (
                        <div className="bg-amber-500 text-amber-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          RESERVE
                        </div>
                      )}
                    </div>
                    
                    {/* Mileage Display */}
                    <div className="flex items-center gap-2 text-white/90">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Efficiency: {vehicle.mileage.toFixed(1)} km/L</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {vehicle.mileage_calculation_method?.replace('_', '-to-') || 'manual'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Alerts */}
                {isLowFuel && (
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {vehicle.current_fuel_level < 1 
                        ? '🚨 CRITICAL: Tank nearly empty!'
                        : `⚠️ LOW FUEL: ${range.toFixed(0)}km range remaining`
                      }
                    </p>
                  </div>
                )}

                {/* Main Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Animated Fuel Tank */}
                    <FuelTank 
                      currentLevel={vehicle.current_fuel_level}
                      capacity={vehicle.tank_capacity}
                      isReserve={vehicle.is_on_reserve}
                      vehicleType={vehicle.vehicle_type}
                    />
                    
                    {/* Range Display */}
                    <div className="text-center">
                      <div className={`p-4 rounded-xl mb-2 ${
                        range < 10 ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <Gauge className={`h-8 w-8 mx-auto ${
                          range < 10 ? 'text-red-600' : 'text-green-600'
                        }`} />
                      </div>
                      <p className="text-xs font-medium text-gray-600">Estimated Range</p>
                      <p className="text-2xl font-bold text-gray-900">{range.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">kilometers</p>
                    </div>
                  </div>

                  {/* Real-time Odometer */}
                  <div className="mb-6">
                    <RealtimeOdometer 
                      reading={vehicle.current_odometer}
                      lastUpdated={vehicle.updated_at || vehicle.created_at || new Date().toISOString()}
                    />
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAddPetrol(vehicle)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        Add Fuel
                      </button>
                      <button
                        onClick={() => handleUpdateOdometer(vehicle)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium"
                      >
                        <Edit className="h-4 w-4" />
                        Update ODO
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {vehicle.has_reserve_tank && !vehicle.is_on_reserve && (
                        <button
                          onClick={() => handleSetReserve(vehicle)}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Set Reserve
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleTankFull(vehicle)}
                        className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium ${
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
      </div>

      {/* Modals */}
      {showAddVehicle && (
        <VehicleRegistration
          isModal={true}
          onComplete={() => {
            setShowAddVehicle(false);
            window.location.reload();
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

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0px) scale(0.8); }
          50% { transform: translateY(-2px) scale(0.9); }
        }
      `}</style>
    </div>
  );
};