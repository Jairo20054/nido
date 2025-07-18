import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuthContext();
  if (loading) {
    // Muestra un spinner o componente de carga mientras se verifica la autenticación
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;