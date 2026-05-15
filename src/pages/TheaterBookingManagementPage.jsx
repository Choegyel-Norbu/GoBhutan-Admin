import { useState, useEffect, useCallback } from 'react';
import { Clapperboard, RefreshCw, Ticket, User, Mail, Phone, Building, MapPin, CreditCard, Clock, XCircle } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

function TheaterBookingManagementPage() {
  const [locations, setLocations] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [data, setData] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingTheaters, setLoadingTheaters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get('/api/theater-locations');
      let list = [];
      if (response?.success && Array.isArray(response.data)) list = response.data;
      else if (Array.isArray(response)) list = response;
      else if (Array.isArray(response?.data)) list = response.data;
      setLocations(list);
      if (list.length > 0 && !selectedLocationId) setSelectedLocationId(String(list[0].id));
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchTheaters = async (locationId) => {
    if (!locationId) {
      setTheaters([]);
      setSelectedTheaterId('');
      return;
    }
    try {
      setLoadingTheaters(true);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const response = await apiClient.get(`/api/theaters/location/${locationId}`);
      let list = [];
      if (response?.success && Array.isArray(response.data)) list = response.data;
      else if (Array.isArray(response)) list = response;
      else if (Array.isArray(response?.data)) list = response.data;
      setTheaters(list);
      setSelectedTheaterId(list.length > 0 ? String(list[0].id) : '');
    } catch (err) {
      console.error('Error fetching theaters:', err);
      setTheaters([]);
      setSelectedTheaterId('');
    } finally {
      setLoadingTheaters(false);
    }
  };

  const fetchBookings = async () => {
    const theaterId = selectedTheaterId ? Number(selectedTheaterId) : null;
    if (!theaterId) {
      setData(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);

      const response = await apiClient.get(`/api/bookings/fetchAllbooking/${theaterId}`);

      let payload = response;
      if (response && response.success !== undefined && response.data !== undefined) {
        payload = response.data;
      } else if (response && Array.isArray(response?.data)) {
        payload = response.data;
      }
      setData(payload);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) fetchTheaters(selectedLocationId);
    else {
      setTheaters([]);
      setSelectedTheaterId('');
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (selectedTheaterId) fetchBookings();
    else setData(null);
  }, [selectedTheaterId]);

  const handleCancelTicket = useCallback(async (ticketNumber) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Ticket?',
      text: `Ticket ${ticketNumber} will be cancelled and the seat released.`,
      showCancelButton: true,
      confirmButtonText: 'Cancel Ticket',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Keep',
    });
    if (!result.isConfirmed) return;
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      await apiClient.post(`/api/bookings/cancel/ticket/${ticketNumber}`);
      await Swal.fire({ icon: 'success', title: 'Ticket Cancelled', timer: 1200, showConfirmButton: false });
      fetchBookings();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to cancel ticket.' });
    }
  }, [selectedTheaterId]);

  const handleCancelBooking = useCallback(async (bookingRef) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Entire Booking?',
      text: `Booking ${bookingRef} and all its tickets will be cancelled.`,
      showCancelButton: true,
      confirmButtonText: 'Cancel Booking',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Keep',
    });
    if (!result.isConfirmed) return;
    try {
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      await apiClient.post(`/api/bookings/cancel/booking/${bookingRef}`);
      await Swal.fire({ icon: 'success', title: 'Booking Cancelled', timer: 1200, showConfirmButton: false });
      fetchBookings();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to cancel booking.' });
    }
  }, [selectedTheaterId]);

  const isArray = Array.isArray(data);
  const list = isArray ? data : (data && Array.isArray(data?.data) ? data.data : data ? [data] : []);

  return (
    <PageWrapper
      title="Booking Management"
      description="View movie screening bookings by theater"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="space-y-1 min-w-[180px]">
              <Label className="text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </Label>
              <Select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                disabled={loadingLocations}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.dzongkhag || loc.name || `Location ${loc.id}`}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1 min-w-[180px]">
              <Label className="text-sm flex items-center gap-1">
                <Building className="h-3 w-3" /> Theater
              </Label>
              <Select
                value={selectedTheaterId}
                onChange={(e) => setSelectedTheaterId(e.target.value)}
                disabled={loadingTheaters || !selectedLocationId}
              >
                <option value="">Select theater</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              disabled={loading || !selectedTheaterId}
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mr-2" />
              Loading bookings…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {!selectedTheaterId && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              Select a location and theater to view bookings.
            </div>
          )}

          {!loading && !error && selectedTheaterId && (
            <>
              {isArray || (list && list.length > 0) ? (
                <div className="space-y-4">
                  {list.map((item, index) => (
                    <BookingCard key={item?.id ?? index} item={item} onCancelTicket={handleCancelTicket} onCancelBooking={handleCancelBooking} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No bookings for this theater.
                  {data != null && typeof data === 'object' && (
                    <pre className="mt-4 p-4 bg-muted/50 rounded-lg text-left overflow-auto text-xs">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function formatBookedAt(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return isoString;
  }
}

function BookingCard({ item, onCancelTicket, onCancelBooking }) {
  if (!item || typeof item !== 'object') {
    return (
      <div className="p-4 border rounded-lg bg-muted/30">
        <pre className="text-xs overflow-auto">{JSON.stringify(item, null, 2)}</pre>
      </div>
    );
  }

  // New API format: flat ticket with ticketNumber, seatIdentifier, seatClass, customerName, etc.
  if (item.ticketNumber != null || (item.seatIdentifier != null && item.customerName != null)) {
    return (
      <div className="p-4 border rounded-lg bg-background border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-mono font-semibold text-sm text-foreground">
                {item.ticketNumber ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                Seat {item.seatIdentifier ?? item.seatId ?? '—'}
                {item.seatClass && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    {item.seatClass}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatBookedAt(item.bookedAt)}
            </div>
            {item.ticketNumber && onCancelTicket && (
              <Button
                size="sm" variant="outline"
                className="h-7 text-xs text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onCancelTicket(item.ticketNumber)}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel Ticket
              </Button>
            )}
            {item.bookingRef && onCancelBooking && (
              <Button
                size="sm" variant="outline"
                className="h-7 text-xs text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onCancelBooking(item.bookingRef)}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel Booking
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{item.customerName ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{item.cidOrPassport ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <a href={`tel:${item.phoneNumber}`} className="hover:text-primary truncate">
              {item.phoneNumber ?? '—'}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
            <Mail className="h-4 w-4 shrink-0" />
            <a href={`mailto:${item.email}`} className="hover:text-primary truncate">
              {item.email ?? '—'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Legacy format: nested screening + tickets
  const tickets = item.tickets ?? item.bookingTickets ?? [];
  const screening = item.screening ?? item;
  const movieName = screening?.movieName ?? item.movieName ?? screening?.movie ?? '—';
  const screeningDate = screening?.screeningDate ?? item.screeningDate ?? item.date ?? '—';
  const startTime = screening?.startTime ?? item.startTime;
  const timeStr = startTime && typeof startTime === 'object'
    ? `${String(startTime.hour ?? 0).padStart(2, '0')}:${String(startTime.minute ?? 0).padStart(2, '0')}`
    : (startTime ?? '—');
  const hallName = screening?.hallName ?? item.hallName ?? '—';
  const theaterName = screening?.theaterName ?? item.theaterName ?? '—';
  const bookingRef = item.bookingRef ?? item.bookingReference ?? item.reference;

  return (
    <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{movieName}</span>
          <span className="text-muted-foreground">{screeningDate} {timeStr}</span>
          <span className="text-muted-foreground">{theaterName} · {hallName}</span>
        </div>
        {bookingRef && onCancelBooking && (
          <Button
            size="sm" variant="outline"
            className="h-7 text-xs text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onCancelBooking(bookingRef)}
          >
            <XCircle className="h-3 w-3 mr-1" /> Cancel Booking
          </Button>
        )}
      </div>
      {tickets.length > 0 && (
        <div className="space-y-2 pl-2 border-l-2 border-primary/30">
          {tickets.map((t, i) => (
            <div key={t.seatId ?? i} className="text-xs flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-medium">Seat {t.seatIdentifier ?? t.seatId ?? i + 1}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-0 text-muted-foreground">
                  {t.customerName && <span><User className="h-3 w-3 inline" /> {t.customerName}</span>}
                  {t.email && <span><Mail className="h-3 w-3 inline" /> {t.email}</span>}
                  {t.phoneNumber && <span><Phone className="h-3 w-3 inline" /> {t.phoneNumber}</span>}
                </div>
              </div>
              {t.ticketNumber && onCancelTicket && (
                <Button
                  size="sm" variant="ghost"
                  className="h-6 text-[10px] px-2 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => onCancelTicket(t.ticketNumber)}
                >
                  <XCircle className="h-3 w-3 mr-1" /> Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TheaterBookingManagementPage;
