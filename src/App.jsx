import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import TaxiPage from './pages/TaxiPage';
import HotelPage from './pages/HotelPage';
import AddHotelPage from './pages/AddHotelPage';
import FlightPage from './pages/FlightPage';
import MoviePage from './pages/MoviePage';
import BusPage from './pages/BusPage';
import SignInPage from './pages/SignInPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="taxi" element={<TaxiPage />} />
          <Route path="hotel" element={<HotelPage />} />
          <Route path="hotel/add" element={<AddHotelPage />} />
          <Route path="flight" element={<FlightPage />} />
          <Route path="movie-ticketing" element={<MoviePage />} />
          <Route path="bus-ticket-booking" element={<BusPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
