import React, { useState, useEffect } from 'react';
import PropertyManager from './PropertyManager';
import BookingManager from './BookingManager';
import Analytics from './Analytics';
import './HostDashboard.css';

const HostDashboard = () => {
  const [stats, setStats] = useState({
    monthlyRevenue: 1200000,
    occupancyRate: 78,
    averageRating: 4.8,
    activeBookings: 12,
    totalProperties: 8,
    monthlyGrowth: 12.5
  });

  const [timeRange, setTimeRange] = useState('thisMonth');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setIsLoading(true);
    
    // Simular cambio de datos basado en el rango de tiempo
    setTimeout(() => {
      const multiplier = range === 'thisMonth' ? 1 : range === 'lastMonth' ? 0.8 : 1.2;
      setStats(prev => ({
        ...prev,
        monthlyRevenue: Math.round(1200000 * multiplier),
        occupancyRate: Math.round(78 * multiplier),
        monthlyGrowth: Math.round(12.5 * multiplier)
      }));
      setIsLoading(false);
    }, 500);
  };

  const StatCard = ({ icon, value, label, trend, color = 'primary' }) => (
    <div className={`stat-card stat-card--${color} ${isLoading ? 'loading' : ''}`}>
      <div className="stat-card__header">
        <div className="stat-card__icon">
          {icon}
        </div>
        {trend && (
          <div className={`stat-card__trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <span className="trend-icon">
              {trend > 0 ? '↗' : '↘'}
            </span>
            <span className="trend-value">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stat-card__content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="host-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header__content">
          <h1 className="dashboard-title">Panel de Anfitrión</h1>
          <p className="dashboard-subtitle">
            Gestiona tus propiedades y reservas desde un solo lugar
          </p>
        </div>
        
        <div className="dashboard-controls">
          <div className="time-range-selector">
            <button 
              className={`time-btn ${timeRange === 'thisMonth' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('thisMonth')}
            >
              Este mes
            </button>
            <button 
              className={`time-btn ${timeRange === 'lastMonth' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('lastMonth')}
            >
              Mes anterior
            </button>
            <button 
              className={`time-btn ${timeRange === 'thisYear' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('thisYear')}
            >
              Este año
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <StatCard
          icon="💰"
          value={formatCurrency(stats.monthlyRevenue)}
          label="Ingresos este mes"
          trend={stats.monthlyGrowth}
          color="revenue"
        />
        <StatCard
          icon="📊"
          value={`${stats.occupancyRate}%`}
          label="Tasa de ocupación"
          trend={5.2}
          color="occupancy"
        />
        <StatCard
          icon="⭐"
          value={`${stats.averageRating} ⭐`}
          label="Calificación promedio"
          trend={2.1}
          color="rating"
        />
        <StatCard
          icon="📅"
          value={stats.activeBookings}
          label="Reservas activas"
          color="bookings"
        />
        <StatCard
          icon="🏠"
          value={stats.totalProperties}
          label="Propiedades activas"
          color="properties"
        />
        <StatCard
          icon="📈"
          value={`+${stats.monthlyGrowth}%`}
          label="Crecimiento mensual"
          trend={stats.monthlyGrowth}
          color="growth"
        />
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <PropertyManager />
        </div>
        <div className="dashboard-section">
          <BookingManager />
        </div>
        <div className="dashboard-section dashboard-section--full">
          <Analytics />
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
