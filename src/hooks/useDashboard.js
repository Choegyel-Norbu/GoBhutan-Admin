import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/apiService';

export const useDashboard = (userId = null) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    revenue: 0,
    activeServices: 0,
    totalBuses: 0,
    totalHotels: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hotel bookings count using /bookings/hotel/count endpoint
      const hotelBookingsCountPromise = api.hotel.getBookingsCount();

      // Fetch bus bookings using user-specific endpoint if userId is provided
      const busBookingsPromise = api.bus.getBookings(userId);

      // Fetch data from all services in parallel
      // We use allSettled so that if one service fails (e.g. 403 Forbidden), 
      // it doesn't break the entire dashboard
      const results = await Promise.allSettled([
        hotelBookingsCountPromise,
        busBookingsPromise,
        api.taxi.getBookings(),
        api.movie.getBookings(),
        api.hotel.getHotels(),
        api.bus.getBuses()
      ]);

      const [
        hotelBookingsCountResult,
        busBookingsResult,
        taxiBookingsResult,
        movieBookingsResult,
        hotelsResult,
        busesResult
      ] = results;

      // Helper to extract data array safely
      const extractData = (result) => {
        if (result.status === 'fulfilled') {
          const val = result.value;
          // Handle { data: [...] } or [...] or { success: true, data: [...] }
          if (Array.isArray(val)) return val;
          if (val?.data && Array.isArray(val.data)) return val.data;
          // Sometimes APIs return { content: [...] } for pagination
          if (val?.content && Array.isArray(val.content)) return val.content;
          return [];
        }
        return [];
      };

      // Helper to extract count from response
      const extractCount = (result) => {
        if (result.status === 'fulfilled') {
          const val = result.value;
          // Handle different response structures for count
          if (typeof val === 'number') return val;
          if (val?.count !== undefined) return parseInt(val.count) || 0;
          if (val?.data !== undefined) {
            if (typeof val.data === 'number') return val.data;
            if (val.data?.count !== undefined) return parseInt(val.data.count) || 0;
          }
          return 0;
        }
        return 0;
      };

      const hotelBookingsCount = extractCount(hotelBookingsCountResult);
      const busBookings = extractData(busBookingsResult);
      const taxiBookings = extractData(taxiBookingsResult);
      const movieBookings = extractData(movieBookingsResult);
      const hotels = extractData(hotelsResult);
      const buses = extractData(busesResult);

      // Calculate Total Bookings
      const totalBookings = 
        hotelBookingsCount + 
        busBookings.length + 
        taxiBookings.length + 
        movieBookings.length;

      // Calculate Revenue
      // We attempt to find price fields. Common names: totalAmount, price, cost, amount
      const calculateRevenue = (items) => {
        return items.reduce((sum, item) => {
          const price = 
            parseFloat(item.totalAmount) || 
            parseFloat(item.price) || 
            parseFloat(item.cost) || 
            parseFloat(item.amount) || 
            0;
          return sum + price;
        }, 0);
      };

      const revenue = 
        calculateRevenue(busBookings) + 
        calculateRevenue(taxiBookings) + 
        calculateRevenue(movieBookings);
      // Note: Hotel revenue not included since we only have count, not booking details

      // Calculate Active Services (count services that have at least one booking or item)
      // Or simply based on what we successfully fetched
      let activeServicesCount = 0;
      if (hotels.length > 0 || hotelBookingsCount > 0) activeServicesCount++;
      if (buses.length > 0 || busBookings.length > 0) activeServicesCount++;
      if (taxiBookings.length > 0) activeServicesCount++;
      if (movieBookings.length > 0) activeServicesCount++;

      setStats({
        totalBookings,
        revenue,
        activeServices: activeServicesCount,
        totalBuses: buses.length,
        totalHotels: hotels.length
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, loading, error, refetch: fetchDashboardData };
};
