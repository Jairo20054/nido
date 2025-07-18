import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Importar estilos
import './assets/styles/variables.css';
import './assets/styles/global.css';
import './assets/styles/utilities.css';
import './assets/styles/animations.css';

// Error Boundary mejorado con protección adicional
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error de renderizado:', error, errorInfo);
    // Aquí podrías enviar el error a un servicio de monitoreo
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Protección adicional contra errores en el propio ErrorBoundary
      const errorMessage = this.state.error?.toString() || 'Error desconocido';
      
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '600px',
          margin: '50px auto'
        }}>
          <h2 style={{ color: '#d32f2f' }}>Algo salió mal</h2>
          <p>Ha ocurrido un error inesperado en la aplicación.</p>
          
          <div style={{ 
            backgroundColor: '#ffebee', 
            padding: '10px',
            borderRadius: '4px',
            margin: '20px 0',
            fontFamily: 'monospace',
            fontSize: '14px',
            textAlign: 'left',
            overflowX: 'auto'
          }}>
            {errorMessage}
          </div>
          
          <button 
            onClick={this.handleReload}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Recargar página
          </button>
          
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#757575' }}>
            Si el problema persiste, contacta al soporte técnico.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Verificar que el elemento root existe
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('No se encontró el elemento con id "root" en el DOM');
} else {
  try {
    const root = createRoot(rootElement);
    
    // Componente wrapper para manejo de errores
    const AppWithErrorBoundary = () => (
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );

    root.render(<AppWithErrorBoundary />);
  } catch (error) {
    console.error('Error al renderizar la aplicación:', error);
    
    // Fallback básico si falla el renderizado inicial
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: #d32f2f;">Error crítico</h2>
        <p>No se pudo cargar la aplicación. Por favor, recarga la página.</p>
        <button onclick="window.location.reload()" 
                style="padding: 10px 20px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
          Recargar página
        </button>
      </div>
    `;
  }
}