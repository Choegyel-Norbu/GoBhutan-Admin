import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clapperboard,
  RefreshCw,
  Ticket,
  User,
  Building,
  MapPin,
  CreditCard,
  Clock,
  XCircle,
  Search,
  Calendar,
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import Swal from 'sweetalert2';

function getMovieNameFromBooking(item) {
  if (!item || typeof item !== 'object') return '';
  const screening = item.screening;
  const name = item.movieName ?? screening?.movieName ?? item.movie ?? screening?.movie ?? '';
  return typeof name === 'string' ? name.trim() : '';
}

function formatBookedAt(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return isoString;
  }
}

function formatScreeningTime(startTime) {
  if (!startTime) return '';
  if (typeof startTime === 'object') {
    return `${String(startTime.hour ?? 0).padStart(2, '0')}:${String(startTime.minute ?? 0).padStart(2, '0')}`;
  }
  return String(startTime);
}

/** Flatten flat tickets and legacy nested bookings into table rows. */
function normalizeTheaterBookings(list) {
  const rows = [];
  list.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    if (item.ticketNumber != null || (item.seatIdentifier != null && item.customerName != null)) {
      rows.push({
        rowKey: item.ticketNumber ?? `ticket-${index}`,
        ticketNumber: item.ticketNumber,
        bookingRef: item.bookingRef ?? item.bookingReference,
        movieName: getMovieNameFromBooking(item),
        customerName: item.customerName,
        cidOrPassport: item.cidOrPassport,
        phoneNumber: item.phoneNumber,
        email: item.email,
        seatIdentifier: item.seatIdentifier ?? item.seatId,
        seatClass: item.seatClass,
        bookedAt: item.bookedAt,
        showTime: item.screeningDate
          ? `${item.screeningDate}${item.startTime ? ` ${formatScreeningTime(item.startTime)}` : ''}`
          : '',
        hallName: item.hallName,
      });
      return;
    }

    const tickets = item.tickets ?? item.bookingTickets ?? [];
    const screening = item.screening ?? item;
    const movieName = getMovieNameFromBooking(item) || getMovieNameFromBooking(screening);
    const bookingRef = item.bookingRef ?? item.bookingReference ?? item.reference;
    const showTime = screening?.screeningDate
      ? `${screening.screeningDate}${screening.startTime ? ` ${formatScreeningTime(screening.startTime)}` : ''}`
      : '';
    const hallName = screening?.hallName ?? item.hallName;

    if (tickets.length > 0) {
      tickets.forEach((t, i) => {
        rows.push({
          rowKey: t.ticketNumber ?? `${bookingRef ?? 'booking'}-${i}`,
          ticketNumber: t.ticketNumber,
          bookingRef,
          movieName,
          customerName: t.customerName,
          cidOrPassport: t.cidOrPassport ?? t.cid,
          phoneNumber: t.phoneNumber,
          email: t.email,
          seatIdentifier: t.seatIdentifier ?? t.seatId,
          seatClass: t.seatClass,
          bookedAt: t.bookedAt ?? item.bookedAt,
          showTime,
          hallName,
        });
      });
    } else {
      rows.push({
        rowKey: bookingRef ?? item.id ?? `booking-${index}`,
        ticketNumber: null,
        bookingRef,
        movieName,
        customerName: item.customerName,
        cidOrPassport: item.cidOrPassport,
        phoneNumber: item.phoneNumber,
        email: item.email,
        seatIdentifier: null,
        seatClass: null,
        bookedAt: item.bookedAt,
        showTime,
        hallName,
      });
    }
  });
  return rows;
}

const TABLE_GRID = 'lg:grid lg:grid-cols-[minmax(118px,1.1fr)_minmax(110px,1fr)_minmax(140px,1.35fr)_56px_72px_minmax(130px,1.1fr)_minmax(108px,1fr)_minmax(120px,auto)] lg:items-center lg:gap-3';

function TheaterBookingManagementPage() {
  const [locations, setLocations] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedMovieName, setSelectedMovieName] = useState('');
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
    setBookingSearch('');
    setSelectedMovieName('');
  }, [selectedTheaterId]);

  const rawList = useMemo(() => {
    const isArray = Array.isArray(data);
    return isArray ? data : (data && Array.isArray(data?.data) ? data.data : data ? [data] : []);
  }, [data]);

  const tableRows = useMemo(() => normalizeTheaterBookings(rawList), [rawList]);

  const movieNames = useMemo(() => {
    const names = new Set();
    tableRows.forEach((row) => {
      if (row.movieName) names.add(row.movieName);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [tableRows]);

  const filteredRows = useMemo(() => {
    let result = tableRows;
    const query = bookingSearch.trim().toLowerCase();
    if (query) {
      result = result.filter((row) =>
        row.ticketNumber?.toLowerCase().includes(query)
        || row.bookingRef?.toLowerCase().includes(query)
        || row.customerName?.toLowerCase().includes(query)
        || row.movieName?.toLowerCase().includes(query)
        || String(row.seatIdentifier ?? '').toLowerCase().includes(query)
        || row.email?.toLowerCase().includes(query)
        || row.phoneNumber?.includes(query),
      );
    }
    if (selectedMovieName) {
      result = result.filter((row) => row.movieName === selectedMovieName);
    }
    return result;
  }, [tableRows, bookingSearch, selectedMovieName]);

  const selectedTheater = theaters.find((t) => String(t.id) === String(selectedTheaterId));

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

  return (
    <PageWrapper
      title="Booking Management"
      description="View movie screening bookings by theater"
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="space-y-1.5 min-w-[160px] flex-1">
                <Label htmlFor="theater-location" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </Label>
                <Select
                  id="theater-location"
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
              <div className="space-y-1.5 min-w-[160px] flex-1">
                <Label htmlFor="theater-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" /> Theater
                </Label>
                <Select
                  id="theater-select"
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
              <div className="space-y-1.5 min-w-[160px] flex-1">
                <Label htmlFor="theater-movie-filter" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clapperboard className="h-3 w-3" /> Movie
                </Label>
                <Select
                  id="theater-movie-filter"
                  value={selectedMovieName}
                  onChange={(e) => setSelectedMovieName(e.target.value)}
                  disabled={!selectedTheaterId || loading || movieNames.length === 0}
                >
                  <option value="">All movies</option>
                  {movieNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 min-w-[200px] flex-1">
                <Label htmlFor="theater-booking-search" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                  <Input
                    id="theater-booking-search"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Ticket, guest, seat…"
                    className="h-9 pl-9"
                    disabled={!selectedTheaterId}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={fetchBookings}
                disabled={loading || !selectedTheaterId}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchBookings} disabled={!selectedTheaterId} className="h-7 text-xs">
              Retry
            </Button>
          </div>
        )}

        {!selectedTheaterId && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-xl border border-dashed border-border">
            <Building className="h-10 w-10 mb-3 opacity-30" aria-hidden />
            <p className="text-sm font-medium">Select a location and theater</p>
            <p className="text-xs mt-1">Choose filters above to view ticket bookings.</p>
          </div>
        )}

        {selectedTheaterId && (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/20">
              <p className="text-sm font-semibold text-foreground">
                {selectedTheater?.name ?? 'Theater'}
                <span className="ml-2 font-normal text-muted-foreground">
                  ({filteredRows.length}{(bookingSearch || selectedMovieName) && tableRows.length !== filteredRows.length ? ` of ${tableRows.length}` : ''} tickets)
                </span>
              </p>
            </div>

            {loading ? (
              <div className="p-4 space-y-2" aria-busy="true" aria-label="Loading bookings">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : tableRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Ticket className="h-10 w-10 mb-3 opacity-30" aria-hidden />
                <p className="text-sm font-medium">No bookings yet</p>
                <p className="text-xs mt-1 max-w-xs">No tickets recorded for this theater.</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Search className="h-10 w-10 mb-3 opacity-30" aria-hidden />
                <p className="text-sm font-medium">No matching bookings</p>
                <p className="text-xs mt-1">Try adjusting your search or movie filter.</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => { setBookingSearch(''); setSelectedMovieName(''); }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className={`hidden ${TABLE_GRID} px-4 py-2.5 bg-muted/40 border-b border-border min-w-[920px]`}
                  role="row"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ticket</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Movie</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Customer</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Seat</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Class</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Booked</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Booking Ref</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</span>
                </div>

                <div className="divide-y divide-border min-w-0 lg:min-w-[920px]">
                  {filteredRows.map((row) => (
                    <div
                      key={row.rowKey}
                      className={`flex flex-col gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors duration-150 ${TABLE_GRID}`}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Ticket</p>
                        <p className="font-mono text-xs font-semibold text-foreground truncate">{row.ticketNumber ?? '—'}</p>
                        {row.showTime && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                            {row.showTime}
                            {row.hallName ? ` · ${row.hallName}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Movie</p>
                        <p className="text-sm font-medium text-foreground truncate">{row.movieName || '—'}</p>
                      </div>

                      <div className="min-w-0 flex items-start gap-2">
                        <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <User className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Customer</p>
                          <p className="text-sm font-medium text-foreground truncate">{row.customerName || '—'}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <CreditCard className="h-3 w-3 shrink-0" aria-hidden />
                            {row.cidOrPassport || 'No ID'}
                          </p>
                          {(row.phoneNumber || row.email) && (
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {row.phoneNumber && <span>{row.phoneNumber}</span>}
                              {row.phoneNumber && row.email && ' · '}
                              {row.email && <span>{row.email}</span>}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Seat</p>
                        <span className="text-sm font-medium text-foreground tabular-nums">
                          {row.seatIdentifier ?? '—'}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Class</p>
                        {row.seatClass ? (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {row.seatClass}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden mb-1">Booked</p>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {formatBookedAt(row.bookedAt)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Booking Ref</p>
                        <p className="font-mono text-xs text-foreground truncate">{row.bookingRef ?? '—'}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-full lg:hidden mb-0.5">Actions</p>
                        {row.ticketNumber && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive whitespace-nowrap"
                            onClick={() => handleCancelTicket(row.ticketNumber)}
                          >
                            <XCircle className="h-3 w-3 mr-1" aria-hidden />
                            Cancel Ticket
                          </Button>
                        )}
                        {row.bookingRef && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive whitespace-nowrap"
                            onClick={() => handleCancelBooking(row.bookingRef)}
                          >
                            <XCircle className="h-3 w-3 mr-1" aria-hidden />
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default TheaterBookingManagementPage;
