import React, { useState, useEffect } from 'react';
import { User, Calendar, Heart, Settings, Bell, LogOut } from 'lucide-react';
import MyBookings from './MyBookings';
import Favorites from './Favorites';
import Profile from './Profile';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    // Simular carga de datos del usuario
    const loadUserData = () => {
      // En una app real, esto vendría de tu estado global o API
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(user.name || 'Usuario');
    };
    loadUserData();
  }, []);

  const tabs = [
    { id: 'bookings', label: 'Mis Reservas', icon: Calendar, component: MyBookings },
    { id: 'favorites', label: 'Favoritos', icon: Heart, component: Favorites },
    { id: 'profile', label: 'Mi Perfil', icon: User, component: Profile }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MyBookings;

  const handleLogout = () => {
    // Lógica de logout
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <h1 className="dashboard-title">
              ¡Hola, {userName}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Gestiona tus reservas y preferencias desde aquí
            </p>
          </div>
          
          <div className="dashboard-header-actions">
            <button className="notification-btn" aria-label="Notificaciones">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
            
            <button className="settings-btn" aria-label="Configuración">
              <Settings size={20} />
            </button>
            
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="dashboard-tabs">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
              >
                <IconComponent size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="dashboard-content">
        <div className="dashboard-section">
          <ActiveComponent />
        </div>
      </main>

      {/* Quick Stats */}
      <aside className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>5</h3>
            <p>Reservas Activas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Favoritos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3>100%</h3>
            <p>Perfil Completo</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;