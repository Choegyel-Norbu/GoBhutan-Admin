import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import TaxiPage from './pages/TaxiPage';
import HotelPage from './pages/HotelPage';
import AddHotelPage from './pages/AddHotelPage';
import AddRoomsPage from './pages/AddRoomsPage';
import BookHotelPage from './pages/BookHotelPage';
import SearchHotelsPage from './pages/SearchHotelsPage';
import ViewBookingsPage from './pages/ViewBookingsPage';
import EditBookingsPage from './pages/EditBookingsPage';
import CancelBookingsPage from './pages/CancelBookingsPage';
import HotelSettingsPage from './pages/HotelSettingsPage';
import HotelReportsPage from './pages/HotelReportsPage';
import FlightPage from './pages/FlightPage';
import MoviePage from './pages/MoviePage';
import BusPage from './pages/BusPage';
import AddBusPage from './pages/AddBusPage';
import BusSettingsPage from './pages/BusSettingsPage';
import BusBookingPage from './pages/BusBookingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="taxi" element={<TaxiPage />} />
            <Route path="hotel" element={<HotelPage />} />
            <Route path="hotel/add" element={<AddHotelPage />} />
            <Route path="hotel/add-rooms" element={<AddRoomsPage />} />
            <Route path="hotel/book" element={<BookHotelPage />} />
            <Route path="hotel/search" element={<SearchHotelsPage />} />
            <Route path="hotel/bookings" element={<ViewBookingsPage />} />
            <Route path="hotel/edit" element={<EditBookingsPage />} />
            <Route path="hotel/cancel" element={<CancelBookingsPage />} />
            <Route path="hotel/settings" element={<HotelSettingsPage />} />
            <Route path="hotel/reports" element={<HotelReportsPage />} />
            <Route path="flight" element={<FlightPage />} />
            <Route path="movie-ticketing" element={<MoviePage />} />
            <Route path="bus-ticket-booking" element={<BusPage />} />
            <Route path="bus/add" element={<AddBusPage />} />
            <Route path="bus/settings" element={<BusSettingsPage />} />
            <Route path="bus/booking" element={<BusBookingPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
