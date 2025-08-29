import React, { useState, useEffect } from 'react';
import './HostSettings.css';

const HostSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Juan Pérez',
      email: 'juan.perez@ejemplo.com',
      phone: '+34 612 345 678',
      bio: 'Anfitrión desde 2020. Me encanta recibir huéspedes y mostrarles los lugares secretos de mi ciudad.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80',
      location: 'Madrid, España',
      languages: ['es', 'en']
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorAuth: true,
      loginAlerts: true,
      trustedDevices: [
        { id: 1, name: 'iPhone 13 Pro', lastActive: 'Hace 2 horas', location: 'Madrid, España' },
        { id: 2, name: 'MacBook Air', lastActive: 'Hace 3 días', location: 'Barcelona, España' }
      ]
    },
    verification: {
      status: 'verified',
      identityVerified: true,
      emailVerified: true,
      phoneVerified: true
    },
    preferences: {
      language: 'es',
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      theme: 'light',
      dateFormat: 'DD/MM/YYYY',
      automaticBackups: true
    },
    notifications: {
      emailNotifications: true,
      bookingRequests: true,
      bookingConfirmations: true,
      messages: true,
      reviews: true,
      promotions: false,
      newsletter: false,
      securityAlerts: true
    },
    payment: {
      paymentMethods: [
        { id: 1, type: 'card', last4: '1234', expiry: '12/25', primary: true },
        { id: 2, type: 'paypal', email: 'juan.perez@example.com', primary: false }
      ],
      defaultPayoutMethod: 'bank',
      payoutSchedule: 'weekly'
    },
    statistics: {
      totalBookings: 42,
      averageRating: 4.8,
      responseRate: 98,
      responseTime: 'menos de 1 hora',
      earnings: '12.450€'
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Cargar configuración desde localStorage si existe
    const savedSettings = localStorage.getItem('hostSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));

    // Registrar cambios no guardados
    setUnsavedChanges(prev => ({
      ...prev,
      [category]: {
        ...prev[category] || {},
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Guardar en localStorage
    localStorage.setItem('hostSettings', JSON.stringify(settings));
    
    // Limpiar cambios no guardados
    setUnsavedChanges({});
    
    // Mostrar notificación de éxito
    alert('Configuración guardada exitosamente');
  };

  const handleCancel = () => {
    // Recargar configuración original
    const savedSettings = localStorage.getItem('hostSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Limpiar cambios no guardados
    setUnsavedChanges({});
    
    alert('Cambios descartados');
  };

  const handleAvatarUpload = (file) => {
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange('profile', 'avatar', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarUpload(e.target.files[0]);
    }
  };

  const addPaymentMethod = () => {
    // Lógica para añadir método de pago
    alert('Redirigiendo para añadir método de pago');
  };

  const removePaymentMethod = (id) => {
    // Lógica para eliminar método de pago
    const updatedMethods = settings.payment.paymentMethods.filter(method => method.id !== id);
    handleInputChange('payment', 'paymentMethods', updatedMethods);
  };

  const setPrimaryPaymentMethod = (id) => {
    const updatedMethods = settings.payment.paymentMethods.map(method => ({
      ...method,
      primary: method.id === id
    }));
    handleInputChange('payment', 'paymentMethods', updatedMethods);
  };

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  return (
    <div className="host-settings">
      <div className="settings-header">
        <h1>Configuración de Cuenta</h1>
        <p>Gestiona tu información personal, preferencias y configuraciones de seguridad</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="sidebar-scroll">
            <div 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="icon-profile"></i>
              <span>Perfil</span>
              {unsavedChanges.profile && <span className="change-indicator"></span>}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="icon-security"></i>
              <span>Seguridad</span>
              {unsavedChanges.security && <span className="change-indicator"></span>}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => setActiveTab('verification')}
            >
              <i className="icon-verification"></i>
              <span>Verificación</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="icon-preferences"></i>
              <span>Preferencias</span>
              {unsavedChanges.preferences && <span className="change-indicator"></span>}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="icon-notifications"></i>
              <span>Notificaciones</span>
              {unsavedChanges.notifications && <span className="change-indicator"></span>}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <i className="icon-payment"></i>
              <span>Métodos de Pago</span>
              {unsavedChanges.payment && <span className="change-indicator"></span>}
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              <i className="icon-statistics"></i>
              <span>Estadísticas</span>
            </div>
          </div>
        </div>

        <div className="settings-content">
          <div className="content-scroll">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2>Información del Perfil</h2>
                <div className="form-grid">
                  <div className="form-group full-width" style={{textAlign: 'center'}}>
                    <div 
                      className={`avatar-upload ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <img src={settings.profile.avatar} alt="Avatar" className="avatar" />
                      <div className="avatar-overlay">
                        <label htmlFor="avatar-upload" className="avatar-upload-label">
                          <i className="icon-camera"></i>
                          {isDragging ? 'Suelta aquí' : 'Cambiar foto'}
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{display: 'none'}}
                        />
                      </div>
                    </div>
                    <p className="avatar-hint">Haz clic o arrastra una imagen para cambiar tu foto de perfil</p>
                  </div>
                  <div className="form-group">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      value={settings.profile.location}
                      onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Biografía</label>
                    <textarea
                      value={settings.profile.bio}
                      onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                      rows="3"
                      placeholder="Cuéntanos algo sobre ti"
                    />
                    <div className="char-count">{settings.profile.bio.length}/200</div>
                  </div>
                  <div className="form-group full-width">
                    <label>Idiomas que hablas</label>
                    <div className="chips-container">
                      {settings.profile.languages.map((lang, index) => (
                        <div key={index} className="language-chip">
                          {lang === 'es' ? 'Español' : 'English'}
                          <button 
                            type="button" 
                            className="chip-remove"
                            onClick={() => {
                              const newLangs = settings.profile.languages.filter((_, i) => i !== index);
                              handleInputChange('profile', 'languages', newLangs);
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      <select 
                        className="language-select"
                        onChange={(e) => {
                          if (e.target.value && !settings.profile.languages.includes(e.target.value)) {
                            handleInputChange('profile', 'languages', [...settings.profile.languages, e.target.value]);
                          }
                        }}
                      >
                        <option value="">Añadir idioma</option>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Seguridad de la Cuenta</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Contraseña actual</label>
                    <input
                      type="password"
                      value={settings.security.currentPassword}
                      onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nueva contraseña</label>
                    <input
                      type="password"
                      value={settings.security.newPassword}
                      onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={settings.security.confirmPassword}
                      onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                    />
                  </div>
                  <div className="toggle-group full-width">
                    <label className="toggle-label">
                      <span>Autenticación de dos factores</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </label>
                    <p className="toggle-description">Añade una capa adicional de seguridad a tu cuenta</p>
                  </div>
                  <div className="toggle-group full-width">
                    <label className="toggle-label">
                      <span>Alertas de inicio de sesión</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.security.loginAlerts}
                          onChange={(e) => handleInputChange('security', 'loginAlerts', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </label>
                    <p className="toggle-description">Recibe notificaciones cuando alguien inicie sesión en tu cuenta desde un nuevo dispositivo</p>
                  </div>
                  
                  <div className="form-group full-width">
                    <h3>Dispositivos conectados</h3>
                    <div className="devices-list">
                      {settings.security.trustedDevices.map(device => (
                        <div key={device.id} className="device-item">
                          <div className="device-info">
                            <div className="device-name">{device.name}</div>
                            <div className="device-location">{device.location}</div>
                            <div className="device-last-active">{device.lastActive}</div>
                          </div>
                          <button className="btn-text">Cerrar sesión</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="settings-section">
                <h2>Verificación de Identidad</h2>
                <div className="verification-status">
                  <div className={`status-badge ${settings.verification.status}`}>
                    {settings.verification.status === 'verified' ? 'Verificado' : 'Pendiente'}
                  </div>
                  <p>Tu identidad ha sido verificada. Esto genera confianza en los huéspedes.</p>
                </div>
                
                <div className="verification-steps">
                  <div className="verification-step completed">
                    <div className="step-icon">
                      <i className="icon-email"></i>
                    </div>
                    <div className="step-content">
                      <h4>Correo electrónico verificado</h4>
                      <p>Tu dirección de correo electrónico ha sido confirmada.</p>
                    </div>
                  </div>
                  
                  <div className="verification-step completed">
                    <div className="step-icon">
                      <i className="icon-phone"></i>
                    </div>
                    <div className="step-content">
                      <h4>Teléfono verificado</h4>
                      <p>Tu número de teléfono ha sido confirmado.</p>
                    </div>
                  </div>
                  
                  <div className="verification-step completed">
                    <div className="step-icon">
                      <i className="icon-id"></i>
                    </div>
                    <div className="step-content">
                      <h4>Identidad verificada</h4>
                      <p>Hemos verificado tu información de identidad.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2>Preferencias</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Idioma</label>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Moneda</label>
                    <select
                      value={settings.preferences.currency}
                      onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="GBP">Libra (£)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Zona horaria</label>
                    <select
                      value={settings.preferences.timezone}
                      onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                    >
                      <option value="Europe/Madrid">España (GMT+1)</option>
                      <option value="Europe/London">Reino Unido (GMT+0)</option>
                      <option value="America/New_York">EST (GMT-5)</option>
                      <option value="America/Los_Angeles">PST (GMT-8)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Formato de fecha</label>
                    <select
                      value={settings.preferences.dateFormat}
                      onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                      <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                      <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tema</label>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                  <div className="toggle-group full-width">
                    <label className="toggle-label">
                      <span>Copias de seguridad automáticas</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.preferences.automaticBackups}
                          onChange={(e) => handleInputChange('preferences', 'automaticBackups', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </label>
                    <p className="toggle-description">Realiza copias de seguridad automáticas de tu configuración</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Preferencias de Notificaciones</h2>
                <div className="form-grid">
                  <div className="toggle-group full-width">
                    <label className="toggle-label">
                      <span>Notificaciones por correo</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </label>
                    <p className="toggle-description">Activa o desactiva todas las notificaciones por correo electrónico</p>
                  </div>
                  
                  <div className="notification-subsection">
                    <h3>Reservas</h3>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Solicitudes de reserva</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.bookingRequests}
                            onChange={(e) => handleInputChange('notifications', 'bookingRequests', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Confirmaciones de reserva</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.bookingConfirmations}
                            onChange={(e) => handleInputChange('notifications', 'bookingConfirmations', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                  </div>
                  
                  <div className="notification-subsection">
                    <h3>Comunicación</h3>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Mensajes</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.messages}
                            onChange={(e) => handleInputChange('notifications', 'messages', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Reseñas</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.reviews}
                            onChange={(e) => handleInputChange('notifications', 'reviews', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                  </div>
                  
                  <div className="notification-subsection">
                    <h3>Otros</h3>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Promociones</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.promotions}
                            onChange={(e) => handleInputChange('notifications', 'promotions', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Boletín informativo</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.newsletter}
                            onChange={(e) => handleInputChange('notifications', 'newsletter', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <span>Alertas de seguridad</span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.notifications.securityAlerts}
                            onChange={(e) => handleInputChange('notifications', 'securityAlerts', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="settings-section">
                <h2>Métodos de Pago</h2>
                
                <div className="payment-methods">
                  {settings.payment.paymentMethods.map(method => (
                    <div key={method.id} className={`payment-method ${method.primary ? 'primary' : ''}`}>
                      <div className="method-icon">
                        {method.type === 'card' ? <i className="icon-card"></i> : <i className="icon-paypal"></i>}
                      </div>
                      <div className="method-details">
                        <h4>
                          {method.type === 'card' ? 'Tarjeta de crédito' : 'PayPal'}
                          {method.primary && <span className="primary-badge">Principal</span>}
                        </h4>
                        <p>
                          {method.type === 'card' ? `•••• •••• •••• ${method.last4}` : method.email}
                        </p>
                        {method.type === 'card' && <p>Vence: {method.expiry}</p>}
                      </div>
                      <div className="method-actions">
                        {!method.primary && (
                          <button 
                            className="btn-text"
                            onClick={() => setPrimaryPaymentMethod(method.id)}
                          >
                            Hacer principal
                          </button>
                        )}
                        <button 
                          className="btn-text danger"
                          onClick={() => removePaymentMethod(method.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button className="add-payment-method" onClick={addPaymentMethod}>
                    <i className="icon-add"></i>
                    Añadir método de pago
                  </button>
                </div>
                
                <div className="form-grid" style={{marginTop: '30px'}}>
                  <div className="form-group">
                    <label>Método de pago predeterminado</label>
                    <select
                      value={settings.payment.defaultPayoutMethod}
                      onChange={(e) => handleInputChange('payment', 'defaultPayoutMethod', e.target.value)}
                    >
                      <option value="bank">Transferencia bancaria</option>
                      <option value="paypal">PayPal</option>
                      <option value="card">Tarjeta</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Frecuencia de pagos</label>
                    <select
                      value={settings.payment.payoutSchedule}
                      onChange={(e) => handleInputChange('payment', 'payoutSchedule', e.target.value)}
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="settings-section">
                <h2>Estadísticas de Anfitrión</h2>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{settings.statistics.totalBookings}</div>
                    <div className="stat-label">Reservas totales</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{settings.statistics.averageRating}</div>
                    <div className="stat-label">Valoración promedio</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{settings.statistics.responseRate}%</div>
                    <div className="stat-label">Tasa de respuesta</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{settings.statistics.responseTime}</div>
                    <div className="stat-label">Tiempo de respuesta</div>
                  </div>
                </div>
                
                <div className="earnings-card">
                  <h3>Ganancias totales</h3>
                  <div className="earnings-amount">{settings.statistics.earnings}</div>
                  <p>Desde que comenzaste a hospedar</p>
                </div>
                
                <div className="performance-section">
                  <h3>Rendimiento mensual</h3>
                  <div className="performance-chart">
                    <div className="chart-bar" style={{height: '80%'}}>
                      <div className="chart-label">Ene</div>
                    </div>
                    <div className="chart-bar" style={{height: '60%'}}>
                      <div className="chart-label">Feb</div>
                    </div>
                    <div className="chart-bar" style={{height: '75%'}}>
                      <div className="chart-label">Mar</div>
                    </div>
                    <div className="chart-bar" style={{height: '90%'}}>
                      <div className="chart-label">Abr</div>
                    </div>
                    <div className="chart-bar" style={{height: '85%'}}>
                      <div className="chart-label">May</div>
                    </div>
                    <div className="chart-bar" style={{height: '95%'}}>
                      <div className="chart-label">Jun</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="settings-actions">
            <div className="changes-indicator">
              {hasUnsavedChanges ? (
                <span className="unsaved-changes">Tienes cambios sin guardar</span>
              ) : (
                <span className="all-saved">Todos los cambios guardados</span>
              )}
            </div>
            <div className="action-buttons">
              <button className="btn-secondary" onClick={handleCancel} disabled={!hasUnsavedChanges}>
                Descartar cambios
              </button>
              <button className="btn-primary" onClick={handleSaveSettings} disabled={!hasUnsavedChanges}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSettings;