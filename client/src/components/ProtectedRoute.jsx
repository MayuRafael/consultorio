import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

// Protege páginas no frontend. A segurança real continua no backend (isAuth e hasRole).
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, carregando } = useAuth();

  if (carregando) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" replace />;

  return children;
}
