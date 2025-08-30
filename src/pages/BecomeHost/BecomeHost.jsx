import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BecomeHost.css';

const BecomeHost = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para la animación de entrada
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`become-host-container ${isVisible ? 'visible' : ''}`}>
      {/* Hero Section */}
      <section className="become-host-hero">
        <div className="hero-content">
          <h1>Convierte tu espacio en <span className="highlight">ingresos extras</span></h1>
          <p>Únete a la comunidad de anfitriones de Nido y comienza a ganar dinero con ese espacio que no utilizas</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">12,500+</span>
              <span className="stat-label">Anfitriones</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">$38M+</span>
              <span className="stat-label">Ganados</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Valoración</span>
            </div>
          </div>
          <Link to="/host/properties/add" className="cta-button">
            Comenzar ahora
            <span className="button-icon">→</span>
          </Link>
        </div>
        <div className="hero-visual">
          <div className="visual-placeholder">
            <div className="floating-element el-1">🏠</div>
            <div className="floating-element el-2">💰</div>
            <div className="floating-element el-3">⭐</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <h2>¿Por qué ser anfitrión en <span className="brand">Nido</span>?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Ingresos flexibles</h3>
              <p>Gana dinero extra con ese espacio que no utilizas. Tú decides cuándo y cómo rentar.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌎</div>
              <h3>Comunidad global</h3>
              <p>Conecta con viajeros responsables de todo el mundo y construye tu reputación.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚙️</div>
              <h3>Herramientas fáciles</h3>
              <p>Gestiona tus reservas, precios y disponibilidad con nuestro panel intuitivo.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3>Protección completa</h3>
              <p>Seguro de propiedad y responsabilidad civil incluido para tu tranquilidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-container">
          <h2>Comienza a ganar en 4 simples pasos</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Registra tu espacio</h3>
                <p>Completa nuestro sencillo formulario con los detalles y fotos de tu propiedad.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Establece disponibilidad</h3>
                <p>Define cuándo está disponible tu espacio y a qué precio.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Recibe reservas</h3>
                <p>Acepta solicitudes de huéspedes verificados desde tu panel.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Recibe pagos</h3>
                <p>Gana dinero de forma segura después de cada estancia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <h2>Anfitriones que triunfan con Nido</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Empecé rentando mi departamento pequeño los fines de semana y ahora gestiono 3 propiedades. Nido me cambió la vida."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div className="author-details">
                  <h4>Ana Martínez</h4>
                  <span>Anfitriona desde 2022</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"La plataforma es súper intuitiva. En menos de 24 horas ya tenía mi primer huésped. Las herramientas de gestión son excelentes."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">C</div>
                <div className="author-details">
                  <h4>Carlos Rodríguez</h4>
                  <span>Anfitrión desde 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2>¿Listo para convertir tu espacio en ingresos?</h2>
          <p>Únete a miles de anfitriones que ya están ganando con Nido</p>
          <Link to="/host/properties/add" className="cta-button secondary">
            Comenzar ahora
          </Link>
          <div className="cta-footer">
            <p>¿Tienes dudas? <Link to="/contact">Habla con nuestro equipo</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeHost;