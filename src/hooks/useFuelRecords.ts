import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { FuelRecord } from '../types';

export const useFuelRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('fuel_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`fuel_records_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fuel_records',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addRecord = async (record: Omit<FuelRecord, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('fuel_records')
      .insert([{
        ...record,
        user_id: user.id,
      }]);

    if (error) throw error;
  };

  const updateLatestRecord = async (updates: Partial<Omit<FuelRecord, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user || records.length === 0) throw new Error('No records to update');

    const latestRecord = records[0];
    const { error } = await supabase
      .from('fuel_records')
      .update(updates)
      .eq('id', latestRecord.id);

    if (error) throw error;
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateLatestRecord,
    latestRecord: records[0] || null,
  };
};