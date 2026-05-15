import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/apiService';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalRooms: 0,
    hotelBookings: 0,
    totalBuses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.hotel.getHotels(),
        api.hotel.getRooms(),
        api.hotel.getBookingsCount(),
        api.bus.getBuses(),
      ]);

      const [hotelsResult, roomsResult, hotelBookingsResult, busesResult] = results;

      const extractList = (result) => {
        if (result.status !== 'fulfilled') return [];
        const val = result.value;
        if (Array.isArray(val)) return val;
        if (Array.isArray(val?.data)) return val.data;
        if (Array.isArray(val?.content)) return val.content;
        return [];
      };

      const extractCount = (result) => {
        if (result.status !== 'fulfilled') return 0;
        const val = result.value;
        if (typeof val === 'number') return val;
        if (typeof val?.data === 'number') return val.data;
        if (typeof val?.count === 'number') return val.count;
        if (typeof val?.data?.count === 'number') return val.data.count;
        // Fall back to list length if it returned an array
        const list = extractList(result);
        return list.length;
      };

      setStats({
        totalHotels: extractList(hotelsResult).length,
        totalRooms: extractList(roomsResult).length,
        hotelBookings: extractCount(hotelBookingsResult),
        totalBuses: extractList(busesResult).length,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, loading, error, refetch: fetchDashboardData };
};
