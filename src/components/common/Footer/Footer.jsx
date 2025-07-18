import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  ExternalLink,
  Accessibility
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
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
    { icon: MapPin, text: 'Bogotá, Colombia', href: '#' }
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

  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Accessibility className="h-8 w-8 text-emerald-400" aria-hidden="true" />
              <h3 className="text-2xl font-bold text-white">
                AccesibleStay
              </h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Encuentra alojamientos verdaderamente accesibles para todos. 
              Creamos un mundo donde viajar es posible para todas las personas.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                    {contact.href !== '#' ? (
                      <a 
                        href={contact.href}
                        className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                        onClick={() => handleLinkClick(contact.href, contact.text)}
                      >
                        {contact.text}
                      </a>
                    ) : (
                      <span className="text-gray-300 text-sm">{contact.text}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Navegación
            </h4>
            <ul className="space-y-3" role="list">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                    aria-label={link.ariaLabel}
                    onClick={() => handleLinkClick(link.href, link.label)}
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Legal
            </h4>
            <ul className="space-y-3" role="list">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200"
                    onClick={() => handleLinkClick(link.href, link.label)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Conecta con nosotros
            </h4>
            
            {/* Social Icons */}
            <div className="flex gap-4 mb-6">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label={`Síguenos en ${social.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick(social.label)}
                    style={{'--hover-color': social.color}}
                  >
                    <IconComponent 
                      className="h-5 w-5 text-gray-300 hover:text-white transition-colors duration-200" 
                      aria-hidden="true"
                    />
                  </a>
                );
              })}
            </div>

            {/* Newsletter Signup */}
            <div>
              <p className="text-gray-300 text-sm mb-3">
                Recibe noticias y ofertas especiales
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                  aria-label="Dirección de correo electrónico para newsletter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const email = e.target.value;
                      if (email) {
                        console.log('Newsletter signup:', email);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-r-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Suscribirse al newsletter"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    const email = input.value;
                    if (email) {
                      console.log('Newsletter signup:', email);
                      input.value = '';
                    }
                  }}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} AccesibleStay. Todos los derechos reservados.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                Hecho con <Heart className="h-4 w-4 text-red-500" aria-hidden="true" /> en Colombia
              </span>
              <span className="hidden md:block">•</span>
              <a 
                href="/accessibility-statement" 
                className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1"
              >
                <Accessibility className="h-4 w-4" aria-hidden="true" />
                Comprometidos con la accesibilidad
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 z-50"
        aria-label="Volver al inicio de la página"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;