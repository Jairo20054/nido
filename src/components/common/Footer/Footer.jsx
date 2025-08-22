import React, { useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  ExternalLink,
  Accessibility,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const navigationLinks = [
    { href: '/', label: 'Inicio', ariaLabel: 'Ir a la página principal' },
    { href: '/search', label: 'Buscar', ariaLabel: 'Buscar alojamientos accesibles' },
    { href: '/about', label: 'Nosotros', ariaLabel: 'Conocer más sobre AccesibleStay' },
    { href: '/accessibility', label: 'Accesibilidad', ariaLabel: 'Información sobre accesibilidad' },
    { href: '/contact', label: 'Contacto', ariaLabel: 'Contactar con nosotros' },
    { href: '/help', label: 'Ayuda', ariaLabel: 'Centro de ayuda y soporte' }
  ];

  const legalLinks = [
    { href: '/terms', label: 'Términos y Condiciones' },
    { href: '/privacy', label: 'Política de Privacidad' },
    { href: '/cookies', label: 'Política de Cookies' },
    { href: '/accessibility-statement', label: 'Declaración de Accesibilidad' }
  ];

  const socialLinks = [
    { 
      href: 'https://facebook.com/accesiblestay', 
      icon: Facebook, 
      label: 'Facebook',
      color: '#1877F2'
    },
    { 
      href: 'https://instagram.com/accesiblestay', 
      icon: Instagram, 
      label: 'Instagram',
      color: '#E4405F'
    },
    { 
      href: 'https://twitter.com/accesiblestay', 
      icon: Twitter, 
      label: 'Twitter',
      color: '#1DA1F2'
    }
  ];

  const contactInfo = [
    { icon: Mail, text: 'hola@accesiblestay.com', href: 'mailto:hola@accesiblestay.com' },
    { icon: Phone, text: '+57 (1) 234-5678', href: 'tel:+5712345678' },
    { icon: MapPin, text: 'Bogotá, Colombia', href: 'https://maps.google.com/?q=Bogotá,Colombia' }
  ];

  const handleLinkClick = (href, label) => {
    // Analytics tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'footer_link_click', {
        'link_text': label,
        'link_url': href
      });
    }
  };

  const handleSocialClick = (platform) => {
    // Analytics tracking for social media
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'social_media_click', {
        'social_platform': platform
      });
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email && isValidEmail(email)) {
      console.log('Newsletter signup:', email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-header">
              <Accessibility className="brand-icon" aria-hidden="true" />
              <h3 className="brand-title">
                AccesibleStay
              </h3>
            </div>
            <p className="brand-description">
              Encuentra alojamientos verdaderamente accesibles para todos. 
              Creamos un mundo donde viajar es posible para todas las personas.
            </p>
            
            {/* Contact Info */}
            <div className="contact-info">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <div key={index} className="contact-item">
                    <IconComponent className="contact-icon" aria-hidden="true" />
                    {contact.href ? (
                      <a 
                        href={contact.href}
                        className="contact-link"
                        onClick={() => handleLinkClick(contact.href, contact.text)}
                        target={contact.href.startsWith('http') ? '_blank' : '_self'}
                        rel={contact.href.startsWith('http') ? 'noopener noreferrer' : ''}
                      >
                        {contact.text}
                      </a>
                    ) : (
                      <span className="contact-text">{contact.text}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-section">
            <h4 className="section-title">
              Navegación
            </h4>
            <ul className="footer-links" role="list">
              {navigationLinks.map((link, index) => (
                <li key={index} className="footer-link-item">
                  <a
                    href={link.href}
                    className="footer-link"
                    aria-label={link.ariaLabel}
                    onClick={() => handleLinkClick(link.href, link.label)}
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="link-external-icon" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4 className="section-title">
              Legal
            </h4>
            <ul className="footer-links" role="list">
              {legalLinks.map((link, index) => (
                <li key={index} className="footer-link-item">
                  <a
                    href={link.href}
                    className="footer-link"
                    onClick={() => handleLinkClick(link.href, link.label)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div className="footer-section">
            <h4 className="section-title">
              Conecta con nosotros
            </h4>
            
            {/* Social Icons */}
            <div className="social-icons">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="social-icon"
                    aria-label={`Síguenos en ${social.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick(social.label)}
                    style={{'--hover-color': social.color}}
                  >
                    <IconComponent className="social-icon-svg" aria-hidden="true" />
                  </a>
                );
              })}
            </div>

            {/* Newsletter Signup */}
            <div className="newsletter-section">
              <p className="newsletter-text">
                Recibe noticias y ofertas especiales
              </p>
              {subscribed ? (
                <div className="newsletter-success">
                  <p>¡Gracias por suscribirte!</p>
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <div className="input-group">
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      className="newsletter-input"
                      aria-label="Dirección de correo electrónico para newsletter"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="newsletter-button"
                      aria-label="Suscribirse al newsletter"
                    >
                      <ArrowRight className="newsletter-icon" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} AccesibleStay. Todos los derechos reservados.
          </p>
          
          <div className="footer-meta">
            <span className="made-with">
              Hecho con <Heart className="heart-icon" aria-hidden="true" /> en Colombia
            </span>
            <span className="meta-separator">•</span>
            <a 
              href="/accessibility-statement" 
              className="accessibility-statement"
            >
              <Accessibility className="accessibility-icon" aria-hidden="true" />
              Comprometidos con la accesibilidad
            </a>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="back-to-top"
        aria-label="Volver al inicio de la página"
      >
        <ChevronUp className="back-to-top-icon" aria-hidden="true" />
      </button>
    </footer>
  );
};

export default Footer;