import React from 'react';
import './SortDropdown.css';

const SortDropdown = ({ value, onChange, disabled }) => {
  const sortOptions = [
    { id: 'relevance', label: 'Relevancia' },
    { id: 'price-low', label: 'Precio: menor a mayor' },
    { id: 'price-high', label: 'Precio: mayor a menor' },
    { id: 'rating', label: 'Mejor calificación' },
    { id: 'distance', label: 'Distancia al centro' }
  ];

  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select" className="sort-label">Ordenar por:</label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Ordenar resultados por"
      >
        {sortOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
export default SortDropdown;
