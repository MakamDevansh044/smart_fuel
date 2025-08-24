import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useVehicles } from './hooks/useVehicles';
import { AuthForm } from './components/AuthForm';
import { VehicleDashboard } from './components/VehicleDashboard';
import { VehicleRegistration } from './components/VehicleRegistration';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { vehicles, loading: vehiclesLoading } = useVehicles();

  if (loading || (user && vehiclesLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600">Loading SmartFuel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <VehicleDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;