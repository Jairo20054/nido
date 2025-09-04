import React, { useMemo, useState, useEffect } from 'react';
import {
  FaShoppingCart,
  FaSearch,
  FaHeart,
  FaStar,
  FaShoppingBag,
  FaTimes,
  FaHome,
  FaUtensils,
  FaCouch,
  FaBath,
  FaBed,
  FaLightbulb
} from 'react-icons/fa';
import './MarketplacePage.css';

const initialProducts = [
  {
    id: 'p-1',
    title: 'Juego de Toallas Premium',
    price: 85000,
    rating: 4.7,
    category: 'baño',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Set de 4 toallas de baño 100% algodón egipcio, suaves y absorbentes.'
  },
  {
    id: 'p-2',
    title: 'Set de Utensilios de Cocina',
    price: 120000,
    rating: 4.5,
    category: 'cocina',
    image: 'https://images.unsplash.com/photo-1583778176476-4a8b8dc563ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Set completo de utensilios de acero inoxidable para tu cocina.'
  },
  {
    id: 'p-3',
    title: 'Sofá Moderno de 3 Plazas',
    price: 1850000,
    rating: 4.9,
    category: 'sala',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Elegante sofá con estructura de madera y tapizado en tela resistente.'
  },
  {
    id: 'p-4',
    title: 'Juego de Sábanas de Algodón',
    price: 98000,
    rating: 4.6,
    category: 'dormitorio',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Set de sábanas de algodón percal de 600 hilos con fundas de almohada.'
  },
  {
    id: 'p-5',
    title: 'Lámpara de Pie Moderna',
    price: 145000,
    rating: 4.4,
    category: 'iluminación',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Lámpara de pie con diseño escandinavo y luz regulable.'
  },
  {
    id: 'p-6',
    title: 'Organizador de Baño',
    price: 65000,
    rating: 4.2,
    category: 'baño',
    image: 'https://images.unsplash.com/photo-1633380114041-e7cd4f2979f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Organizador con múltiples compartimentos para mantener tu baño ordenado.'
  },
  {
    id: 'p-7',
    title: 'Set de Ollas Antiadherentes',
    price: 320000,
    rating: 4.8,
    category: 'cocina',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Set de 5 piezas con tecnología antiadherente y mango ergonómico.'
  },
  {
    id: 'p-8',
    title: 'Mesa de Centro de Madera',
    price: 450000,
    rating: 4.5,
    category: 'sala',
    image: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    description: 'Mesa de centro con diseño rústico y almacenamiento incorporado.'
  }
];

const categories = [
  { id: 'todos', label: 'Todos', icon: <FaHome /> },
  { id: 'baño', label: 'Baño', icon: <FaBath /> },
  { id: 'cocina', label: 'Cocina', icon: <FaUtensils /> },
  { id: 'sala', label: 'Sala', icon: <FaCouch /> },
  { id: 'dormitorio', label: 'Dormitorio', icon: <FaBed /> },
  { id: 'iluminación', label: 'Iluminación', icon: <FaLightbulb /> },
];

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(
    value
  );

const MarketplacePage = () => {
  const [productos] = useState(initialProducts);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const matchCat = categoriaSeleccionada === 'todos' || p.category === categoriaSeleccionada;
      const matchText =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [productos, categoriaSeleccionada, busqueda]);

  const toggleFavorito = (id) => {
    setFavoritos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addToCart = (product) => {
    setCarrito((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (!existing) return [...prev, { ...product, qty: 1 }];
      return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
    });
    
    // Mostrar notificación de producto añadido
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <span>¡Producto añadido al carrito!</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  const removeFromCart = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCarrito((prev) => 
      prev.map((p) => (p.id === id ? { ...p, qty: newQty } : p))
    );
  };

  const cartCount = carrito.reduce((acc, p) => acc + (p.qty || 1), 0);
  const cartTotal = carrito.reduce((acc, p) => acc + (p.price * (p.qty || 1)), 0);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  // Cerrar el carrito al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isCartOpen && !e.target.closest('.mp-cart-drawer') && 
          !e.target.closest('.mp-cart-btn')) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen]);

  return (
    <div className="marketplace-page">
      <header className="mp-header">
        <div className="mp-header-top">
          <h1>Nido Marketplace</h1>
          <div className="mp-cart-container">
            <button className="mp-cart-btn" onClick={toggleCart} aria-label="Carrito">
              <FaShoppingCart />
              {cartCount > 0 && <span className="mp-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>
          </div>
        </div>

        <div className="mp-search">
          <FaSearch className="mp-icon" />
          <input
            type="search"
            placeholder="Buscar productos, categorías..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>

        <div className="mp-categories-scroll">
          <div className="mp-categories">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`mp-cat-btn ${categoriaSeleccionada === c.id ? 'active' : ''}`}
                onClick={() => setCategoriaSeleccionada(c.id)}
                aria-pressed={categoriaSeleccionada === c.id}
              >
                <span className="mp-cat-icon">{c.icon}</span>
                <span className="mp-cat-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mp-main-content">
        <div className="mp-grid-container">
          <h2 className="mp-section-title">
            {categoriaSeleccionada === 'todos' ? 'Todos los productos' : 
              `Productos de ${categories.find(c => c.id === categoriaSeleccionada)?.label}`}
            <span className="mp-products-count">({filtered.length} productos)</span>
          </h2>
          
          <div className="mp-grid" role="list">
            {filtered.length === 0 ? (
              <div className="mp-empty">
                <div className="mp-empty-icon">🔍</div>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustando los filtros o términos de búsqueda</p>
              </div>
            ) : (
              filtered.map((p) => (
                <article key={p.id} className="mp-card" role="listitem">
                  <div className="mp-image">
                    <img src={p.image} alt={p.title} loading="lazy" />
                    <button
                      className={`mp-fav ${favoritos.includes(p.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorito(p.id)}
                      aria-pressed={favoritos.includes(p.id)}
                      aria-label={favoritos.includes(p.id) ? 'Quitar favorito' : 'Agregar a favoritos'}
                    >
                      <FaHeart />
                    </button>
                  </div>

                  <div className="mp-body">
                    <h3 className="mp-title">{p.title}</h3>
                    <p className="mp-description">{p.description}</p>
                    <div className="mp-meta">
                      <div className="mp-price">{formatPrice(p.price)}</div>
                      <div className="mp-rating">
                        <FaStar /> <span>{p.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="mp-actions-row">
                      <button className="btn btn-primary" onClick={() => addToCart(p)}>
                        <FaShoppingBag /> <span>Añadir</span>
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => viewProductDetails(p)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Drawer del carrito */}
      <div className={`mp-cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={toggleCart}></div>
      <aside className={`mp-cart-drawer ${isCartOpen ? 'open' : ''}`} aria-live="polite">
        <div className="mp-cart-header">
          <h4>Tu Carrito de Compras</h4>
          <button className="mp-cart-close" onClick={toggleCart} aria-label="Cerrar carrito">
            <FaTimes />
          </button>
        </div>
        
        <div className="mp-cart-content">
          {carrito.length === 0 ? (
            <div className="mp-empty-cart">
              <div className="mp-empty-cart-icon">🛒</div>
              <p>Tu carrito está vacío</p>
              <button className="btn btn-outline" onClick={toggleCart}>Seguir comprando</button>
            </div>
          ) : (
            <>
              <ul className="mp-cart-list">
                {carrito.map((c) => (
                  <li key={c.id} className="mp-cart-item">
                    <div className="cart-left">
                      <img src={c.image} alt={c.title} />
                    </div>
                    <div className="cart-mid">
                      <div className="cart-title">{c.title}</div>
                      <div className="cart-price">{formatPrice(c.price)} c/u</div>
                      <div className="cart-qty-controls">
                        <button onClick={() => updateQuantity(c.id, c.qty - 1)}>-</button>
                        <span>{c.qty}</span>
                        <button onClick={() => updateQuantity(c.id, c.qty + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-right">
                      <div className="cart-total">{formatPrice(c.price * c.qty)}</div>
                      <button className="cart-remove" onClick={() => removeFromCart(c.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mp-cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Envío:</span>
                  <span>{cartTotal > 200000 ? 'Gratis' : formatPrice(15000)}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal + (cartTotal > 200000 ? 0 : 15000))}</span>
                </div>
                
                <button className="btn btn-primary checkout-btn">
                  Proceder al pago
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Modal de detalles del producto */}
      {selectedProduct && (
        <div className="mp-product-modal">
          <div className="mp-modal-overlay" onClick={closeProductDetails}></div>
          <div className="mp-modal-content">
            <button className="mp-modal-close" onClick={closeProductDetails}>
              <FaTimes />
            </button>
            
            <div className="mp-modal-body">
              <div className="modal-image">
                <img src={selectedProduct.image} alt={selectedProduct.title} />
              </div>
              
              <div className="modal-details">
                <h2>{selectedProduct.title}</h2>
                <div className="modal-category">{selectedProduct.category}</div>
                <div className="modal-rating">
                  <FaStar /> <span>{selectedProduct.rating.toFixed(1)}</span>
                </div>
                <p className="modal-description">{selectedProduct.description}</p>
                
                <div className="modal-price">{formatPrice(selectedProduct.price)}</div>
                
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => {
                    addToCart(selectedProduct);
                    closeProductDetails();
                  }}>
                    <FaShoppingBag /> Añadir al carrito
                  </button>
                  <button className="btn btn-outline" onClick={closeProductDetails}>
                    Seguir viendo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;