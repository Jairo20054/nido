import React from 'react';
import LoginForm from '../../../components/user/Auth/LoginForm';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Bienvenido de vuelta</h1>
          <p>Inicia sesión para continuar</p>
        </div>
        <LoginForm />
        <div className="auth-footer">
          <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;