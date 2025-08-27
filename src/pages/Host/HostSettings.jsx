import React, { useState } from 'react';
import './HostSettings.css';

const HostSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      propertyName: 'Mi Propiedad',
      description: '',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1
    },
    pricing: {
      basePrice: 50,
      cleaningFee: 20,
      extraGuestFee: 10,
      weekendPrice: 70,
      currency: 'USD'
    },
    availability: {
      minimumStay: 1,
      maximumStay: 30,
      advanceNotice: 2,
      preparationTime: 3,
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    rules: {
      smoking: false,
      pets: false,
      parties: false,
      children: true,
      additionalRules: ''
    }
  });

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Aquí iría la lógica para guardar la configuración
    console.log('Configuración guardada:', settings);
    alert('Configuración guardada exitosamente');
  };

  const handleCancel = () => {
    // Lógica para cancelar cambios
    alert('Cambios descartados');
  };

  return (
    <div className="host-settings">
      <div className="settings-header">
        <h1>Configuración de Anfitrión</h1>
        <p>Gestiona todas las configuraciones de tu propiedad desde un solo lugar</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="icon-home"></i>
            <span>Información General</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <i className="icon-price"></i>
            <span>Precios y Tarifas</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            <i className="icon-calendar"></i>
            <span>Disponibilidad</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <i className="icon-rules"></i>
            <span>Normas de la Casa</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <i className="icon-photos"></i>
            <span>Fotografías</span>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>Información General</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre de la Propiedad</label>
                  <input
                    type="text"
                    value={settings.general.propertyName}
                    onChange={(e) => handleInputChange('general', 'propertyName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={settings.general.description}
                    onChange={(e) => handleInputChange('general', 'description', e.target.value)}
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Huéspedes Máximos</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.general.maxGuests}
                    onChange={(e) => handleInputChange('general', 'maxGuests', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Habitaciones</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.general.bedrooms}
                    onChange={(e) => handleInputChange('general', 'bedrooms', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Camas</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.general.beds}
                    onChange={(e) => handleInputChange('general', 'beds', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Baños</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.general.bathrooms}
                    onChange={(e) => handleInputChange('general', 'bathrooms', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="settings-section">
              <h2>Precios y Tarifas</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Precio Base (por noche)</label>
                  <div className="input-with-currency">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      min="0"
                      value={settings.pricing.basePrice}
                      onChange={(e) => handleInputChange('pricing', 'basePrice', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tarifa de Limpieza</label>
                  <div className="input-with-currency">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      min="0"
                      value={settings.pricing.cleaningFee}
                      onChange={(e) => handleInputChange('pricing', 'cleaningFee', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tarifa por Huésped Extra</label>
                  <div className="input-with-currency">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      min="0"
                      value={settings.pricing.extraGuestFee}
                      onChange={(e) => handleInputChange('pricing', 'extraGuestFee', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Precio Fin de Semana</label>
                  <div className="input-with-currency">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      min="0"
                      value={settings.pricing.weekendPrice}
                      onChange={(e) => handleInputChange('pricing', 'weekendPrice', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Moneda</label>
                  <select
                    value={settings.pricing.currency}
                    onChange={(e) => handleInputChange('pricing', 'currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="settings-section">
              <h2>Disponibilidad</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Estancia Mínima (noches)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.availability.minimumStay}
                    onChange={(e) => handleInputChange('availability', 'minimumStay', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Estancia Máxima (noches)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.availability.maximumStay}
                    onChange={(e) => handleInputChange('availability', 'maximumStay', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Tiempo de Preaviso (horas)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.availability.advanceNotice}
                    onChange={(e) => handleInputChange('availability', 'advanceNotice', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Tiempo de Preparación (horas)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.availability.preparationTime}
                    onChange={(e) => handleInputChange('availability', 'preparationTime', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Hora de Check-in</label>
                  <input
                    type="time"
                    value={settings.availability.checkInTime}
                    onChange={(e) => handleInputChange('availability', 'checkInTime', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hora de Check-out</label>
                  <input
                    type="time"
                    value={settings.availability.checkOutTime}
                    onChange={(e) => handleInputChange('availability', 'checkOutTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="settings-section">
              <h2>Normas de la Casa</h2>
              <div className="form-grid">
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>¿Se permite fumar?</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.rules.smoking}
                        onChange={(e) => handleInputChange('rules', 'smoking', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </label>
                </div>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>¿Se permiten mascotas?</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.rules.pets}
                        onChange={(e) => handleInputChange('rules', 'pets', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </label>
                </div>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>¿Se permiten fiestas/eventos?</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.rules.parties}
                        onChange={(e) => handleInputChange('rules', 'parties', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </label>
                </div>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>¿Adecuado para niños?</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.rules.children}
                        onChange={(e) => handleInputChange('rules', 'children', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </label>
                </div>
                <div className="form-group full-width">
                  <label>Normas Adicionales</label>
                  <textarea
                    value={settings.rules.additionalRules}
                    onChange={(e) => handleInputChange('rules', 'additionalRules', e.target.value)}
                    rows="4"
                    placeholder="Escribe aquí cualquier norma adicional para tus huéspedes"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="settings-section">
              <h2>Gestión de Fotografías</h2>
              <div className="photos-uploader">
                <div className="upload-area">
                  <i className="icon-upload"></i>
                  <p>Arrastra tus fotos aquí o haz clic para seleccionar</p>
                  <span>Mínimo 5 fotos, máximo 20. Formatos: JPG, PNG</span>
                  <button className="btn-primary">Seleccionar Archivos</button>
                </div>
                <div className="photos-grid">
                  <div className="photo-item main-photo">
                    <img src="https://via.placeholder.com/300x200?text=Foto+Principal" alt="Preview" />
                    <div className="photo-actions">
                      <button className="btn-icon"><i className="icon-star"></i> Principal</button>
                    </div>
                  </div>
                  <div className="photo-item">
                    <img src="https://via.placeholder.com/150x100?text=Foto+2" alt="Preview" />
                    <div className="photo-actions">
                      <button className="btn-icon"><i className="icon-delete"></i></button>
                    </div>
                  </div>
                  <div className="photo-item">
                    <img src="https://via.placeholder.com/150x100?text=Foto+3" alt="Preview" />
                    <div className="photo-actions">
                      <button className="btn-icon"><i className="icon-delete"></i></button>
                    </div>
                  </div>
                  <div className="photo-item">
                    <img src="https://via.placeholder.com/150x100?text=Foto+4" alt="Preview" />
                    <div className="photo-actions">
                      <button className="btn-icon"><i className="icon-delete"></i></button>
                    </div>
                  </div>
                  <div className="photo-item add-photo">
                    <i className="icon-add"></i>
                    <span>Añadir más fotos</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <button className="btn-secondary" onClick={handleCancel}>Cancelar</button>
            <button className="btn-primary" onClick={handleSaveSettings}>Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSettings;