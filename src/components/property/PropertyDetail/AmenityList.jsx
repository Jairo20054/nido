import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Star, 
  Wifi, 
  Car, 
  Utensils, 
  Tv, 
  Trees, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Grid,
  List,
  Eye,
  EyeOff
} from 'lucide-react';

const AmenityList = ({ amenities = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('category'); // 'category', 'name', 'popularity'

  // Enhanced categories with better icons and colors
  const categories = [
    { 
      id: 'basic',
      title: 'Servicios Básicos', 
      icon: <Wifi className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      items: amenities.filter(a => a.category === 'basic')
    },
    { 
      id: 'kitchen',
      title: 'Cocina y Comedor', 
      icon: <Utensils className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      items: amenities.filter(a => a.category === 'kitchen')
    },
    { 
      id: 'entertainment',
      title: 'Entretenimiento', 
      icon: <Tv className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      items: amenities.filter(a => a.category === 'entertainment')
    },
    { 
      id: 'outdoor',
      title: 'Espacios Exteriores', 
      icon: <Trees className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      items: amenities.filter(a => a.category === 'outdoor')
    },
    { 
      id: 'accessibility',
      title: 'Accesibilidad', 
      icon: <Shield className="w-5 h-5" />,
      color: 'from-teal-500 to-cyan-500',
      items: amenities.filter(a => a.category === 'accessibility')
    },
    { 
      id: 'security',
      title: 'Seguridad y Protección', 
      icon: <Shield className="w-5 h-5" />,
      color: 'from-gray-600 to-gray-700',
      items: amenities.filter(a => a.category === 'security')
    },
    { 
      id: 'parking',
      title: 'Estacionamiento', 
      icon: <Car className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-600',
      items: amenities.filter(a => a.category === 'parking')
    }
  ];

  // Filter categories based on search and filters
  const filteredCategories = useMemo(() => {
    return categories.map(category => {
      let filteredItems = category.items;

      // Filter by search term
      if (searchTerm) {
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Filter by availability
      if (showAvailableOnly) {
        filteredItems = filteredItems.filter(item => item.available !== false);
      }

      // Filter by selected categories
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(category.id)) {
          filteredItems = [];
        }
      }

      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0);
  }, [categories, searchTerm, selectedCategories, showAvailableOnly]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setShowAvailableOnly(false);
  };

  const totalAmenities = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  const AmenityIcon = ({ amenity }) => {
    if (amenity.customIcon) {
      return <span className="text-2xl">{amenity.customIcon}</span>;
    }
    
    // Default icons based on amenity type
    const iconMap = {
      'wifi': <Wifi className="w-5 h-5" />,
      'parking': <Car className="w-5 h-5" />,
      'kitchen': <Utensils className="w-5 h-5" />,
      'tv': <Tv className="w-5 h-5" />,
      'security': <Shield className="w-5 h-5" />
    };
    
    return iconMap[amenity.type] || <span className="text-2xl">{amenity.icon || '🏠'}</span>;
  };

  const AmenityItem = ({ amenity, categoryColor }) => (
    <div className={`amenity-item ${amenity.available === false ? 'unavailable' : ''} ${amenity.featured ? 'featured' : ''}`}>
      <div className={`amenity-icon-wrapper bg-gradient-to-br ${categoryColor}`}>
        <AmenityIcon amenity={amenity} />
      </div>
      <div className="amenity-content">
        <div className="amenity-header">
          <span className="amenity-name">{amenity.name}</span>
          {amenity.featured && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
          {amenity.available === false && (
            <X className="w-4 h-4 text-red-500" />
          )}
          {amenity.available !== false && (
            <Check className="w-4 h-4 text-green-500" />
          )}
        </div>
        {amenity.description && (
          <p className="amenity-description">{amenity.description}</p>
        )}
        {amenity.additional_info && (
          <div className="amenity-info">
            <span className="info-label">Info:</span>
            <span className="info-text">{amenity.additional_info}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!amenities || amenities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-lg font-semibold mb-2">No hay comodidades disponibles</h3>
        <p className="text-sm text-center max-w-md">
          Las comodidades de esta propiedad aún no han sido agregadas.
        </p>
      </div>
    );
  }

  return (
    <div className="amenity-list-container">
      {/* Header with controls */}
      <div className="amenity-header">
        <div className="header-top">
          <div className="title-section">
            <h2 className="main-title">Comodidades y Servicios</h2>
            <p className="subtitle">
              {totalAmenities} comodidades disponibles en {filteredCategories.length} categorías
            </p>
          </div>
          
          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="controls-section">
          <div className="search-box">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar comodidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="filter-controls">
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`filter-btn ${showAvailableOnly ? 'active' : ''}`}
            >
              {showAvailableOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Solo disponibles
            </button>

            {(searchTerm || selectedCategories.length > 0 || showAvailableOnly) && (
              <button onClick={clearFilters} className="clear-filters">
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`category-filter ${selectedCategories.includes(category.id) ? 'active' : ''}`}
            >
              <div className={`filter-icon bg-gradient-to-br ${category.color}`}>
                {category.icon}
              </div>
              <span>{category.title}</span>
              <span className="count">({category.items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`amenity-content ${viewMode}`}>
        {filteredCategories.map((category) => (
          <div key={category.id} className="category-section">
            <div className="category-header" onClick={() => toggleExpandCategory(category.id)}>
              <div className="category-title-wrapper">
                <div className={`category-icon bg-gradient-to-br ${category.color}`}>
                  {category.icon}
                </div>
                <div className="category-info">
                  <h3 className="category-title">{category.title}</h3>
                  <span className="category-count">{category.items.length} elementos</span>
                </div>
              </div>
              <button className="expand-btn">
                {expandedCategories[category.id] ? 
                  <ChevronUp className="w-5 h-5" /> : 
                  <ChevronDown className="w-5 h-5" />
                }
              </button>
            </div>
            
            <div className={`amenity-grid ${viewMode} ${expandedCategories[category.id] === false ? 'collapsed' : ''}`}>
              {category.items.map((amenity, idx) => (
                <AmenityItem 
                  key={`${category.id}-${idx}`} 
                  amenity={amenity} 
                  categoryColor={category.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No se encontraron comodidades</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
          <button onClick={clearFilters} className="reset-btn">
            Resetear filtros
          </button>
        </div>
      )}
    </div>
  );
};

// Demo component with sample data
const AmenityListDemo = () => {
  const sampleAmenities = [
    // Basic services
    { name: 'WiFi gratuito', category: 'basic', icon: '📶', available: true, featured: true, description: 'Internet de alta velocidad en toda la propiedad' },
    { name: 'Aire acondicionado', category: 'basic', icon: '❄️', available: true, additional_info: 'Control individual por habitación' },
    { name: 'Calefacción', category: 'basic', icon: '🔥', available: true },
    { name: 'Agua caliente', category: 'basic', icon: '🚿', available: true },
    
    // Kitchen
    { name: 'Cocina completa', category: 'kitchen', icon: '🍳', available: true, description: 'Equipada con todos los electrodomésticos' },
    { name: 'Microondas', category: 'kitchen', icon: '📦', available: true },
    { name: 'Refrigerador', category: 'kitchen', icon: '🧊', available: true },
    { name: 'Lavavajillas', category: 'kitchen', icon: '🧽', available: false },
    { name: 'Cafetera', category: 'kitchen', icon: '☕', available: true },
    
    // Entertainment
    { name: 'TV con cable', category: 'entertainment', icon: '📺', available: true, featured: true },
    { name: 'Netflix', category: 'entertainment', icon: '🎬', available: true },
    { name: 'Equipo de sonido', category: 'entertainment', icon: '🎵', available: true },
    { name: 'Libros y revistas', category: 'entertainment', icon: '📚', available: true },
    
    // Outdoor
    { name: 'Balcón privado', category: 'outdoor', icon: '🌅', available: true, featured: true, description: 'Con vista panorámica de la ciudad' },
    { name: 'Jardín', category: 'outdoor', icon: '🌸', available: true },
    { name: 'Parrilla', category: 'outdoor', icon: '🔥', available: true },
    { name: 'Mobiliario exterior', category: 'outdoor', icon: '🪑', available: true },
    
    // Security
    { name: 'Caja fuerte', category: 'security', icon: '🔒', available: true },
    { name: 'Detector de humo', category: 'security', icon: '🚨', available: true },
    { name: 'Extintor', category: 'security', icon: '🧯', available: true },
    { name: 'Botiquín', category: 'security', icon: '🏥', available: true },
    
    // Accessibility
    { name: 'Acceso para sillas de ruedas', category: 'accessibility', icon: '♿', available: true },
    { name: 'Baño adaptado', category: 'accessibility', icon: '🚿', available: false },
    
    // Parking
    { name: 'Estacionamiento gratuito', category: 'parking', icon: '🚗', available: true, featured: true },
    { name: 'Garaje cubierto', category: 'parking', icon: '🏠', available: true }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AmenityList amenities={sampleAmenities} />
    </div>
  );
};

export default AmenityListDemo;