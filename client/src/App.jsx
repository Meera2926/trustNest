import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { setCredentials } from './slices/authSlice';

// Layouts & Pages
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import MyBookings from './pages/Customer/MyBookings';
import LandingPage from './pages/LandingPage';
import ReviewPage from './pages/ReviewPage';
import WorkerDashboard from './pages/WorkerDashboard';
import NotificationsPage from './pages/NotificationsPage';
import SOSPage from './pages/SOSPage';

// Create socket instance outside component to avoid recreation
export let socket;

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // Initialize Socket.io if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socket = io('http://localhost:5000', {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('Connected to TrustNest real-time server');
      });

      socket.on('notification', (notification) => {
        console.log('New notification:', notification);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  return (
    <div className="app-container">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1A1A2E',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }}/>
      
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/auth"     element={<AuthPage />} />
        <Route path="/login"    element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Standalone Pages */}
        <Route path="/review"        element={<ReviewPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/sos"           element={<SOSPage />} />

        {/* Worker Routes */}
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />

        {/* Customer Routes (mobile-style) */}
        <Route path="/customer/search"    element={<CustomerDashboard />} />
        <Route path="/customer/bookings"  element={<MyBookings />} />
        <Route path="/customer/favorites" element={<CustomerDashboard />} />
        <Route path="/customer/messages"  element={<CustomerDashboard />} />
        <Route path="/customer/pro"       element={<CustomerDashboard />} />
        <Route path="/customer"           element={<Navigate to="/customer/search" replace />} />
      </Routes>
    </div>
  );
};

export default App;
