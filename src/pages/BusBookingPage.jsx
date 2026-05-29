import { useState, useEffect, useRef } from 'react';
import {
  Calendar, MapPin, Clock, Users, Bus,
  ChevronRight, RefreshCw, X, AlertCircle
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { api, apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { buildBusLockBookingPayload, syncApplicantArraysForSeats } from '@/lib/busBooking';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-muted/50 ${className}`} />;
}

function BusBookingPage() {
  const [activeView, setActiveView] = useState('create');

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [scheduleBus, setScheduleBus] = useState(null);
  const [availableSeatsData, setAvailableSeatsData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    seatNumbers: [],
    seatLabels: [],
    scheduleId: null,
    applicantCids: [],
    applicantNames: [],
    applicantMobiles: [],
    applicantEmail: '',
    status: 'PENDING',
  });

  const [isLockingSchedule, setIsLockingSchedule] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [hasFetchedSchedules, setHasFetchedSchedules] = useState(false);
  const [lockBookingResult, setLockBookingResult] = useState(null);

  const bookingFormRef = useRef(null);
  const lockDetailsRef = useRef(null);

  // ── Data Helpers ────────────────────────────────────────────────────────────

  const extractArrayData = (response, keys = []) => {
    if (Array.isArray(response)) return response;
    if (!response) return [];
    for (const key of keys) {
      if (Array.isArray(response?.[key])) return response[key];
    }
    return [];
  };

  const getSeatStatus = (seat) =>
    String(seat?.status || seat?.bookingStatus || '').toUpperCase();

  const extractLockBookingResult = (response) => {
    if (!response) return null;
    const raw = response?.data ?? response;
    if (raw?.bookingRef || Array.isArray(raw?.seats)) return raw;
    if (raw?.data?.bookingRef || Array.isArray(raw?.data?.seats)) return raw.data;
    return null;
  };

  const extractTicketData = (response) => {
    if (!response) return null;
    const raw = response?.data ?? response;
    if (raw?.bookingId || raw?.bookingRef) return raw;
    if (raw?.data?.bookingId || raw?.data?.bookingRef) return raw.data;
    return null;
  };

  const extractConfirmBookingResult = (response) => {
    if (!response) return null;
    const raw = response?.data ?? response;
    if (raw?.bookingRef || Array.isArray(raw?.seats)) return raw;
    if (raw?.data?.bookingRef || Array.isArray(raw?.data?.seats)) return raw.data;
    return null;
  };

  const buildTicketMarkup = (ticketData, fallbackBookingRef = '') => {
    const bookingRef = ticketData?.bookingRef || fallbackBookingRef || 'N/A';
    const status = ticketData?.status || 'BOOKED';
    const busNumber = ticketData?.busNumber || 'N/A';
    const busName = ticketData?.busName || 'N/A';
    const routeSource = ticketData?.source || 'N/A';
    const routeDestination = ticketData?.destination || 'N/A';
    const departure = formatDateTime(ticketData?.departureTime);
    const arrival = formatDateTime(ticketData?.arrivalTime);
    const seatNumber = ticketData?.seatNumber ?? 'N/A';
    const mobile = ticketData?.applicantMobile || 'N/A';
    const email = ticketData?.applicantEmail || 'N/A';
    const cid = ticketData?.applicantCid || 'N/A';

    return `
      <div style="max-width:520px;margin:0 auto;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
        <div style="border:1px solid #d1d5db;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#111827 0%,#1f2937 100%);color:#fff;padding:14px 16px;">
            <div style="font-size:18px;font-weight:700;letter-spacing:.2px;">YaYa</div>
            <div style="font-size:12px;opacity:.9;margin-top:2px;">Booking Ref: ${bookingRef}</div>
          </div>
          <div style="padding:14px 16px;">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px;">
              <div style="font-size:14px;font-weight:600;color:#111827;">${routeSource} → ${routeDestination}</div>
              <span style="font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;background:#dcfce7;color:#166534;border:1px solid #86efac;">${status}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">
                <div style="font-size:11px;color:#6b7280;">Bus Number</div>
                <div style="font-size:13px;font-weight:600;color:#111827;">${busNumber}</div>
              </div>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">
                <div style="font-size:11px;color:#6b7280;">Bus Name</div>
                <div style="font-size:13px;font-weight:600;color:#111827;">${busName}</div>
              </div>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">
                <div style="font-size:11px;color:#6b7280;">Departure</div>
                <div style="font-size:12px;font-weight:600;color:#111827;">${departure}</div>
              </div>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">
                <div style="font-size:11px;color:#6b7280;">Arrival</div>
                <div style="font-size:12px;font-weight:600;color:#111827;">${arrival}</div>
              </div>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:8px;">
                <div style="font-size:11px;color:#6b7280;">Seat Number</div>
                <div style="font-size:13px;font-weight:700;color:#111827;">${seatNumber}</div>
              </div>
            </div>
            <div style="border-top:1px dashed #d1d5db;padding-top:10px;margin-top:4px;">
              <div style="font-size:11px;color:#6b7280;margin-bottom:6px;">Passenger</div>
              <div style="font-size:12px;line-height:1.55;color:#111827;">
                <div><strong>CID:</strong> ${cid}</div>
                <div><strong>Mobile:</strong> ${mobile}</div>
                <div><strong>Email:</strong> ${email}</div>
              </div>
            </div>
            ${ticketData?.qrCodeBase64 ? `
              <div style="display:flex;justify-content:center;margin-top:14px;">
                <img src="data:image/png;base64,${ticketData.qrCodeBase64}" alt="Ticket QR Code"
                  style="width:150px;height:150px;border:1px solid #e5e7eb;border-radius:8px;padding:6px;background:#fff;" />
              </div>
              <div style="text-align:center;font-size:11px;color:#6b7280;margin-top:6px;">Show this QR at boarding</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  };

  const downloadTicketAsPdf = (ticketData, fallbackBookingRef = '') => {
    if (!ticketData) return;
    const bookingRef = (ticketData?.bookingRef || fallbackBookingRef || 'ticket').replace(/[^a-zA-Z0-9-_]/g, '_');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let y = 50;

    doc.setFillColor(17, 24, 39);
    doc.roundedRect(margin, y, contentWidth, 64, 10, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('YaYa', margin + 16, y + 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Booking Ref: ${ticketData?.bookingRef || fallbackBookingRef || 'N/A'}`, margin + 16, y + 44);
    y += 84;

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`${ticketData?.source || 'N/A'} -> ${ticketData?.destination || 'N/A'}`, margin, y);
    y += 20;

    const rowGap = 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Bus Number: ${ticketData?.busNumber || 'N/A'}`, margin, y);
    doc.text(`Bus Name: ${ticketData?.busName || 'N/A'}`, margin + contentWidth / 2, y);
    y += rowGap;
    doc.text(`Departure: ${formatDateTime(ticketData?.departureTime)}`, margin, y);
    doc.text(`Arrival: ${formatDateTime(ticketData?.arrivalTime)}`, margin + contentWidth / 2, y);
    y += rowGap;
    doc.text(`Seat Number: ${ticketData?.seatNumber ?? 'N/A'}`, margin, y);
    doc.text(`Status: ${ticketData?.status || 'BOOKED'}`, margin + contentWidth / 2, y);
    y += rowGap;
    doc.text(`CID: ${ticketData?.applicantCid || 'N/A'}`, margin, y);
    doc.text(`Mobile: ${ticketData?.applicantMobile || 'N/A'}`, margin + contentWidth / 2, y);
    y += rowGap;
    doc.text(`Email: ${ticketData?.applicantEmail || 'N/A'}`, margin, y);
    y += 18;

    doc.setDrawColor(209, 213, 219);
    doc.line(margin, y, margin + contentWidth, y);
    y += 16;

    if (ticketData?.qrCodeBase64) {
      const qrDataUri = ticketData.qrCodeBase64.startsWith('data:image')
        ? ticketData.qrCodeBase64
        : `data:image/png;base64,${ticketData.qrCodeBase64}`;
      const qrSize = 150;
      const qrX = margin + (contentWidth - qrSize) / 2;
      doc.addImage(qrDataUri, 'PNG', qrX, y, qrSize, qrSize);
      y += qrSize + 20;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Show this QR at boarding', pageWidth / 2, y, { align: 'center' });
    }

    doc.save(`yaya-ticket-${bookingRef}.pdf`);
  };

  const getBusId = (bus) => bus?.id || bus?.busId || bus?.bus_id || null;
  const getRouteId = (route) => route?.id || route?.routeId || route?.route_id || null;

  const extractSeatConfigList = (response) => {
    if (!response) return [];
    const raw = response?.data ?? response;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.seatConfigs)) return raw.seatConfigs;
    if (Array.isArray(raw?.seats)) return raw.seats;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  };

  const extractScheduleSeatList = (response) => {
    if (!response) return [];
    const raw = response?.data ?? response;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.seats)) return raw.seats;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.content)) return raw.content;
    return [];
  };

  const seatIdentityCandidates = (seat) =>
    [seat?.seatNumber, seat?.number, seat?.startNo, seat?.seatNo, seat?.id, seat?.seatLabel, seat?.label]
      .map((v) => (v == null ? '' : String(v).trim().toUpperCase()))
      .filter(Boolean);

  const buildSeatStatusLookup = (scheduleSeatsResponse) => {
    const scheduleSeats = extractScheduleSeatList(scheduleSeatsResponse);
    const lookup = new Map();
    scheduleSeats.forEach((seat) => {
      const status = getSeatStatus(seat);
      if (!status) return;
      seatIdentityCandidates(seat).forEach((c) => lookup.set(c, status));
    });
    return lookup;
  };

  const buildSeatData = (seatConfigResponse, scheduleSeatsResponse, busInfo = null, scheduleInfo = null) => {
    const seatConfigs = extractSeatConfigList(seatConfigResponse);
    const seatStatusLookup = buildSeatStatusLookup(scheduleSeatsResponse);
    const normalizedSeats = seatConfigs.map((seat) => {
      const seatNumberRaw = seat?.seatNumber ?? seat?.number ?? seat?.startNo ?? seat?.id;
      const seatNumber = seatNumberRaw?.toString() || '';
      const seatLabel = seat?.seatLabel || seat?.label || `Seat ${seatNumberRaw ?? ''}`.trim();
      const resolvedStatusKey = seatIdentityCandidates({ ...seat, seatNumber, seatLabel }).find(
        (c) => seatStatusLookup.has(c)
      );
      const scheduleStatus = resolvedStatusKey ? seatStatusLookup.get(resolvedStatusKey) : '';
      const seatStatus = scheduleStatus || getSeatStatus(seat) || 'AVAILABLE';
      const isAvailable = seatStatus === 'AVAILABLE' && seat?.available !== false;
      return {
        ...seat,
        seatNumber,
        seatLabel,
        seatType: seat?.seatType || seat?.type || 'STANDARD',
        status: seatStatus,
        available: isAvailable,
        fare: seat?.fare ?? scheduleInfo?.price ?? 0,
      };
    });
    const seats = normalizedSeats.length > 0 ? normalizedSeats : [];
    return {
      seats,
      totalSeats: seats.length,
      availableSeats: seats.filter((s) => s.available !== false).length,
      busNumber: busInfo?.busNumber,
      busId: getBusId(busInfo),
    };
  };

  const buildSeatDataFromScheduleSeatsOnly = (scheduleSeatsResponse, busInfo = null, scheduleInfo = null) => {
    const scheduleSeats = extractScheduleSeatList(scheduleSeatsResponse);
    const seats = scheduleSeats.map((seat) => {
      const seatNumberRaw = seat?.seatNumber ?? seat?.number ?? seat?.startNo ?? seat?.id;
      const seatNumber = seatNumberRaw?.toString() || '';
      const seatStatus = getSeatStatus(seat) || 'AVAILABLE';
      return {
        ...seat,
        seatNumber,
        seatLabel: seat?.seatLabel || seat?.label || `Seat ${seatNumberRaw ?? ''}`.trim(),
        seatType: seat?.seatType || seat?.type || 'STANDARD',
        status: seatStatus,
        available: seatStatus === 'AVAILABLE',
        fare: seat?.fare ?? scheduleInfo?.price ?? 0,
      };
    });
    return {
      seats,
      totalSeats: seats.length,
      availableSeats: seats.filter((s) => s.available !== false).length,
      busNumber: busInfo?.busNumber,
      busId: getBusId(busInfo),
    };
  };

  // ── Data Fetching ───────────────────────────────────────────────────────────

  const loadBuses = async () => {
    setLoadingBuses(true);
    try {
      const busesResponse = await api.bus.getBuses();
      const busesData = extractArrayData(busesResponse, ['data', 'buses']).filter((bus) => getBusId(bus));
      setBuses(busesData);
    } catch (error) {
      console.error('Error loading buses:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to load buses. Please refresh and try again.' });
    } finally {
      setLoadingBuses(false);
    }
  };

  const fetchRoutesForBus = async (busId) => {
    if (!busId) return [];
    setLoadingRoutes(true);
    try {
      const routesResponse = await api.bus.getRoutes(busId);
      const routesData = extractArrayData(routesResponse, ['data', 'routes']).filter((r) => getRouteId(r));
      setRoutes(routesData);
      return routesData;
    } catch (error) {
      console.error(`Error loading routes for bus ${busId}:`, error);
      Swal.fire({ icon: 'error', title: 'Routes Unavailable', text: 'Failed to load routes for the selected bus.' });
      setRoutes([]);
      return [];
    } finally {
      setLoadingRoutes(false);
    }
  };

  const enrichSchedules = (schedulesData, resolvedRoutes, bus) =>
    schedulesData
      .map((schedule) => {
        const scheduleRouteId = schedule.routeId || schedule.route?.id;
        const matchedRoute = resolvedRoutes.find((r) => {
          const rid = getRouteId(r);
          return rid && scheduleRouteId && rid === scheduleRouteId;
        });
        return { ...schedule, route: matchedRoute || schedule.route || null, bus: schedule.bus || bus || null };
      })
      .filter((s) => s && s.id);

  const fetchSchedulesForRoute = async (route, busContext = null) => {
    const routeId = getRouteId(route);
    if (!routeId) {
      Swal.fire({ icon: 'error', title: 'Invalid Route', text: 'Selected route is missing an identifier.' });
      return [];
    }
    setLoadingSchedules(true);
    try {
      const schedulesResponse = await api.bus.getSchedulesByRoute(routeId);
      const schedulesData = extractArrayData(schedulesResponse, ['data', 'schedules']);
      const enrichedSchedules = enrichSchedules(
        schedulesData,
        routes.length > 0 ? routes : [route],
        busContext || selectedBus
      );
      setSchedules(enrichedSchedules);
      setHasFetchedSchedules(true);
      return enrichedSchedules;
    } catch (error) {
      console.error(`Error loading schedules for route ${routeId}:`, error);
      Swal.fire({ icon: 'error', title: 'Schedules Unavailable', text: 'Failed to load schedules for the selected route.' });
      setSchedules([]);
      setHasFetchedSchedules(false);
      return [];
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadSeatDataForSchedule = async (schedule, busContext = null) => {
    if (!schedule?.id) return;
    setLoadingSeats(true);
    try {
      const busIdentifier =
        getBusId(busContext) || schedule?.busId || getBusId(schedule?.bus) || getBusId(selectedBus);
      const scheduleSeatsResponse = await api.bus.getScheduleSeats(schedule.id);
      let seatData;
      if (!busIdentifier) {
        seatData = buildSeatDataFromScheduleSeatsOnly(
          scheduleSeatsResponse,
          busContext || schedule?.bus || selectedBus,
          schedule
        );
      } else {
        const seatConfigResponse = await api.bus.getSeatConfigs(busIdentifier);
        seatData = buildSeatData(
          seatConfigResponse,
          scheduleSeatsResponse,
          busContext || schedule?.bus || selectedBus,
          schedule
        );
        if (!seatData?.seats?.length) {
          seatData = buildSeatDataFromScheduleSeatsOnly(
            scheduleSeatsResponse,
            busContext || schedule?.bus || selectedBus,
            schedule
          );
        }
      }
      setAvailableSeatsData(seatData);
      if (!schedule?.bus && seatData?.busNumber && !scheduleBus) {
        setScheduleBus((prev) =>
          prev || { busNumber: seatData.busNumber, totalSeats: seatData.totalSeats, availableSeats: seatData.availableSeats }
        );
      }
    } catch (error) {
      console.error('Error fetching seat data:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load seat information. Please try again.' });
      setAvailableSeatsData(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  // ── Event Handlers ──────────────────────────────────────────────────────────

  const handleSelectBus = async (bus) => {
    if (!bus) return;
    const busId = getBusId(bus);
    if (!busId) {
      Swal.fire({ icon: 'error', title: 'Invalid Bus', text: 'Selected bus is missing an identifier.' });
      return;
    }
    setSelectedBus(bus);
    setSelectedRoute(null);
    setSelectedSchedule(null);
    setScheduleBus(null);
    setAvailableSeatsData(null);
    setHasFetchedSchedules(false);
    setRoutes([]);
    setSchedules([]);
    setBookingForm((prev) => ({
      ...prev,
      scheduleId: null,
      seatNumbers: [],
      seatLabels: [],
      applicantCids: [],
      applicantNames: [],
      applicantMobiles: [],
    }));
    await fetchRoutesForBus(busId);
  };

  const handleSelectRoute = async (route) => {
    if (!selectedBus) {
      Swal.fire({ icon: 'info', title: 'Select a Bus', text: 'Choose a bus before selecting routes.' });
      return;
    }
    setSelectedRoute(route);
    setSelectedSchedule(null);
    setScheduleBus(null);
    setAvailableSeatsData(null);
    setHasFetchedSchedules(false);
    setSchedules([]);
    setBookingForm((prev) => ({
      ...prev,
      scheduleId: null,
      seatNumbers: [],
      seatLabels: [],
      applicantCids: [],
      applicantNames: [],
      applicantMobiles: [],
    }));
    await fetchSchedulesForRoute(route, selectedBus);
  };

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setLockBookingResult(null);
    setBookingForm((prev) => ({
      ...prev,
      scheduleId: schedule.id,
      seatNumbers: [],
      seatLabels: [],
      applicantCids: [],
      applicantNames: [],
      applicantMobiles: [],
    }));
    const scheduleContextBus = schedule.bus || selectedBus || null;
    if (scheduleContextBus) setScheduleBus(scheduleContextBus);
    setAvailableSeatsData(null);
    await loadSeatDataForSchedule(schedule, scheduleContextBus || selectedBus);
  };

  const loadAllSchedules = async () => {
    if (!selectedBus) {
      Swal.fire({ icon: 'info', title: 'Select a Bus', text: 'Please pick a bus to view its routes and schedules.' });
      return;
    }
    if (!selectedRoute) {
      Swal.fire({ icon: 'info', title: 'Select a Route', text: 'Choose a route to load its schedules.' });
      return;
    }
    await fetchSchedulesForRoute(selectedRoute, selectedBus);
  };

  const handleBookingChange = (field, value) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  const getSeatLabelValue = (seatNumber) => {
    if (!seatNumber) return '';
    const targetSeat = availableSeatsData?.seats?.find(
      (seat) => (seat?.seatNumber ?? seat?.id)?.toString() === seatNumber.toString()
    );
    return targetSeat?.seatLabel || targetSeat?.label || `Seat ${seatNumber}`;
  };

  const handleSeatSelection = (seatNumber) => {
    const normalizedSeat = seatNumber?.toString();
    if (!normalizedSeat) return;
    setBookingForm((prev) => {
      const currentSeats = prev.seatNumbers || [];
      const seatExists = currentSeats.includes(normalizedSeat);
      const updatedSeats = seatExists
        ? currentSeats.filter((s) => s !== normalizedSeat)
        : [...currentSeats, normalizedSeat];
      const seatLabels = updatedSeats.map(getSeatLabelValue);
      return {
        ...prev,
        ...syncApplicantArraysForSeats(
          updatedSeats,
          seatLabels,
          prev.applicantCids,
          prev.applicantNames,
          prev.seatNumbers,
          prev.applicantMobiles
        ),
      };
    });
  };

  const handlePassengerFieldChange = (seatIndex, field, value) => {
    const arrayKey =
      field === 'cid' ? 'applicantCids' : field === 'name' ? 'applicantNames' : 'applicantMobiles';
    setBookingForm((prev) => {
      const next = [...(prev[arrayKey] || [])];
      while (next.length < (prev.seatNumbers?.length || 0)) next.push('');
      next[seatIndex] = value;
      return { ...prev, [arrayKey]: next };
    });
  };

  const validateBookingPayload = () => {
    if (!bookingForm.scheduleId) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please select a schedule before booking.' });
      return false;
    }
    if (!bookingForm.seatNumbers?.length) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please select at least one seat.' });
      return false;
    }
    const seatCount = bookingForm.seatNumbers?.length || 0;
    const missingCid = (bookingForm.applicantCids || []).some((c) => !String(c || '').trim());
    const missingName = (bookingForm.applicantNames || []).some((n) => !String(n || '').trim());
    if (missingCid || bookingForm.applicantCids?.length !== seatCount) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please enter a CID for each selected seat.' });
      return false;
    }
    if (missingName || bookingForm.applicantNames?.length !== seatCount) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please enter a name for each selected seat.' });
      return false;
    }
    const missingMobile = (bookingForm.applicantMobiles || []).some((m) => !String(m || '').trim());
    if (missingMobile || bookingForm.applicantMobiles?.length !== seatCount) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please enter a mobile number for each selected seat.' });
      return false;
    }
    return true;
  };

  const handleBookSchedule = async () => {
    if (!validateBookingPayload()) return;
    const seatLabelsResolved =
      bookingForm.seatLabels?.length === bookingForm.seatNumbers?.length
        ? bookingForm.seatLabels
        : (bookingForm.seatNumbers || []).map(getSeatLabelValue);
    const payload = buildBusLockBookingPayload({
      scheduleId: bookingForm.scheduleId,
      seatNumbers: bookingForm.seatNumbers,
      seatLabels: seatLabelsResolved,
      applicantCids: bookingForm.applicantCids,
      applicantNames: bookingForm.applicantNames,
      applicantMobiles: bookingForm.applicantMobiles,
      applicantEmail: bookingForm.applicantEmail,
      status: bookingForm.status?.trim() || 'PENDING',
    });
    try {
      setIsLockingSchedule(true);
      Swal.fire({
        title: 'Locking Seats…',
        text: 'Please wait while we reserve your seats.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const lockResponse = await api.bus.lockBooking(payload);
      const lockResult = extractLockBookingResult(lockResponse);
      setLockBookingResult(lockResult);
      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'Seats Locked!',
        text: 'The selected seats have been reserved successfully.',
        confirmButtonColor: '#10b981',
      });
      setBookingForm((prev) => ({
        ...prev,
        seatNumbers: [],
        seatLabels: [],
        applicantCids: [],
        applicantNames: [],
        applicantMobiles: [],
        applicantEmail: '',
        status: 'PENDING',
      }));
      if (selectedSchedule) await loadSeatDataForSchedule(selectedSchedule, scheduleBus || selectedBus);
      setTimeout(() => lockDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (error) {
      console.error('Error locking booking:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error?.response?.data?.message || 'Failed to lock seats. Please try again.',
      });
    } finally {
      setIsLockingSchedule(false);
    }
  };

  const handleConfirmLockedBooking = async (seat) => {
    const bookingRef = String(lockBookingResult?.bookingRef || seat?.bookingRef || '').trim();
    if (!bookingRef) {
      Swal.fire({ icon: 'error', title: 'Cannot confirm', text: 'Booking reference is missing for this lock.' });
      return;
    }
    try {
      setIsConfirmingBooking(true);
      const token = authAPI.getStoredToken();
      if (token) apiClient.setAuthToken(token);
      const confirmRes = await api.bus.confirmBooking({ bookingRef });
      const confirmResult = extractConfirmBookingResult(confirmRes);
      const isConfirmSuccess = confirmRes?.success === true || Boolean(confirmResult);
      if (!isConfirmSuccess) throw new Error(confirmRes?.message || 'Failed to confirm booking.');
      const confirmedBookingRef = String(confirmResult?.bookingRef || bookingRef).trim();
      const bookingId = Number(
        confirmResult?.seats?.find((s) => s?.bookingId != null)?.bookingId ??
          seat?.id ??
          lockBookingResult?.seats?.find((s) => s?.id != null)?.id
      );
      let ticketData = null;
      if (Number.isFinite(bookingId) && bookingId > 0) {
        try {
          const ticketResponse = await api.bus.getBookingTicket(bookingId);
          ticketData = extractTicketData(ticketResponse);
        } catch (ticketError) {
          console.error('Error fetching booking ticket:', ticketError);
        }
      }
      const ticketHtml = ticketData ? buildTicketMarkup(ticketData, confirmedBookingRef) : '';
      const result = await Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed',
        html: ticketData
          ? ticketHtml
          : `Booking ${confirmedBookingRef} has been confirmed. Ticket is not available yet.`,
        confirmButtonText: ticketData ? 'Close' : 'OK',
        showDenyButton: !!ticketData,
        denyButtonText: 'Download PDF',
        confirmButtonColor: '#10b981',
        denyButtonColor: '#1f2937',
        width: ticketData ? 560 : undefined,
      });
      if (result.isDenied && ticketData) downloadTicketAsPdf(ticketData, confirmedBookingRef);
      setLockBookingResult(null);
      if (selectedSchedule) await loadSeatDataForSchedule(selectedSchedule, scheduleBus || selectedBus);
    } catch (error) {
      console.error('Error confirming locked booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error?.response?.data?.message || error?.message || 'Failed to confirm booking. Please try again.',
      });
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  const resetBooking = () => {
    setLockBookingResult(null);
    setSelectedSchedule(null);
    setScheduleBus(null);
    setAvailableSeatsData(null);
    setBookingForm({
      seatNumbers: [],
      seatLabels: [],
      scheduleId: null,
      applicantCids: [],
      applicantNames: [],
      applicantMobiles: [],
      applicantEmail: '',
      status: 'PENDING',
    });
  };

  const generateSeats = (totalSeats) => Array.from({ length: totalSeats }, (_, i) => i + 1);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const isPastSchedule = (departureTime) => {
    if (!departureTime) return false;
    return new Date(departureTime) < new Date();
  };

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeView === 'create' && buses.length === 0) loadBuses();
  }, [activeView, buses.length]);

  useEffect(() => {
    if (selectedSchedule && bookingFormRef.current) {
      setTimeout(() => bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [selectedSchedule]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <PageWrapper title="Bus Booking" description="Search and book bus tickets for your journey.">

      {/* ── Explorer Layout ───────────────────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row rounded-xl border border-border overflow-hidden bg-card"
        style={{ minHeight: '600px' }}
      >

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col">

          {/* Buses */}
          <div className="p-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <Bus className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Buses</span>
              {loadingBuses && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />}
            </div>

            {loadingBuses ? (
              <div className="space-y-1">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : buses.length === 0 ? (
              <p className="px-2 py-1 text-sm text-muted-foreground">No buses available.</p>
            ) : (
              <nav className="space-y-px">
                {buses.map((bus, index) => {
                  const busId = getBusId(bus);
                  const selectedBusId = selectedBus ? getBusId(selectedBus) : null;
                  const isActive = selectedBusId && busId ? selectedBusId === busId : selectedBus === bus;
                  const buttonKey = busId || bus.busNumber || `bus-${index}`;
                  return (
                    <button
                      key={buttonKey}
                      type="button"
                      onClick={() => handleSelectBus(bus)}
                      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate leading-tight">
                          {bus.busName || 'Unnamed Bus'}
                        </p>
                        <p className={`text-xs truncate leading-tight ${
                          isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {bus.busNumber} · {bus.busType || 'Standard'}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 shrink-0 ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs">{bus.totalSeats || bus.capacity || 0}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-80" />}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Routes (when bus selected) */}
          {selectedBus && (
            <div className="border-t border-border/50 p-3 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Routes</span>
                {loadingRoutes && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />}
              </div>

              {loadingRoutes ? (
                <div className="space-y-1">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : routes.length === 0 ? (
                <p className="px-2 py-1 text-sm text-muted-foreground">No routes for this bus.</p>
              ) : (
                <nav className="space-y-px">
                  {routes.map((route, index) => {
                    const routeId = getRouteId(route);
                    const selectedRouteId = selectedRoute ? getRouteId(selectedRoute) : null;
                    const isActive = selectedRouteId && routeId ? selectedRouteId === routeId : selectedRoute === route;
                    const routeKey = routeId || `${route.source}-${index}`;
                    return (
                      <button
                        key={routeKey}
                        type="button"
                        onClick={() => handleSelectRoute(route)}
                        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate leading-tight">
                            {route.source || 'N/A'} → {route.destination || 'N/A'}
                          </p>
                          <p className={`text-xs truncate leading-tight ${
                            isActive ? 'text-primary/70' : 'text-muted-foreground'
                          }`}>
                            {route.distance ? `${route.distance} km` : 'Distance N/A'}
                          </p>
                        </div>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          )}
        </aside>

        {/* ── MAIN PANEL ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Breadcrumb bar + Tab toggle */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-3 bg-card shrink-0 flex-wrap gap-y-2">
            <Bus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className={`text-sm truncate ${selectedBus ? 'text-foreground' : 'text-muted-foreground'}`}>
              {selectedBus?.busName ?? 'No bus selected'}
            </span>
            {selectedRoute && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">
                  {selectedRoute.source || 'N/A'} → {selectedRoute.destination || 'N/A'}
                </span>
              </>
            )}

            {/* Tab toggle */}
            <div className="ml-auto flex items-center gap-0.5 bg-muted/70 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('create')}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  activeView === 'create'
                    ? 'bg-background text-foreground shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Booking
              </button>
              <button
                type="button"
                onClick={() => setActiveView('action')}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  activeView === 'action'
                    ? 'bg-background text-foreground shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Booking Action
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* ── Booking Action View ── */}
            {activeView === 'action' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Booking Action Panel</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">
                  Manage existing bookings — view, edit, cancel, or process refunds.
                </p>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground/50">
                  <p>• View all bookings</p>
                  <p>• Edit booking details</p>
                  <p>• Cancel bookings</p>
                  <p>• Process refunds</p>
                </div>
              </div>
            )}

            {/* ── Create Booking View ── */}
            {activeView === 'create' && (
              <>
                {/* Empty: no bus */}
                {!selectedBus && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                      <Bus className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Select a bus</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                      Choose a bus from the sidebar to view its routes.
                    </p>
                  </div>
                )}

                {/* Empty: bus selected but no route */}
                {selectedBus && !selectedRoute && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center select-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                      <MapPin className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Select a route</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                      Pick a route from the sidebar to see available schedules.
                    </p>
                  </div>
                )}

                {/* Schedules + Booking (route selected) */}
                {selectedBus && selectedRoute && (
                  <div className="space-y-4">

                    {/* Schedules header */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold text-foreground">Schedules</h2>
                      {!loadingSchedules && schedules.length > 0 && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                          {schedules.length}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto h-7 gap-1.5 text-xs px-3"
                        onClick={loadAllSchedules}
                        disabled={loadingSchedules}
                      >
                        {loadingSchedules ? (
                          <><RefreshCw className="h-3 w-3 animate-spin" />Loading…</>
                        ) : (
                          <><RefreshCw className="h-3 w-3" />Refresh</>
                        )}
                      </Button>
                    </div>

                    {/* Schedules table */}
                    {loadingSchedules ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                      </div>
                    ) : !hasFetchedSchedules ? (
                      <div className="rounded-lg border border-dashed py-14 text-center">
                        <Calendar className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          Click &ldquo;Refresh&rdquo; to load schedules for this route.
                        </p>
                      </div>
                    ) : schedules.length === 0 ? (
                      <div className="rounded-lg border border-dashed py-14 text-center">
                        <Calendar className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No schedules found for this route.</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="hidden sm:grid sm:grid-cols-[1fr_180px_72px_108px] items-center gap-4 px-4 py-2 bg-muted/40 border-b border-border">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Schedule
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Departure
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">
                            Seats
                          </span>
                          <span />
                        </div>
                        <div className="divide-y divide-border">
                          {schedules.map((schedule) => {
                            const isSelected = selectedSchedule?.id === schedule.id;
                            const isPast = isPastSchedule(schedule.departureTime);
                            return (
                              <div key={schedule.id}>
                                <div className={`flex sm:grid sm:grid-cols-[1fr_180px_72px_108px] items-center gap-3 sm:gap-4 px-4 py-3 transition-colors ${
                                  isPast
                                    ? 'opacity-50'
                                    : isSelected
                                      ? 'bg-primary/5'
                                      : 'hover:bg-muted/20'
                                }`}>
                                  {/* Schedule info */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                                      isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                                    }`}>
                                      <Bus className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-sm font-medium text-foreground block truncate">
                                        {schedule.route?.source || selectedRoute.source || 'N/A'} →{' '}
                                        {schedule.route?.destination || selectedRoute.destination || 'N/A'}
                                      </span>
                                      {schedule.route?.estimatedDuration && (
                                        <span className="text-[10px] text-muted-foreground">
                                          {schedule.route.estimatedDuration} min
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Departure */}
                                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                    <span>{formatDateTime(schedule.departureTime)}</span>
                                  </div>

                                  {/* Seats */}
                                  <div className="hidden sm:flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                                    <Users className="h-3.5 w-3.5 shrink-0" />
                                    <span>{schedule.availableSeats ?? '—'}</span>
                                  </div>

                                  {/* Action */}
                                  <div className="shrink-0 flex items-center sm:justify-end">
                                    {isPast ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                                        Departed
                                      </span>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant={isSelected ? 'default' : 'outline'}
                                        onClick={() => handleSelectSchedule(schedule)}
                                        disabled={schedule.availableSeats === 0 || loadingSeats}
                                        className="h-7 text-xs px-3"
                                      >
                                        {schedule.availableSeats === 0
                                          ? 'Sold Out'
                                          : isSelected
                                            ? 'Selected'
                                            : 'Book'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Booking Form ──────────────────────────────────────── */}
                    {selectedSchedule && (
                      <div ref={bookingFormRef} className="rounded-lg border border-border overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
                          <div className="flex items-center gap-2 min-w-0">
                            <Bus className="h-4 w-4 text-muted-foreground shrink-0" />
                            <h3 className="text-sm font-semibold text-foreground shrink-0">Book Schedule</h3>
                            <span className="text-xs text-muted-foreground truncate">
                              {selectedRoute.source} → {selectedRoute.destination} ·{' '}
                              {formatDateTime(selectedSchedule.departureTime)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={resetBooking}
                            aria-label="Close booking form"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="p-5 space-y-6">

                          {/* Seat Selection */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">Select Seats</h4>
                              <span className="text-xs text-muted-foreground">
                                {bookingForm.seatNumbers.length > 0
                                  ? `${bookingForm.seatNumbers.length} selected`
                                  : 'None selected'}
                              </span>
                              {availableSeatsData && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {availableSeatsData.availableSeats} available
                                </span>
                              )}
                            </div>

                            {loadingSeats ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground">Loading available seats…</p>
                              </div>
                            ) : availableSeatsData?.seats ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-2">
                                  {availableSeatsData.seats.map((seat) => {
                                    const seatId = seat.seatNumber?.toString();
                                    const isSelected = bookingForm.seatNumbers.includes(seatId);
                                    const isAvailable = seat.available;
                                    const seatStatus = getSeatStatus(seat) || (isAvailable ? 'AVAILABLE' : 'UNAVAILABLE');
                                    const isBooked = seatStatus === 'BOOKED';
                                    const displayLabel = seat.seatLabel || `Seat ${seat.seatNumber}`;
                                    return (
                                      <div key={seat.seatNumber} className="flex flex-col items-center gap-0.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => isAvailable && handleSeatSelection(seat.seatNumber)}
                                          disabled={!isAvailable}
                                          title={`${displayLabel} · ${seatStatus}`}
                                          className={`w-full h-10 text-xs rounded border transition-colors font-semibold ${
                                            isSelected
                                              ? 'bg-primary text-primary-foreground border-primary'
                                              : isBooked
                                                ? 'bg-rose-100 text-rose-800 border-rose-300 cursor-not-allowed'
                                                : isAvailable
                                                  ? 'bg-background hover:bg-accent border-border hover:border-primary cursor-pointer'
                                                  : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
                                          }`}
                                        >
                                          {displayLabel}
                                        </button>
                                        <span className="text-[9px] text-muted-foreground leading-none">
                                          #{seat.seatNumber}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border rounded bg-background" />
                                    <span>Available</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border rounded bg-primary" />
                                    <span>Selected</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border rounded bg-rose-100 border-rose-300" />
                                    <span>Booked</span>
                                  </div>
                                </div>
                              </div>
                            ) : availableSeatsData?.totalSeats ? (
                              <div className="grid grid-cols-10 gap-2">
                                {generateSeats(availableSeatsData.totalSeats).map((seatNumber) => {
                                  const seatId = seatNumber.toString();
                                  const isSelected = bookingForm.seatNumbers.includes(seatId);
                                  const isAvailable = availableSeatsData.availableSeats > 0;
                                  return (
                                    <button
                                      key={seatNumber}
                                      type="button"
                                      onClick={() => isAvailable && handleSeatSelection(seatNumber)}
                                      disabled={!isAvailable}
                                      className={`w-8 h-8 text-xs rounded border transition-colors ${
                                        isSelected
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : isAvailable
                                            ? 'bg-background hover:bg-accent border-border'
                                            : 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                                      }`}
                                    >
                                      {seatNumber}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {loadingSeats ? 'Loading seats…' : 'Seat information not available.'}
                              </p>
                            )}
                          </div>

                          {/* Passenger Details */}
                          {bookingForm.seatNumbers.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground">Passenger per seat</h4>
                              <div className="space-y-3">
                                {bookingForm.seatNumbers.map((seatNumber, index) => {
                                  const seatLabel =
                                    bookingForm.seatLabels[index] || getSeatLabelValue(seatNumber);
                                  return (
                                    <div
                                      key={`${seatNumber}-${index}`}
                                      className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 sm:grid-cols-3"
                                    >
                                      <div className="text-sm font-semibold text-foreground sm:col-span-3">
                                        {seatLabel}
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label htmlFor={`applicantCid-${index}`}>
                                          CID <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                          id={`applicantCid-${index}`}
                                          value={bookingForm.applicantCids[index] || ''}
                                          onChange={(e) =>
                                            handlePassengerFieldChange(index, 'cid', e.target.value)
                                          }
                                          placeholder="Enter CID"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label htmlFor={`applicantName-${index}`}>
                                          Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                          id={`applicantName-${index}`}
                                          value={bookingForm.applicantNames[index] || ''}
                                          onChange={(e) =>
                                            handlePassengerFieldChange(index, 'name', e.target.value)
                                          }
                                          placeholder="Enter passenger name"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label htmlFor={`applicantMobile-${index}`}>
                                          Mobile <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                          id={`applicantMobile-${index}`}
                                          type="tel"
                                          value={bookingForm.applicantMobiles[index] || ''}
                                          onChange={(e) =>
                                            handlePassengerFieldChange(index, 'mobile', e.target.value)
                                          }
                                          placeholder="Enter mobile number"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground">Booking contact</h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="applicantEmail">Email</Label>
                                <Input
                                  id="applicantEmail"
                                  type="email"
                                  value={bookingForm.applicantEmail}
                                  onChange={(e) => handleBookingChange('applicantEmail', e.target.value)}
                                  placeholder="Optional"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="status">Status</Label>
                                <Input
                                  id="status"
                                  value={bookingForm.status}
                                  onChange={(e) => handleBookingChange('status', e.target.value)}
                                  placeholder="Booking status"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Booking Summary */}
                          <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-3 space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                            <div className="space-y-1.5 text-sm">
                              {selectedSchedule.route && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Route</span>
                                    <span>
                                      {selectedSchedule.route.source} → {selectedSchedule.route.destination}
                                    </span>
                                  </div>
                                  {selectedSchedule.route.distance && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Distance</span>
                                      <span>{selectedSchedule.route.distance} km</span>
                                    </div>
                                  )}
                                </>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Departure</span>
                                <span>{formatDateTime(selectedSchedule.departureTime)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Arrival</span>
                                <span>{formatDateTime(selectedSchedule.arrivalTime)}</span>
                              </div>
                              {scheduleBus && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bus</span>
                                  <span>
                                    {scheduleBus.busName || 'N/A'} ({scheduleBus.busNumber || 'N/A'})
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Seats</span>
                                <span>
                                  {bookingForm.seatNumbers.length > 0
                                    ? bookingForm.seatNumbers
                                        .map((seatNum) => {
                                          const seat = availableSeatsData?.seats?.find(
                                            (s) => s.seatNumber?.toString() === seatNum.toString()
                                          );
                                          return seat?.seatLabel || seatNum;
                                        })
                                        .join(', ')
                                    : 'Not selected'}
                                </span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t border-border/50">
                                <span>Total</span>
                                <span>
                                  BTN{' '}
                                  {availableSeatsData?.seats
                                    ? bookingForm.seatNumbers.reduce((total, seatNum) => {
                                        const seat = availableSeatsData.seats.find(
                                          (s) => s.seatNumber?.toString() === seatNum.toString()
                                        );
                                        return total + (seat?.fare || selectedSchedule?.price || 0);
                                      }, 0)
                                    : selectedSchedule?.price
                                      ? selectedSchedule.price * bookingForm.seatNumbers.length
                                      : 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={resetBooking}
                              disabled={isLockingSchedule}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleBookSchedule}
                              disabled={isLockingSchedule || bookingForm.seatNumbers.length === 0}
                              className="flex-1 gap-2"
                            >
                              {isLockingSchedule ? (
                                <><RefreshCw className="h-4 w-4 animate-spin" />Booking…</>
                              ) : (
                                'Book Schedule'
                              )}
                            </Button>
                          </div>

                          {/* Lock Result */}
                          {lockBookingResult && (
                            <div ref={lockDetailsRef} className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-sm font-semibold text-emerald-800">Locked Seat Details</h4>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleConfirmLockedBooking()}
                                  disabled={isConfirmingBooking}
                                >
                                  {isConfirmingBooking ? (
                                    <><RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />Confirming…</>
                                  ) : (
                                    'Confirm All Locked Seats'
                                  )}
                                </Button>
                              </div>
                              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                <p><span className="font-medium">Booking Ref:</span> {lockBookingResult.bookingRef || 'N/A'}</p>
                                <p><span className="font-medium">Expires At:</span> {formatDateTime(lockBookingResult.expiresAt)}</p>
                                <p><span className="font-medium">Total Amount:</span> BTN {lockBookingResult.totalAmount ?? 0}</p>
                                <p><span className="font-medium">Locked Seats:</span> {lockBookingResult.seats?.length ?? 0}</p>
                              </div>
                              {Array.isArray(lockBookingResult.seats) && lockBookingResult.seats.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {lockBookingResult.seats.map((seat) => (
                                    <div
                                      key={seat?.id || `${seat?.seatNumber}-${seat?.seatLabel}`}
                                      className="rounded-md border border-emerald-200 bg-white p-3 text-sm"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-medium text-emerald-900">
                                          {seat?.seatLabel || `Seat ${seat?.seatNumber || 'N/A'}`}
                                          {seat?.seatNumber ? ` (#${seat.seatNumber})` : ''}
                                        </p>
                                        <Badge variant="outline">{getSeatStatus(seat) || 'LOCKED'}</Badge>
                                      </div>
                                      <div className="mt-1 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                        <p>CID: {seat?.applicantCid || 'N/A'}</p>
                                        <p>Mobile: {seat?.applicantMobile || 'N/A'}</p>
                                        <p>Email: {seat?.applicantEmail || 'N/A'}</p>
                                        <p>Lock Expiry: {formatDateTime(seat?.lockExpiry || lockBookingResult?.expiresAt)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default BusBookingPage;
