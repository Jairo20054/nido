import React from 'react';
import PropertyCard from './PropertyCard';
import './PropertyList.css';

const PropertyList = ({ properties }) => {
  return (
    <div className="property-list">
      <div className="list-header">
        <h2>Propiedades Disponibles</h2>
        <div className="sort-options">
          <select className="sort-select">
            <option>Relevancia</option>
            <option>Precio: menor a mayor</option>
            <option>Precio: mayor a menor</option>
            <option>Mejor calificación</option>
          </select>
        </div>
      </div>
      
      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      <div className="pagination">
        <button className="pagination-button">Anterior</button>
        <div className="page-numbers">
          <span className="active">1</span>
          <span>2</span>
          <span>3</span>
          <span>...</span>
          <span>10</span>
        </div>
        <button className="pagination-button">Siguiente</button>
      </div>
    </div>
  );
};

export default PropertyList;
