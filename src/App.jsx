// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Protected Routes
import PrivateRoute from './components/user/Auth/PrivateRoute';
import HostRoute    from './components/user/Auth/HostRoute';

// Context Providers
import { AuthProvider }   from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { SearchProvider }  from './context/SearchContext';

// Layout & Loading
import Layout         from './components/common/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';

// Global Styles
import './assets/styles/global.css';
import './assets/styles/variables.css';
import './assets/styles/utilities.css';
import './assets/styles/animations.css';
import './App.css';

// Lazy Loaded Pages
const Home            = lazy(() => import('./pages/Home/Home'));
const Search          = lazy(() => import('./pages/Search/Search'));
const Property        = lazy(() => import('./pages/Property/Property'));
const BookingPage     = lazy(() => import('./components/common/booking/Booking'));
const Login           = lazy(() => import('./components/user/Auth/LoginForm'));
const Register        = lazy(() => import('./components/user/Auth/RegisterForm'));
const Dashboard       = lazy(() => import('./pages/User/Dashboard'));
const Profile         = lazy(() => import('./components/user/Dashboard/Profile'));
const MyBookings      = lazy(() => import('./components/user/Dashboard/MyBookings'));
const Favorites       = lazy(() => import('./components/user/Dashboard/Favorites'));
const Messages        = lazy(() => import('./components/user/Messages/MessageCenter'));
const HostDashboard   = lazy(() => import('./pages/Host/Dashboard'));
const PropertyManager = lazy(() => import('./components/host/HostDashboard/PropertyManager'));
const AddProperty     = lazy(() => import('./components/host/PropertyForm/PropertyForm'));
const EditProperty    = lazy(() => import('./components/host/PropertyForm/PropertyForm'));
const BookingManager  = lazy(() => import('./components/host/HostDashboard/BookingManager'));
const Analytics       = lazy(() => import('./components/host/HostDashboard/Analytics'));
const Unauthorized    = lazy(() => import('./components/common/ErrorState/ErrorState'));
const NotFound        = lazy(() => import('./components/common/ErrorState/ErrorState'));

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <SearchProvider>
          <Router>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/property/:id" element={<Property />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* User Protected */}
                  
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile"   element={<Profile />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/favorites"   element={<Favorites />} />
                    <Route path="/messages"    element={<Messages />} />
                    <Route path="/booking"     element={<BookingPage />} />
                    <Route path="/booking/:propertyId" element={<BookingPage />} />
                  

                  {/* Host Protected */}
                  <Route element={<HostRoute />}>
                    <Route path="/host"                   element={<HostDashboard />} />
                    <Route path="/host/dashboard"         element={<HostDashboard />} />
                    <Route path="/host/properties"        element={<PropertyManager />} />
                    <Route path="/host/properties/add"    element={<AddProperty />} />
                    <Route path="/host/properties/edit/:id" element={<EditProperty />} />
                    <Route path="/host/bookings"          element={<BookingManager />} />
                    <Route path="/host/analytics"         element={<Analytics />} />
                  </Route>

                  {/* Error Pages */}
                  <Route
                    path="/unauthorized"
                    element={
                      <Unauthorized
                        title="Acceso no autorizado"
                        message="No tienes permiso para acceder a esta página"
                      />
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <NotFound
                        title="Página no encontrada"
                        message="La página que buscas no existe o ha sido movida"
                      />
                    }
                  />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </SearchProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;