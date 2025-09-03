// tests/Home.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home/Home';

// Mock de hooks y componentes
jest.mock('../../hooks/useSearch', () => ({
  __esModule: true,
  default: () => ({
    searchResults: [],
    loading: false,
    error: null,
    searchProperties: jest.fn(),
  }),
}));

jest.mock('./HeroSection', () => {
  return function MockHeroSection({ onSearch }) {
    return (
      <div data-testid="hero-section">
        <button 
          onClick={() => onSearch({ 
            location: 'Bogota', 
            checkIn: '2025-08-01', 
            checkOut: '2025-12-31', 
            guests: 2 
          })}
          data-testid="search-button"
        >
          Buscar
        </button>
      </div>
    );
  };
});

// Mock de window.open
const mockWindowOpen = jest.fn();
global.window.open = mockWindowOpen;

describe('Home Component', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  it('debe abrir una nueva pestaña con los parámetros correctos al hacer clic en buscar', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Hacer clic en el botón de búsqueda
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Verificar que window.open fue llamado con la URL correcta
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('/search?location=Bogota&checkIn=2025-08-01&checkOut=2025-12-31&guests=2'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('debe construir la URL correctamente con todos los parámetros', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Obtener la instancia del componente
    const searchButton = screen.getByTestId('search-button');
    
    // Simular clic con parámetros adicionales
    fireEvent.click(searchButton);

    // Verificar que la URL contiene todos los parámetros esperados
    const calledUrl = mockWindowOpen.mock.calls[0][0];
    expect(calledUrl).toContain('location=Bogota');
    expect(calledUrl).toContain('checkIn=2025-08-01');
    expect(calledUrl).toContain('checkOut=2025-12-31');
    expect(calledUrl).toContain('guests=2');
  });
});