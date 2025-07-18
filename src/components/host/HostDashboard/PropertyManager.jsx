import React, { useState, useEffect } from 'react';
import './PropertyManager.css';

const PropertyManager = () => {
  const [properties, setProperties] = useState([
    { 
      id: 1, 
      name: 'Apartamento Centro', 
      location: 'Bogotá', 
      status: 'Activo', 
      bookings: 12, 
      rating: 4.8,
      price: 85000,
      description: 'Hermoso apartamento en el centro de la ciudad con vista panorámica',
      amenities: ['WiFi', 'Cocina', 'Parking'],
      capacity: 4,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop'
    },
    { 
      id: 2, 
      name: 'Casa Campestre', 
      location: 'Medellín', 
      status: 'Inactivo', 
      bookings: 8, 
      rating: 4.5,
      price: 120000,
      description: 'Casa rodeada de naturaleza, perfecta para descansar',
      amenities: ['Piscina', 'Jardín', 'BBQ', 'WiFi'],
      capacity: 6,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
    },
    { 
      id: 3, 
      name: 'Loft Industrial', 
      location: 'Cali', 
      status: 'Activo', 
      bookings: 15, 
      rating: 4.9,
      price: 95000,
      description: 'Moderno loft con diseño industrial en zona bohemia',
      amenities: ['WiFi', 'Cocina', 'Aire acondicionado', 'Terraza'],
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop'
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('name');
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    capacity: '',
    amenities: [],
    image: ''
  });

  const availableAmenities = ['WiFi', 'Cocina', 'Parking', 'Piscina', 'Jardín', 'BBQ', 'Aire acondicionado', 'Terraza', 'Gym', 'Spa'];

  // Filtrar y ordenar propiedades
  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'bookings':
          return b.bookings - a.bookings;
        default:
          return 0;
      }
    });

  const toggleStatus = (id) => {
    setProperties(properties.map(prop => 
      prop.id === id 
        ? { ...prop, status: prop.status === 'Activo' ? 'Inactivo' : 'Activo' } 
        : prop
    ));
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      location: property.location,
      price: property.price.toString(),
      description: property.description,
      capacity: property.capacity.toString(),
      amenities: property.amenities,
      image: property.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setProperties(properties.filter(prop => prop.id !== id));
    setShowDeleteModal(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProperty) {
      // Editar propiedad existente
      setProperties(properties.map(prop => 
        prop.id === editingProperty.id 
          ? {
              ...prop,
              ...formData,
              price: parseInt(formData.price),
              capacity: parseInt(formData.capacity)
            }
          : prop
      ));
    } else {
      // Crear nueva propiedad
      const newProperty = {
        id: Math.max(...properties.map(p => p.id)) + 1,
        ...formData,
        price: parseInt(formData.price),
        capacity: parseInt(formData.capacity),
        status: 'Activo',
        bookings: 0,
        rating: 0,
        image: formData.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop'
      };
      setProperties([...properties, newProperty]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProperty(null);
    setFormData({
      name: '',
      location: '',
      price: '',
      description: '',
      capacity: '',
      amenities: [],
      image: ''
    });
  };

  const handleAmenityToggle = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity]
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatsCards = () => {
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'Activo').length;
    const totalBookings = properties.reduce((sum, p) => sum + p.bookings, 0);
    const avgRating = properties.length > 0 
      ? (properties.reduce((sum, p) => sum + p.rating, 0) / properties.length).toFixed(1)
      : 0;

    return { totalProperties, activeProperties, totalBookings, avgRating };
  };

  const stats = getStatsCards();

  return (
    <div className="property-manager">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <h3>{stats.totalProperties}</h3>
            <p>Total Propiedades</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.activeProperties}</h3>
            <p>Propiedades Activas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Total Reservas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats.avgRating}</h3>
            <p>Calificación Promedio</p>
          </div>
        </div>
      </div>

      {/* Header con filtros */}
      <div className="section-header">
        <h2 className="section-title">Mis Propiedades</h2>
        <button className="add-property-btn" onClick={() => setShowForm(true)}>
          <span className="btn-icon">+</span>
          Añadir propiedad
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Ordenar por nombre</option>
            <option value="price">Ordenar por precio</option>
            <option value="rating">Ordenar por calificación</option>
            <option value="bookings">Ordenar por reservas</option>
          </select>
        </div>
      </div>
      
      {/* Lista de propiedades */}
      <div className="properties-grid">
        {filteredProperties.map(property => (
          <div key={property.id} className="property-card">
            <div className="property-image">
              <img src={property.image} alt={property.name} />
              <div className={`property-status-badge ${property.status.toLowerCase()}`}>
                {property.status}
              </div>
            </div>
            <div className="property-content">
              <div className="property-header">
                <h3 className="property-name">{property.name}</h3>
                <div className="property-rating">
                  <span className="rating-icon">⭐</span>
                  <span>{property.rating}</span>
                </div>
              </div>
              <p className="property-location">📍 {property.location}</p>
              <p className="property-description">{property.description}</p>
              
              <div className="property-amenities">
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="amenity-tag more">+{property.amenities.length - 3}</span>
                )}
              </div>

              <div className="property-meta">
                <div className="property-price">
                  {formatPrice(property.price)}
                  <span className="price-period">/noche</span>
                </div>
                <div className="property-capacity">
                  👥 {property.capacity} huéspedes
                </div>
              </div>

              <div className="property-stats">
                <span className="booking-count">📅 {property.bookings} reservas</span>
              </div>

              <div className="property-actions">
                <button 
                  className={`status-toggle-btn ${property.status.toLowerCase()}`}
                  onClick={() => toggleStatus(property.id)}
                >
                  {property.status === 'Activo' ? '⏸️ Desactivar' : '▶️ Activar'}
                </button>
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(property)}
                >
                  ✏️ Editar
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => setShowDeleteModal(property.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No se encontraron propiedades</h3>
          <p>Intenta ajustar los filtros de búsqueda o añade una nueva propiedad.</p>
        </div>
      )}
      
      {/* Modal de formulario */}
      {showForm && (
        <div className="property-form-modal" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProperty ? 'Editar propiedad' : 'Añadir nueva propiedad'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="property-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la propiedad *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Ej: Apartamento Centro"
                  />
                </div>
                <div className="form-group">
                  <label>Ubicación *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    placeholder="Ej: Bogotá"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio por noche (COP) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="85000"
                  />
                </div>
                <div className="form-group">
                  <label>Capacidad de huéspedes *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    required
                    min="1"
                    placeholder="4"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe tu propiedad..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>URL de imagen</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="form-group">
                <label>Amenidades</label>
                <div className="amenities-grid">
                  {availableAmenities.map(amenity => (
                    <label key={amenity} className="amenity-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  {editingProperty ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="delete-modal" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(null)}>
          <div className="modal-content">
            <div className="delete-icon">⚠️</div>
            <h3>¿Eliminar propiedad?</h3>
            <p>Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(null)}>
                Cancelar
              </button>
              <button className="delete-confirm-btn" onClick={() => handleDelete(showDeleteModal)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;