import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Protected Routes
import PrivateRoute from './components/user/Auth/PrivateRoute';
import HostRoute from './components/user/Auth/HostRoute';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { SearchProvider } from './context/SearchContext';

// Layout & Loading
import Layout from './components/common/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';

// Global Styles
import './assets/styles/global.css';
import './assets/styles/variables.css';
import './assets/styles/utilities.css';
import './assets/styles/animations.css';
import './assets/styles/responsive-fixes.css';
import './App.css';

// Helper function for lazy loading with error handling
const lazyLoad = (importFunc, exportName = null) => {
  return lazy(() => 
    importFunc().then(module => {
      // Handle both default and named exports
      const component = exportName ? module[exportName] : module.default;
      if (!component) {
        throw new Error(`Component ${exportName || 'default'} not found in module`);
      }
      return { default: component };
    }).catch(error => {
      console.error('Lazy loading error:', error);
      return { 
        default: () => (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Error de carga</h2>
            <p>No se pudo cargar este componente.</p>
          </div>
        )
      };
    })
  );
};

// Lazy Loaded Pages
const Home = lazyLoad(() => import('./pages/Home/Home'));
const Search = lazyLoad(() => import('./pages/Search/Search'));
const Property = lazyLoad(() => import('./pages/Property/Property'));
const BookingPage = lazyLoad(() => import('./components/common/booking/Booking'));
const Login = lazyLoad(() => import('./components/user/Auth/LoginForm'));
const Register = lazyLoad(() => import('./components/user/Auth/RegisterForm'));
const Dashboard = lazyLoad(() => import('./pages/User/Dashboard'));
const Profile = lazyLoad(() => import('./components/user/Dashboard/Profile'));
const MyBookings = lazyLoad(() => import('./components/user/Dashboard/MyBookings'));
const Favorites = lazyLoad(() => import('./components/user/Dashboard/Favorites'));
const Messages = lazyLoad(() => import('./components/user/Messages/MessageCenter'));
const HostDashboard = lazyLoad(() => import('./pages/Host/Dashboard'));
const PropertyManager = lazyLoad(() => import('./components/host/HostDashboard/PropertyManager'));
const AddProperty = lazyLoad(() => import('./components/host/PropertyForm/PropertyForm'));
const EditProperty = lazyLoad(() => import('./components/host/PropertyForm/PropertyForm'));
const BookingManager = lazyLoad(() => import('./components/host/HostDashboard/BookingManager'));
const Analytics = lazyLoad(() => import('./components/host/HostDashboard/Analytics'));
const BecomeHost = lazyLoad(() => import('./pages/BecomeHost/BecomeHost'));
const ErrorState = lazyLoad(() => import('./components/common/ErrorState/ErrorState'));

// Host components with explicit export names
const HostCalendar = lazyLoad(() => import('./pages/Host/HostCalendar'), 'HostCalendar');
const HostFinances = lazyLoad(() => import('./pages/Host/HostFinances'), 'HostFinances');
const HostStats = lazyLoad(() => import('./pages/Host/HostStats'), 'HostStats');
const HostMessages = lazyLoad(() => import('./pages/Host/HostMessages'), 'HostMessages');
const HostSettings = lazyLoad(() => import('./pages/Host/HostSettings'), 'HostSettings');

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider> {/* SearchProvider debe envolver todo el contenido que use useSearch */}
          <BookingProvider>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/property/:id" element={<Property />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/become-host" element={<BecomeHost />} />

                  {/* User Protected */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/booking/:propertyId" element={<BookingPage />} />
                  </Route>

                  {/* Host Protected */}
                  <Route element={<HostRoute />}>
                    <Route path="/host/dashboard" element={<HostDashboard />} />
                    <Route path="/host/properties" element={<PropertyManager />} />
                    <Route path="/host/properties/add" element={<AddProperty />} />
                    <Route path="/host/properties/edit/:id" element={<EditProperty />} />
                    <Route path="/host/bookings" element={<BookingManager />} />
                    <Route path="/host/analytics" element={<Analytics />} />
                    <Route path="/host/calendar" element={<HostCalendar />} />
                    <Route path="/host/finances" element={<HostFinances />} />
                    <Route path="/host/stats" element={<HostStats />} />
                    <Route path="/host/messages" element={<HostMessages />} />
                    <Route path="/host/settings" element={<HostSettings />} />
                  </Route>

                  {/* Error Pages */}
                  <Route
                    path="/unauthorized"
                    element={
                      <ErrorState
                        title="Acceso no autorizado"
                        message="No tienes permiso para acceder a esta página"
                      />
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <ErrorState
                        title="Página no encontrada"
                        message="La página que buscas no existe o ha sido movida"
                      />
                    }
                  />
                </Routes>
              </Suspense>
            </Layout>
          </BookingProvider>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;