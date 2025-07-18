import React, { useState, useEffect } from 'react';
import './MessageCenter.css';

const MessageCenter = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'Ana López', 
      subject: 'Confirmación de reserva', 
      preview: 'Gracias por reservar con nosotros. Adjunto encontrarás los detalles de tu reserva para las fechas solicitadas...', 
      fullContent: 'Gracias por reservar con nosotros. Adjunto encontrarás los detalles de tu reserva para las fechas solicitadas. Esperamos que disfrutes de tu estancia en nuestro apartamento del centro. Si necesitas cualquier información adicional, no dudes en contactarnos.',
      date: 'Hace 2 horas', 
      read: false,
      property: 'Apartamento Centro',
      priority: 'high',
      type: 'booking'
    },
    { 
      id: 2, 
      sender: 'Carlos Méndez', 
      subject: 'Consulta sobre propiedad', 
      preview: 'Hola, estoy interesado en tu propiedad y me gustaría hacer algunas preguntas sobre las comodidades disponibles...', 
      fullContent: 'Hola, estoy interesado en tu propiedad y me gustaría hacer algunas preguntas sobre las comodidades disponibles. ¿El lugar cuenta con WiFi? ¿Hay estacionamiento disponible? También me gustaría saber sobre las políticas de mascotas.',
      date: 'Ayer', 
      read: true,
      property: 'Casa Campestre',
      priority: 'medium',
      type: 'inquiry'
    },
    { 
      id: 3, 
      sender: 'María García', 
      subject: 'Cancelación de reserva', 
      preview: 'Lamentablemente debo cancelar mi reserva debido a circunstancias imprevistas...', 
      fullContent: 'Lamentablemente debo cancelar mi reserva debido a circunstancias imprevistas. Espero poder reagendar para una fecha posterior. ¿Cuál es el proceso para la cancelación?',
      date: 'Hace 3 días', 
      read: false,
      property: 'Villa Playa',
      priority: 'high',
      type: 'cancellation'
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyHistory, setReplyHistory] = useState([]);
  const [showCompose, setShowCompose] = useState(false);

  // Filtrar mensajes según búsqueda
  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    return message.sender.toLowerCase().includes(searchLower) ||
           message.subject.toLowerCase().includes(searchLower) ||
           message.preview.toLowerCase().includes(searchLower);
  });

  // Marcar mensaje como leído al seleccionarlo
  useEffect(() => {
    if (selectedMessage && !selectedMessage.read) {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === selectedMessage.id ? { ...msg, read: true } : msg
        )
      );
    }
  }, [selectedMessage]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const reply = {
        id: Date.now(),
        content: newMessage,
        timestamp: new Date().toLocaleString(),
        sender: 'Tú'
      };
      
      setReplyHistory(prev => [...prev, reply]);
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'booking': return '📅';
      case 'inquiry': return '❓';
      case 'cancellation': return '❌';
      default: return '💬';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <div className="message-center">
      <div className="message-center-header">
        <h1 className="message-center-title">
          Centro de Mensajes
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h1>
        <button 
          className="compose-btn"
          onClick={() => setShowCompose(true)}
        >
          + Nuevo Mensaje
        </button>
      </div>
      
      <div className="message-layout">
        {/* Lista de mensajes */}
        <div className="message-list">
          <div className="message-tabs">
            <button 
              className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              <span className="tab-icon">📥</span>
              Bandeja de entrada
              {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <span className="tab-icon">📤</span>
              Enviados
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="messages-container">
            {filteredMessages.length === 0 ? (
              <div className="no-messages">
                <p>No se encontraron mensajes</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`message-item ${!message.read ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'active' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="message-header">
                    <div className="sender-info">
                      <div className="sender-avatar">
                        {message.sender.charAt(0)}
                      </div>
                      <div className="message-meta">
                        <div className="sender-name">{message.sender}</div>
                        <div className="message-subject">
                          <span className="message-type-icon">
                            {getMessageIcon(message.type)}
                          </span>
                          {message.subject}
                        </div>
                      </div>
                    </div>
                    <div className="message-info">
                      <div 
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(message.priority) }}
                      ></div>
                      <div className="message-date">{message.date}</div>
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="message-preview">{message.preview}</div>
                  <div className="message-property">{message.property}</div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Vista de mensaje */}
        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="detail-header">
                <div className="sender-info">
                  <div className="sender-avatar large">
                    {selectedMessage.sender.charAt(0)}
                  </div>
                  <div className="sender-details">
                    <div className="sender-name">{selectedMessage.sender}</div>
                    <div className="message-subject">{selectedMessage.subject}</div>
                    <div className="message-date">{selectedMessage.date}</div>
                  </div>
                </div>
                <div className="message-tags">
                  <span className="message-property">{selectedMessage.property}</span>
                  <span 
                    className="priority-tag"
                    style={{ 
                      backgroundColor: getPriorityColor(selectedMessage.priority),
                      color: 'white'
                    }}
                  >
                    {selectedMessage.priority}
                  </span>
                </div>
              </div>
              
              <div className="message-content">
                <div className="original-message">
                  <p>{selectedMessage.fullContent}</p>
                </div>
                
                {replyHistory.length > 0 && (
                  <div className="reply-history">
                    <h4>Conversación:</h4>
                    {replyHistory.map((reply, index) => (
                      <div key={reply.id} className="reply-item">
                        <div className="reply-header">
                          <strong>{reply.sender}</strong>
                          <span className="reply-timestamp">{reply.timestamp}</span>
                        </div>
                        <p>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="message-reply">
                <div className="reply-header">
                  <h4>Responder:</h4>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="reply-input"
                />
                <div className="reply-actions">
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    📤 Enviar
                  </button>
                  <button 
                    className="draft-btn"
                    onClick={() => console.log('Guardar borrador')}
                  >
                    💾 Guardar borrador
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-message-selected">
              <div className="empty-state">
                <div className="empty-icon">📬</div>
                <h3>Selecciona un mensaje</h3>
                <p>Elige un mensaje de la lista para ver la conversación completa</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de nuevo mensaje */}
      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Mensaje</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCompose(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Para..."
                className="compose-input"
              />
              <input
                type="text"
                placeholder="Asunto..."
                className="compose-input"
              />
              <textarea
                placeholder="Escribe tu mensaje..."
                className="compose-textarea"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowCompose(false)}>
                Cancelar
              </button>
              <button className="send-btn">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;