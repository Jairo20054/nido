import React, { useState, useEffect } from 'react';
import './HostMessages.css';

const HostMessages = ({ messages: initialMessages = [], onMessagesChange }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState({ title: '', content: '', type: 'info' });

  // Efecto para actualizar mensajes cuando cambian las props
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Notificar cambios en los mensajes
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Agregar un nuevo mensaje
  const handleAddMessage = () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) return;
    
    const message = {
      id: Date.now(),
      title: newMessage.title,
      content: newMessage.content,
      type: newMessage.type,
      date: new Date().toISOString(),
      read: false
    };
    
    setMessages([message, ...messages]);
    setNewMessage({ title: '', content: '', type: 'info' });
  };

  // Marcar mensaje como leído/no leído
  const toggleReadStatus = (id) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: !msg.read } : msg
    ));
  };

  // Eliminar un mensaje
  const deleteMessage = (id) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };

  // Filtrar mensajes según el filtro seleccionado
  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !message.read) || 
                         (filter === 'read' && message.read) || 
                         message.type === filter;
    
    const matchesSearch = searchTerm === '' || 
                         message.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Contador de mensajes no leídos
  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <div className="host-messages-container">
      <div className="messages-header">
        <h2>Mensajes del Anfitrión</h2>
        <div className="unread-badge">{unreadCount} no leídos</div>
      </div>

      <div className="messages-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''} 
            onClick={() => setFilter('unread')}
          >
            No leídos
          </button>
          <button 
            className={filter === 'read' ? 'active' : ''} 
            onClick={() => setFilter('read')}
          >
            Leídos
          </button>
        </div>

        <div className="type-filters">
          <button 
            className={`type-filter-btn ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
          >
            Información
          </button>
          <button 
            className={`type-filter-btn ${filter === 'alert' ? 'active' : ''}`}
            onClick={() => setFilter('alert')}
          >
            Alertas
          </button>
          <button 
            className={`type-filter-btn ${filter === 'action' ? 'active' : ''}`}
            onClick={() => setFilter('action')}
          >
            Acciones
          </button>
        </div>

        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar mensajes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="add-message-form">
        <h3>Nuevo Mensaje</h3>
        <div className="form-row">
          <input 
            type="text" 
            placeholder="Título del mensaje" 
            value={newMessage.title}
            onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
          />
          <select 
            value={newMessage.type}
            onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
          >
            <option value="info">Información</option>
            <option value="alert">Alerta</option>
            <option value="action">Acción requerida</option>
          </select>
        </div>
        <textarea 
          placeholder="Contenido del mensaje..." 
          value={newMessage.content}
          onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
        />
        <button className="add-btn" onClick={handleAddMessage}>
          Agregar Mensaje
        </button>
      </div>

      <div className="messages-list">
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <p>No hay mensajes {filter !== 'all' ? `con el filtro "${filter}"` : ''}</p>
          </div>
        ) : (
          filteredMessages.map(message => (
            <div 
              key={message.id} 
              className={`message-item ${message.type} ${message.read ? 'read' : 'unread'}`}
            >
              <div className="message-header">
                <h4 className="message-title">{message.title}</h4>
                <div className="message-actions">
                  <button 
                    className={`read-btn ${message.read ? 'read' : ''}`}
                    onClick={() => toggleReadStatus(message.id)}
                    title={message.read ? 'Marcar como no leído' : 'Marcar como leído'}
                  >
                    {message.read ? '✓' : '👁️'}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteMessage(message.id)}
                    title="Eliminar mensaje"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="message-content">{message.content}</p>
              <div className="message-footer">
                <span className="message-date">
                  {new Date(message.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="message-type">{message.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HostMessages;