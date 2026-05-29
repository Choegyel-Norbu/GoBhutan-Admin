import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import TaxiPage from './pages/TaxiPage';
import AddHotelPage from './pages/AddHotelPage';
import AddRoomTypePage from './pages/AddRoomTypePage';
import RoomManager from './pages/RoomManager';
import BookHotelPage from './pages/BookHotelPage';
import HotelSettingsPage from './pages/HotelSettingsPage';
import AddStaffPage from './pages/AddStaffPage';
import AddBusPage from './pages/AddBusPage';
import BusManagementPage from './pages/BusManagementPage';
import BusDetailsPage from './pages/BusDetailsPage';
import BusBookingPage from './pages/BusBookingPage';
import TheaterPage from './pages/TheaterPage';
import AddMoviePage from './pages/AddMoviePage';
import TheaterBookingManagementPage from './pages/TheaterBookingManagementPage';
import GasConfigPage from './pages/GasConfigPage';
import GasDeliveryPage from './pages/GasDeliveryPage';
import WalletPage from './pages/WalletPage';
import UserSettingsPage from './pages/UserSettingsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import SetPasswordPage from './pages/SetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
      <Router basename="/go-bhutan-admin" future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="taxi" element={<TaxiPage />} />
            <Route path="hotel/add" element={<AddHotelPage />} />
            <Route path="hotel/add-rooms" element={<RoomManager />} />
            <Route path="hotel/room-types" element={<AddRoomTypePage />} />
            <Route path="hotel/book" element={<BookHotelPage />} />
            <Route path="hotel/settings" element={<HotelSettingsPage />} />
            <Route path="staff" element={<AddStaffPage />} />
            <Route path="bus/add" element={<AddBusPage />} />
            <Route path="bus/manage" element={<BusManagementPage />} />
            <Route path="bus/details/:busId" element={<BusDetailsPage />} />
            <Route path="bus/booking" element={<BusBookingPage />} />
            <Route path="theater" element={<TheaterPage />} />
            <Route path="theater/movie" element={<AddMoviePage />} />
            <Route path="theater/bookings" element={<TheaterBookingManagementPage />} />
            <Route path="gas/config" element={<GasConfigPage />} />
            <Route path="gas/deliveries" element={<GasDeliveryPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
          </Route>
        </Routes>
      </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
