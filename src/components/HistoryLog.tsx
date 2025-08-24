import React from 'react';
import { Calendar, Fuel, Gauge, TrendingUp, AlertTriangle } from 'lucide-react';
import type { FuelRecord } from '../types';

interface HistoryLogProps {
  records: FuelRecord[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
        <p className="text-gray-500">Start tracking your fuel usage to see history here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Fuel History</h2>
        <p className="text-gray-500 text-sm">Track your fuel usage patterns over time</p>
      </div>

      <div className="divide-y">
        {records.map((record, index) => {
          const previousRecord = records[index + 1];
          const distanceTraveled = previousRecord 
            ? record.odometer_reading - previousRecord.odometer_reading
            : 0;

          return (
            <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    record.is_reserve 
                      ? 'bg-amber-100' 
                      : record.petrol_left < 2 
                        ? 'bg-red-100' 
                        : 'bg-blue-100'
                  }`}>
                    {record.is_reserve ? (
                      <AlertTriangle className={`h-5 w-5 text-amber-600`} />
                    ) : (
                      <Fuel className={`h-5 w-5 ${
                        record.petrol_left < 2 ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {new Date(record.created_at).toLocaleDateString()}
                      </h3>
                      {record.is_reserve && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                          Reserve
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Odometer</p>
                        <p className="font-medium">{record.odometer_reading.toLocaleString()} km</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Petrol Left</p>
                        <p className="font-medium">{record.petrol_left.toFixed(1)}L</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Mileage</p>
                        <p className="font-medium">{record.mileage.toFixed(1)} km/L</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Range</p>
                        <p className="font-medium">{(record.petrol_left * record.mileage).toFixed(0)} km</p>
                      </div>
                    </div>

                    {distanceTraveled > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Distance since last update: <span className="font-medium">{distanceTraveled} km</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(record.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};