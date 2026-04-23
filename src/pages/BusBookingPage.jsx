import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, Users, Bus } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { api, apiClient } from '@/lib/apiService';
import authAPI from '@/lib/authAPI';
import { buildBusLockBookingPayload } from '@/lib/busBooking';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

function BusBookingPage() {
  const [activeView, setActiveView] = useState('create'); // 'create' or 'action'
  
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
    seatNumbers: [], // Changed to array to support multiple seats
    seatLabels: [],
    scheduleId: null,
    applicantCid: '',
    applicantMobile: '',
    applicantEmail: '',
    status: 'PENDING'
  });

  const [isLockingSchedule, setIsLockingSchedule] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [hasFetchedSchedules, setHasFetchedSchedules] = useState(false);
  const [lockBookingResult, setLockBookingResult] = useState(null);
  const bookingFormRef = useRef(null);
  const scheduleCardRef = useRef(null);
  const lockDetailsRef = useRef(null);

  const extractArrayData = (response, keys = []) => {
    if (Array.isArray(response)) return response;
    if (!response) return [];
    for (const key of keys) {
      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }
    return [];
  };

  const getSeatStatus = (seat) => String(seat?.status || seat?.bookingStatus || '').toUpperCase();

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

            ${
              ticketData?.qrCodeBase64
                ? `<div style="display:flex;justify-content:center;margin-top:14px;">
                     <img src="data:image/png;base64,${ticketData.qrCodeBase64}" alt="Ticket QR Code" style="width:150px;height:150px;border:1px solid #e5e7eb;border-radius:8px;padding:6px;background:#fff;" />
                   </div>
                   <div style="text-align:center;font-size:11px;color:#6b7280;margin-top:6px;">Show this QR at boarding</div>`
                : ''
            }
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
    const contentWidth = pageWidth - (margin * 2);
    let y = 50;

    // Header
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

  const seatIdentityCandidates = (seat) => {
    const candidates = [
      seat?.seatNumber,
      seat?.number,
      seat?.startNo,
      seat?.seatNo,
      seat?.id,
      seat?.seatLabel,
      seat?.label,
    ];
    return candidates
      .map((value) => (value == null ? '' : String(value).trim().toUpperCase()))
      .filter(Boolean);
  };

  const buildSeatStatusLookup = (scheduleSeatsResponse) => {
    const scheduleSeats = extractScheduleSeatList(scheduleSeatsResponse);
    const lookup = new Map();
    scheduleSeats.forEach((seat) => {
      const status = getSeatStatus(seat);
      if (!status) return;
      seatIdentityCandidates(seat).forEach((candidate) => lookup.set(candidate, status));
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
      const resolvedStatusKey = seatIdentityCandidates({ ...seat, seatNumber, seatLabel })
        .find((candidate) => seatStatusLookup.has(candidate));
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
        fare: seat?.fare ?? scheduleInfo?.price ?? 0
        };
      });
      
    const seats = normalizedSeats.length > 0 ? normalizedSeats : [];
    const totalSeats = seats.length;
    const availableSeats = seats.filter((seat) => seat.available !== false).length;

    return {
      seats,
      totalSeats,
      availableSeats,
      busNumber: busInfo?.busNumber,
      busId: getBusId(busInfo)
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
      availableSeats: seats.filter((seat) => seat.available !== false).length,
      busNumber: busInfo?.busNumber,
      busId: getBusId(busInfo),
    };
  };

  const loadBuses = async () => {
    setLoadingBuses(true);
    try {
      const busesResponse = await api.bus.getBuses();
      const busesData = extractArrayData(busesResponse, ['data', 'buses'])
        .filter((bus) => getBusId(bus));
      setBuses(busesData);
      if (busesData.length === 0) {
        console.warn('No buses available for booking.');
      }
    } catch (error) {
      console.error('Error loading buses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to load buses. Please refresh and try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoadingBuses(false);
    }
  };

  const fetchRoutesForBus = async (busId) => {
    if (!busId) return [];

    setLoadingRoutes(true);
    try {
      const routesResponse = await api.bus.getRoutes(busId);
      const routesData = extractArrayData(routesResponse, ['data', 'routes'])
        .filter((route) => getRouteId(route));
      setRoutes(routesData);
      return routesData;
      } catch (error) {
      console.error(`Error loading routes for bus ${busId}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Routes Unavailable',
        text: 'Failed to load routes for the selected bus.',
        confirmButtonText: 'OK'
      });
      setRoutes([]);
      return [];
    } finally {
      setLoadingRoutes(false);
    }
  };

  const enrichSchedules = (schedulesData, resolvedRoutes, bus) => {
    return schedulesData.map((schedule) => {
      const scheduleRouteId = schedule.routeId || schedule.route?.id;
      const matchedRoute = resolvedRoutes.find((routeItem) => {
        const routeId = getRouteId(routeItem);
        return routeId && scheduleRouteId && routeId === scheduleRouteId;
      });

        return {
          ...schedule,
        route: matchedRoute || schedule.route || null,
        bus: schedule.bus || bus || null,
      };
    }).filter(schedule => schedule && schedule.id);
  };

  const fetchSchedulesForRoute = async (route, busContext = null) => {
    const routeId = getRouteId(route);
    if (!routeId) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Route',
        text: 'Selected route is missing an identifier.',
        confirmButtonText: 'OK'
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Schedules Unavailable',
        text: 'Failed to load schedules for the selected route.',
        confirmButtonText: 'OK'
      });
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
      const busIdentifier = getBusId(busContext) || schedule?.busId || getBusId(schedule?.bus) || getBusId(selectedBus);
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
        setScheduleBus((prev) => prev || {
          busNumber: seatData.busNumber,
          totalSeats: seatData.totalSeats,
          availableSeats: seatData.availableSeats
        });
            }
          } catch (error) {
      console.error('Error fetching seat data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load seat information. Please try again.',
        confirmButtonText: 'OK'
      });
      setAvailableSeatsData(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSelectBus = async (bus) => {
    if (!bus) return;
    const busId = getBusId(bus);
    if (!busId) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Bus',
        text: 'Selected bus is missing an identifier.',
        confirmButtonText: 'OK'
      });
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
      seatLabels: []
    }));

    await fetchRoutesForBus(busId);
  };

  const handleSelectRoute = async (route) => {
    if (!selectedBus) {
      Swal.fire({
        icon: 'info',
        title: 'Select a Bus',
        text: 'Choose a bus before selecting routes.',
        confirmButtonText: 'OK'
      });
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
      seatLabels: []
    }));

    await fetchSchedulesForRoute(route, selectedBus);
  };

  useEffect(() => {
    if (activeView === 'create' && buses.length === 0) {
      loadBuses();
    }
  }, [activeView, buses.length]);

  // Scroll to schedule section when route is selected
  useEffect(() => {
    if (selectedRoute && scheduleCardRef.current) {
      setTimeout(() => {
        scheduleCardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 150);
    }
  }, [selectedRoute]);

  // Scroll to booking form when it appears
  useEffect(() => {
    if (selectedSchedule && bookingFormRef.current) {
      setTimeout(() => {
        bookingFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [selectedSchedule]);

  const loadAllSchedules = async () => {
    if (!selectedBus) {
      Swal.fire({
        icon: 'info',
        title: 'Select a Bus',
        text: 'Please pick a bus to view its routes and schedules.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!selectedRoute) {
      Swal.fire({
        icon: 'info',
        title: 'Select a Route',
        text: 'Choose a route to load its schedules.',
        confirmButtonText: 'OK'
      });
      return;
    }

    await fetchSchedulesForRoute(selectedRoute, selectedBus);
  };

  const handleBookingChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setLockBookingResult(null);
    setBookingForm(prev => ({
      ...prev,
      scheduleId: schedule.id,
      seatNumbers: [],
      seatLabels: []
    }));
    const scheduleContextBus = schedule.bus || selectedBus || null;
    if (scheduleContextBus) {
      setScheduleBus(scheduleContextBus);
    }
    setAvailableSeatsData(null);
    await loadSeatDataForSchedule(schedule, scheduleContextBus || selectedBus);
  };

  const getSeatLabelValue = (seatNumber) => {
    if (!seatNumber) return '';
    const targetSeat = availableSeatsData?.seats?.find((seat) => {
      const seatId = seat?.seatNumber ?? seat?.id;
      return seatId?.toString() === seatNumber.toString();
    });
    return targetSeat?.seatLabel || targetSeat?.label || `Seat ${seatNumber}`;
  };

  const handleSeatSelection = (seatNumber) => {
    const normalizedSeat = seatNumber?.toString();
    if (!normalizedSeat) return;

    setBookingForm(prev => {
      const currentSeats = prev.seatNumbers || [];
      const seatExists = currentSeats.includes(normalizedSeat);
      const updatedSeats = seatExists
        ? currentSeats.filter(s => s !== normalizedSeat)
        : [...currentSeats, normalizedSeat];
      
      return {
        ...prev,
        seatNumbers: updatedSeats,
        seatLabels: updatedSeats.map((seat) => getSeatLabelValue(seat))
      };
    });
  };

  const validateBookingPayload = () => {
    if (!bookingForm.scheduleId) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a schedule before booking.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!bookingForm.seatNumbers || bookingForm.seatNumbers.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select at least one seat.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!bookingForm.applicantCid?.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter applicant CID.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!bookingForm.applicantMobile?.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter applicant mobile number.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!bookingForm.applicantEmail?.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter applicant email.',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    return true;
  };

  const handleBookSchedule = async () => {
    if (!validateBookingPayload()) {
      return;
    }

    const seatLabelsResolved =
      bookingForm.seatLabels?.length === bookingForm.seatNumbers?.length
        ? bookingForm.seatLabels
        : (bookingForm.seatNumbers || []).map((seat) => getSeatLabelValue(seat));

    const payload = buildBusLockBookingPayload({
      scheduleId: bookingForm.scheduleId,
      seatNumbers: bookingForm.seatNumbers,
      seatLabels: seatLabelsResolved,
      applicantCid: bookingForm.applicantCid,
      applicantMobile: bookingForm.applicantMobile,
      applicantEmail: bookingForm.applicantEmail,
      status: bookingForm.status?.trim() || 'PENDING',
    });

    try {
      setIsLockingSchedule(true);
      Swal.fire({
        title: 'Locking Seats...',
        text: 'Please wait while we reserve your seats.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

      const lockResponse = await api.bus.lockBooking(payload);
      const lockResult = extractLockBookingResult(lockResponse);
      setLockBookingResult(lockResult);
      Swal.close();
      
      await Swal.fire({
        icon: 'success',
        title: 'Seats Locked!',
        text: 'The selected seats have been reserved successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
      
      setBookingForm((prev) => ({
        ...prev,
        seatNumbers: [],
        seatLabels: [],
        applicantCid: '',
        applicantMobile: '',
        applicantEmail: '',
        status: 'PENDING'
      }));

      if (selectedSchedule) {
        await loadSeatDataForSchedule(selectedSchedule, scheduleBus || selectedBus);
      }

      setTimeout(() => {
        lockDetailsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 120);
    } catch (error) {
      console.error('Error locking booking:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error?.response?.data?.message || 'Failed to lock seats. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLockingSchedule(false);
    }
  };

  const handleConfirmLockedBooking = async (seat) => {
    const bookingRef = String(
      lockBookingResult?.bookingRef ||
      seat?.bookingRef ||
      ''
    ).trim();

    if (!bookingRef) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot confirm',
        text: 'Booking reference is missing for this lock.',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsConfirmingBooking(true);
      const token = authAPI.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

      await api.bus.confirmBooking({ bookingRef });
      const bookingId = Number(
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

      const ticketHtml = ticketData ? buildTicketMarkup(ticketData, bookingRef) : '';
      const result = await Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed',
        html: ticketData ? ticketHtml : `Booking ${bookingRef} has been confirmed. Ticket is not available yet.`,
        confirmButtonText: ticketData ? 'Close' : 'OK',
        showDenyButton: !!ticketData,
        denyButtonText: 'Download PDF',
        confirmButtonColor: '#10b981',
        denyButtonColor: '#1f2937',
        width: ticketData ? 560 : undefined,
      });
      if (result.isDenied && ticketData) {
        downloadTicketAsPdf(ticketData, bookingRef);
      }

      setLockBookingResult(null);
      if (selectedSchedule) {
        await loadSeatDataForSchedule(selectedSchedule, scheduleBus || selectedBus);
      }
    } catch (error) {
      console.error('Error confirming locked booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Confirm Failed',
        text: error?.response?.data?.message || 'Failed to confirm booking. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  const generateSeats = (totalSeats) => {
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push(i);
    }
    return seats;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageWrapper 
      title="Bus Booking" 
      description="Search and book bus tickets for your journey."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Toggle Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={activeView === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveView('create')}
                className="flex-1"
              >
                Create Booking
              </Button>
              <Button
                variant={activeView === 'action' ? 'default' : 'outline'}
                onClick={() => setActiveView('action')}
                className="flex-1"
              >
                Booking Action
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Create Booking View */}
        {activeView === 'create' && (
          <>
            {/* Bus Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Available Buses
                </CardTitle>
                <CardDescription>
                  Select a bus to view its routes and schedules before creating a booking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBuses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading buses...</p>
                  </div>
                ) : buses.length === 0 ? (
                  <div className="text-center py-8">
                    <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No buses configured</h3>
                    <p className="text-muted-foreground">Please add buses in Bus Management to proceed.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {buses.map((bus, index) => {
                      const busId = getBusId(bus);
                      const selectedBusId = selectedBus ? getBusId(selectedBus) : null;
                      const isActive = selectedBusId && busId
                        ? selectedBusId === busId
                        : selectedBus === bus;
                      const buttonKey = busId || bus.busNumber || `${bus.busName || 'bus'}-${index}`;
                      return (
                        <button
                          key={buttonKey}
                          type="button"
                          onClick={() => handleSelectBus(bus)}
                          className={`w-full text-left border rounded-lg p-4 transition ${
                            isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/40' : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                            <p className="font-bold">{bus.busName || 'Unnamed Bus'}</p>
                              <p className="font-semibold text-sm">{bus.busNumber || 'Unnamed Bus'}</p>
                              <p className="text-sm text-muted-foreground">
                                 · {bus.busType || 'Standard'}
                              </p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1 justify-end">
                                <Users className="h-4 w-4" />
                                <span>
                                  {(bus.totalSeats || bus.capacity || bus.seatCapacity || 0)} seats
                                </span>
                              </div>
                              {bus.status && (
                                <Badge variant={bus.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                  {bus.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Routes for Selected Bus */}
            {selectedBus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Routes for {selectedBus.busName || selectedBus.busNumber || 'Selected Bus'}
                  </CardTitle>
                  <CardDescription>
                    Click a route to load the schedules available for that path.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRoutes ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading routes for the selected bus...</p>
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No routes found for this bus. Create a route before scheduling trips.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {routes.map((route, index) => {
                        const routeKey = getRouteId(route) || `${route.source || 'route'}-${route.destination || 'dest'}-${index}`;
                        const routeId = getRouteId(route);
                        const selectedRouteId = selectedRoute ? getRouteId(selectedRoute) : null;
                        const isActive = selectedRouteId && routeId
                          ? selectedRouteId === routeId
                          : selectedRoute === route;
                        return (
                          <button
                            key={routeKey}
                            type="button"
                            onClick={() => handleSelectRoute(route)}
                            className={`w-full text-left border rounded-lg p-4 flex justify-between items-center transition ${
                              isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/40' : 'hover:border-primary/50'
                            }`}
                          >
                            <div>
                              <p className="font-semibold">
                                {route.source || 'N/A'} → {route.destination || 'N/A'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {route.distance ? `${route.distance} km` : 'Distance N/A'} ·{' '}
                                {route.estimatedDuration ? `${route.estimatedDuration} min` : 'Duration N/A'}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              {route.departureTime && (
                                <p>Departs {formatTime(route.departureTime)}</p>
                              )}
                              <p className="mt-1 text-xs">
                                {isActive ? 'Schedules loaded' : 'Click to load schedules'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Schedules for Selected Route */}
            {selectedBus && selectedRoute && (
              <Card ref={scheduleCardRef}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Schedules for {selectedRoute.source || 'N/A'} → {selectedRoute.destination || 'N/A'}
                      </CardTitle>
                      <CardDescription>
                        Select a schedule for {selectedRoute.source || 'N/A'} → {selectedRoute.destination || 'N/A'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={loadAllSchedules}
                      disabled={loadingRoutes || loadingSchedules}
                    >
                      {loadingRoutes
                        ? 'Loading Routes...'
                        : loadingSchedules
                          ? 'Fetching Schedules...'
                          : 'Refresh Schedules'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingSchedules ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Fetching schedules for {selectedRoute.source || 'N/A'} → {selectedRoute.destination || 'N/A'}...
                      </p>
                    </div>
                  ) : !hasFetchedSchedules ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Schedules not loaded</h3>
                      <p className="text-muted-foreground mb-4">
                        Click &ldquo;Refresh Schedules&rdquo; to load departures for this route.
                      </p>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
                      <p className="text-muted-foreground mb-4">No available schedules at the moment.</p>
                      <Button onClick={loadAllSchedules}>
                        Refresh Schedules
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {schedules.map((schedule) => (
                        <Card 
                          key={schedule.id} 
                          className={`border cursor-pointer transition-all hover:shadow-md ${
                            selectedSchedule?.id === schedule.id ? 'border-primary ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleSelectSchedule(schedule)}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDateTime(schedule.departureTime)} - {formatTime(schedule.arrivalTime)}
                                  </div>
                                  {schedule.route && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {schedule.route.estimatedDuration || 'N/A'} min
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  {schedule.availableSeats !== undefined ? `${schedule.availableSeats} seats available` : 'Seats available'}
                                </div>
                              </div>
                              <div className="text-right space-y-2 ml-4">
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectSchedule(schedule);
                                  }}
                                  disabled={schedule.availableSeats === 0}
                                >
                                  {schedule.availableSeats === 0 ? 'Sold Out' : 'Select Schedule'}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

        {/* Booking Form */}
        {selectedSchedule && (
          <Card ref={bookingFormRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Book for this schedule
              </CardTitle>
              <CardDescription>
                Enter passenger details and select seats for your journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Seat Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Select Seats</h4>
                  <div className="text-sm text-muted-foreground mb-4">
                    Select seat(s). Selected: {bookingForm.seatNumbers.length > 0 
                      ? bookingForm.seatNumbers.map(s => `Seat ${s}`).join(', ')
                      : 'None'}
                    {availableSeatsData && (
                      <span className="ml-2">
                        ({availableSeatsData.availableSeats} available)
                      </span>
                    )}
                  </div>
                  {loadingSeats ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading available seats...</p>
                    </div>
                  ) : availableSeatsData && availableSeatsData.seats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {availableSeatsData.seats.map((seat) => {
                          const seatId = seat.seatNumber?.toString();
                          const isSelected = bookingForm.seatNumbers.includes(seatId);
                          const isAvailable = seat.available;
                          const seatStatus = getSeatStatus(seat) || (isAvailable ? 'AVAILABLE' : 'UNAVAILABLE');
                          const isBooked = seatStatus === 'BOOKED';
                          const displayLabel = seat.seatLabel || `Seat ${seat.seatNumber}`;
                          const seatTypeLabel = seat.seatType?.replace(/_/g, ' ') || 'STANDARD';
                          
                          return (
                            <div
                              key={seat.seatNumber}
                              className="flex flex-col items-center gap-1 text-center"
                            >
                              <button
                              type="button"
                              onClick={() => isAvailable && handleSeatSelection(seat.seatNumber)}
                              disabled={!isAvailable}
                              className={`
                                  w-12 h-12 text-xs rounded border transition-colors relative font-semibold
                                ${isSelected 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : isBooked
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 cursor-not-allowed opacity-90'
                                  : isAvailable 
                                    ? 'bg-background hover:bg-accent border-border hover:border-primary' 
                                    : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
                                }
                              `}
                                title={`${displayLabel} • ${seatStatus} • ${seatTypeLabel}`}
                            >
                                {displayLabel}
                            </button>
                              <div className="text-[10px] leading-tight text-muted-foreground">
                                <div>#{seat.seatNumber}</div>
                                <div>{seatStatus}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {availableSeatsData.seats.length > 0 && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 border rounded bg-background"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 border rounded bg-primary"></div>
                            <span>Selected</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 border rounded bg-rose-100 border-rose-300"></div>
                            <span>Booked</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 border rounded bg-background relative">
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                            </div>
                            <span>Front Row</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : availableSeatsData && availableSeatsData.totalSeats ? (
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
                          className={`
                            w-8 h-8 text-xs rounded border transition-colors
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : isAvailable 
                                ? 'bg-background hover:bg-accent border-border' 
                                : 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                            }
                          `}
                        >
                          {seatNumber}
                        </button>
                      );
                    })}
                  </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {loadingSeats ? 'Loading seats...' : 'Seat information not available.'}
                    </div>
                  )}
                </div>

                {/* Applicant Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Applicant Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="applicantCid">Applicant CID *</Label>
                      <Input
                        id="applicantCid"
                        value={bookingForm.applicantCid}
                        onChange={(e) => handleBookingChange('applicantCid', e.target.value)}
                        placeholder="Enter applicant CID"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicantMobile">Applicant Mobile *</Label>
                      <Input
                        id="applicantMobile"
                        value={bookingForm.applicantMobile}
                        onChange={(e) => handleBookingChange('applicantMobile', e.target.value)}
                        placeholder="Enter applicant mobile number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicantEmail">Applicant Email *</Label>
                      <Input
                        id="applicantEmail"
                        type="email"
                        value={bookingForm.applicantEmail}
                        onChange={(e) => handleBookingChange('applicantEmail', e.target.value)}
                        placeholder="Enter applicant email address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Booking Status</Label>
                      <Input
                        id="status"
                        value={bookingForm.status}
                        onChange={(e) => handleBookingChange('status', e.target.value)}
                        placeholder="Enter booking status"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  {selectedSchedule.route && (
                    <>
                  <div className="flex justify-between">
                        <span>Route:</span>
                        <span>{selectedSchedule.route.source} → {selectedSchedule.route.destination}</span>
                  </div>
                  <div className="flex justify-between">
                        <span>Distance:</span>
                        <span>{selectedSchedule.route.distance} km</span>
                  </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Departure:</span>
                    <span>{formatDateTime(selectedSchedule.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arrival:</span>
                    <span>{formatDateTime(selectedSchedule.arrivalTime)}</span>
                  </div>
                  {scheduleBus && (
                    <div className="flex justify-between">
                      <span>Bus:</span>
                      <span>{scheduleBus.busName || 'N/A'} ({scheduleBus.busNumber || 'N/A'})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span>
                      {bookingForm.seatNumbers.length > 0 
                        ? bookingForm.seatNumbers
                            .map((seatNum) => {
                              const seat = availableSeatsData?.seats?.find((s) => s.seatNumber?.toString() === seatNum.toString());
                              return seat?.seatLabel || seatNum.toString();
                            })
                            .join(', ')
                        : 'Not selected'}
                    </span>
                  </div>
                  {bookingForm.seatNumbers.length > 0 && availableSeatsData && availableSeatsData.seats && (
                    <div className="mt-2 pt-2 border-t">
                      {bookingForm.seatNumbers.map((seatNum) => {
                        const seat = availableSeatsData.seats.find(s => s.seatNumber?.toString() === seatNum.toString());
                        return seat ? (
                          <div key={seatNum} className="flex justify-between text-xs">
                            <span>{seat.seatLabel || `Seat ${seat.seatNumber}`} ({seat.seatType || 'STANDARD'}):</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>
                      BTN {
                        availableSeatsData && availableSeatsData.seats
                          ? bookingForm.seatNumbers.reduce((total, seatNum) => {
                              const seat = availableSeatsData.seats.find(s => s.seatNumber?.toString() === seatNum.toString());
                              return total + (seat?.fare || selectedSchedule?.price || 0);
                            }, 0)
                          : selectedSchedule?.price 
                            ? (selectedSchedule.price * bookingForm.seatNumbers.length)
                            : '0'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Button 
                  variant="secondary"
                  onClick={handleBookSchedule}
                  disabled={isLockingSchedule || bookingForm.seatNumbers.length === 0}
                  className="flex items-center gap-2"
                >
                  {isLockingSchedule ? 'Booking...' : 'Book Schedule'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLockBookingResult(null);
                    setSelectedSchedule(null);
                    setScheduleBus(null);
                    setBookingForm({
                      seatNumbers: [],
                      seatLabels: [],
                      scheduleId: null,
                      applicantCid: '',
                      applicantMobile: '',
                      applicantEmail: '',
                      status: 'PENDING'
                    });
                  }}
                  disabled={isLockingSchedule}
                >
                  Cancel
                </Button>
              </div>
              {lockBookingResult && (
                <div ref={lockDetailsRef} className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <h4 className="text-base font-semibold text-emerald-800">Locked Seat Details</h4>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <p><span className="font-medium">Booking Ref:</span> {lockBookingResult.bookingRef || 'N/A'}</p>
                    <p><span className="font-medium">Expires At:</span> {formatDateTime(lockBookingResult.expiresAt)}</p>
                    <p><span className="font-medium">Total Amount:</span> BTN {lockBookingResult.totalAmount ?? 0}</p>
                    <p><span className="font-medium">Locked Seats:</span> {lockBookingResult.seats?.length ?? 0}</p>
                  </div>

                  {Array.isArray(lockBookingResult.seats) && lockBookingResult.seats.length > 0 && (
                    <div className="mt-4 space-y-2">
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
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{getSeatStatus(seat) || 'LOCKED'}</Badge>
                              {getSeatStatus(seat) === 'LOCKED' && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleConfirmLockedBooking(seat)}
                                  disabled={isConfirmingBooking}
                                >
                                  {isConfirmingBooking ? 'Confirming…' : 'Confirm'}
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="mt-1 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
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
            </CardContent>
          </Card>
        )}
          </>
        )}

        {/* Booking Action View */}
        {activeView === 'action' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Management
              </CardTitle>
              <CardDescription>
                Manage existing bookings - view, edit, cancel, or process refunds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Booking Action Panel</h3>
                  <p>This section will contain functionality to manage existing bookings.</p>
                  <p className="text-sm mt-2">Features coming soon:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• View all bookings</li>
                    <li>• Edit booking details</li>
                    <li>• Cancel bookings</li>
                    <li>• Process refunds</li>
                    <li>• Generate booking reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

export default BusBookingPage;

