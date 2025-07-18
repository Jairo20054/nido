import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [animateCharts, setAnimateCharts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  // Datos de ejemplo más completos
  const revenueData = {
    '3m': [
      { month: 'Abr', revenue: 1100000, bookings: 15 },
      { month: 'May', revenue: 1200000, bookings: 18 },
      { month: 'Jun', revenue: 900000, bookings: 12 },
    ],
    '6m': [
      { month: 'Ene', revenue: 800000, bookings: 12 },
      { month: 'Feb', revenue: 950000, bookings: 14 },
      { month: 'Mar', revenue: 700000, bookings: 10 },
      { month: 'Abr', revenue: 1100000, bookings: 15 },
      { month: 'May', revenue: 1200000, bookings: 18 },
      { month: 'Jun', revenue: 900000, bookings: 12 },
    ],
    '12m': [
      { month: 'Jul 23', revenue: 650000, bookings: 9 },
      { month: 'Ago 23', revenue: 720000, bookings: 11 },
      { month: 'Sep 23', revenue: 890000, bookings: 13 },
      { month: 'Oct 23', revenue: 1050000, bookings: 16 },
      { month: 'Nov 23', revenue: 1180000, bookings: 19 },
      { month: 'Dic 23', revenue: 1350000, bookings: 22 },
      { month: 'Ene', revenue: 800000, bookings: 12 },
      { month: 'Feb', revenue: 950000, bookings: 14 },
      { month: 'Mar', revenue: 700000, bookings: 10 },
      { month: 'Abr', revenue: 1100000, bookings: 15 },
      { month: 'May', revenue: 1200000, bookings: 18 },
      { month: 'Jun', revenue: 900000, bookings: 12 },
    ]
  };

  const currentData = revenueData[selectedPeriod];
  const maxRevenue = Math.max(...currentData.map(item => item.revenue));
  const totalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = currentData.reduce((sum, item) => sum + item.bookings, 0);
  const avgRevenuePerBooking = totalRevenue / totalBookings;

  const propertyData = [
    { name: 'Apartamento Centro', percentage: 65, color: '#10B981', revenue: 6500000 },
    { name: 'Casa Campestre', percentage: 25, color: '#0EA5E9', revenue: 2500000 },
    { name: 'Villa Marina', percentage: 7, color: '#F59E0B', revenue: 700000 },
    { name: 'Otras', percentage: 3, color: '#EF4444', revenue: 300000 }
  ];

  const kpiData = [
    {
      title: 'Ingresos Total',
      value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
      change: '+12.5%',
      trend: 'up',
      icon: '💰'
    },
    {
      title: 'Reservas Total',
      value: totalBookings.toString(),
      change: '+8.3%',
      trend: 'up',
      icon: '📅'
    },
    {
      title: 'Ingreso Promedio',
      value: `$${Math.round(avgRevenuePerBooking / 1000)}K`,
      change: '+3.2%',
      trend: 'up',
      icon: '📊'
    },
    {
      title: 'Ocupación',
      value: '87%',
      change: '-2.1%',
      trend: 'down',
      icon: '🏠'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 200);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2 className="section-title">Dashboard de Analíticas</h2>
        <div className="period-selector">
          {Object.keys(revenueData).map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => {
                setSelectedPeriod(period);
                setAnimateCharts(false);
              }}
            >
              {period === '3m' ? '3 Meses' : period === '6m' ? '6 Meses' : '12 Meses'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-icon">{kpi.icon}</span>
              <span className={`kpi-trend ${kpi.trend}`}>
                {kpi.change}
              </span>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-title">{kpi.title}</div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        {/* Revenue Chart */}
        <div className="chart-card revenue-chart">
          <div className="chart-header">
            <h3>Ingresos por Período</h3>
            <div className="chart-total">
              Total: {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className="bar-chart">
            {currentData.map((item, index) => (
              <div key={index} className="bar-container">
                <div className="bar-tooltip">
                  {formatCurrency(item.revenue)}
                  <br />
                  {item.bookings} reservas
                </div>
                <div 
                  className={`bar ${animateCharts ? 'animate' : ''}`}
                  style={{ 
                    height: animateCharts ? `${(item.revenue / maxRevenue) * 100}%` : '0%',
                    animationDelay: `${index * 100}ms`
                  }}
                ></div>
                <div className="bar-label">{item.month}</div>
                <div className="bar-bookings">{item.bookings} res.</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Property Distribution Chart */}
        <div className="chart-card property-chart">
          <div className="chart-header">
            <h3>Distribución por Propiedades</h3>
            <div className="chart-total">
              {propertyData.length} propiedades activas
            </div>
          </div>
          <div className="pie-chart-container">
            <div className={`pie-chart ${animateCharts ? 'animate' : ''}`}>
              <div className="pie-center">
                <div className="pie-center-value">100%</div>
                <div className="pie-center-label">Ocupación</div>
              </div>
            </div>
            <div className="pie-legend">
              {propertyData.map((item, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="color-box" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="legend-info">
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-percentage">{item.percentage}%</span>
                    <span className="legend-revenue">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="insights-section">
        <h3>Insights Clave</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Mejor Mes</h4>
              <p>Mayo generó los mayores ingresos con {formatCurrency(1200000)}</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🏆</div>
            <div className="insight-content">
              <h4>Propiedad Destacada</h4>
              <p>Apartamento Centro representa el 65% de las reservas</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>Oportunidad</h4>
              <p>Considera promocionar más la Villa Marina para equilibrar la demanda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;