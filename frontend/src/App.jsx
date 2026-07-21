import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import các component của Khách
import Login from './pages/Login';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import Navbar from './components/Navbar'; 
// Import các component của Admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BusManager from './pages/admin/BusManager';
import StationManager from './pages/admin/StationManager'; 
import RouteManager from './pages/admin/RouteManager';     
import TripManager from './pages/admin/TripManager';
import SeatManager from './pages/admin/SeatManager';       
import TicketManager from './pages/admin/TicketManager';   
import UserManager from './pages/admin/UserManager';
import ReviewManager from './pages/admin/ReviewManager';
import NotificationManager from './pages/admin/NotificationManager';
import MyNotifications from './pages/MyNotifications';

function AppContent() {
  return (
    <Routes>
      {/* KHU VỰC KHÁCH HÀNG (Có Navbar) */}
      <Route path="/" element={<><Navbar /><div className="main-content"><Home /></div></>} />
      <Route path="/login" element={<><Navbar /><div className="main-content"><Login /></div></>} />
      <Route path="/trips/:id" element={<><Navbar /><div className="main-content"><Booking /></div></>} />
      <Route path="/my-tickets" element={<><Navbar /><div className="main-content"><MyTickets /></div></>} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-notifications" element={<><Navbar /><div className="main-content"><MyNotifications /></div></>} />
      {/* KHU VỰC ADMIN (Giao diện riêng biệt, không có Navbar của khách) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="buses" element={<BusManager />} />
        <Route path="stations" element={<StationManager />} />
        <Route path="routes" element={<RouteManager />} />
        <Route path="trips" element={<TripManager />} />
        <Route path="seats" element={<SeatManager />} />
        <Route path="tickets" element={<TicketManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="review" element={<ReviewManager />} />
        <Route path="notification" element={<NotificationManager />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;