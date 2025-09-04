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

/**
 * Robust lazy loader helper
 *
 * - Accepts an import function and optional named export name.
 * - Handles modules that:
 *    • export a default React component
 *    • export a named React component
 *    • export an object with component properties
 *    • (rare) where module.default itself is a Promise (resolves to a component)
 *
 * - Provides clear console logging to help identify which import returns an unexpected shape.
 * - Returns a small fallback component on failure (so the app doesn't crash with the "promise resolves to object" message).
 */
const lazyLoad = (importFunc, exportName = null) =>
  lazy(async () => {
    try {
      const moduleOrPromise = importFunc();
      // allow importFunc to return a promise (normal dynamic import)
      const module = await moduleOrPromise;

      // Debug: show keys (uncomment for heavy debugging)
      // console.debug('lazyLoad module keys:', Object.keys(module), 'for', importFunc.toString());

      // Try to pick the component according to exportName -> default -> first candidate
      let candidate = null;

      if (exportName && module && module[exportName]) {
        candidate = module[exportName];
      } else if (module && module.default) {
        candidate = module.default;
      } else if (module) {
        // pick first export that looks like a component (function or object)
        const keys = Object.keys(module);
        for (let k of keys) {
          const value = module[k];
          if (typeof value === 'function' || (typeof value === 'object' && value !== null)) {
            candidate = value;
            break;
          }
        }
      }

      // If candidate is itself a Promise (rare case), await it
      if (candidate && typeof candidate.then === 'function') {
        candidate = await candidate;
      }

      // If candidate is an ESModule wrapper, unwrap
      if (candidate && candidate.__esModule && candidate.default) {
        candidate = candidate.default;
      }

      // Final validation
      const isValid = typeof candidate === 'function' || (typeof candidate === 'object' && candidate !== null);
      if (!isValid) {
        console.error('lazyLoad: invalid component export. Module content:', module);
        throw new Error('lazyLoad: module does not export a valid React component (default or named).');
      }

      return { default: candidate };
    } catch (err) {
      // Helpful console error for debugging which import failed
      console.error('lazyLoad error loading module:', err);

      // Small, safe fallback component to keep the app running
      const ErrorFallback = () => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Error al cargar componente</h2>
          <p>Inténtalo de nuevo más tarde.</p>
        </div>
      );
      return { default: ErrorFallback };
    }
  });

/* -------------------------
   Lazy Loaded Pages (default exports expected)
   ------------------------- */
const Home = lazyLoad(() => import('./pages/Home/Home'));
const Search = lazyLoad(() => import('./pages/Search/Search'));
const Property = lazyLoad(() => import('./pages/Property/Property'));
const PropertyDetail = lazyLoad(() => import('./components/property/PropertyDetail/PropertyDetail'));
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

/* If the Host pages export named components, pass the export name as second argument.
   Example: export function HostCalendar() {}  -> lazyLoad(() => import('...'), 'HostCalendar') */
const HostCalendar = lazyLoad(() => import('./pages/Host/HostCalendar'), 'HostCalendar');
const HostFinances = lazyLoad(() => import('./pages/Host/HostFinances'), 'HostFinances');
const HostStats = lazyLoad(() => import('./pages/Host/HostStats'), 'HostStats');
const HostMessages = lazyLoad(() => import('./pages/Host/HostMessages'), 'HostMessages');
const HostSettings = lazyLoad(() => import('./pages/Host/HostSettings'), 'HostSettings');

/* Corrected routes for header pages (ensure those files export default components) */
const OfertasPage = lazyLoad(() => import('./components/common/Header/OfertasPage'));
const MarketplacePage = lazyLoad(() => import('./components/common/Header/MarketplacePage'));
const ServiciosPage = lazyLoad(() => import('./components/common/Header/ServiciosPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <BookingProvider>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/become-host" element={<BecomeHost />} />

                  {/* Nuevas rutas agregadas */}
                  <Route path="/alojamientos" element={<Search />} />
                  <Route path="/experiencias" element={<OfertasPage />} />
                  <Route path="/servicios" element={<ServiciosPage />} />
                  <Route path="/ofertas" element={<OfertasPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />

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