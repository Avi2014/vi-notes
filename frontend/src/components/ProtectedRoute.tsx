import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects unauthenticated users to login page
 */
interface ProtectedRouteProps {
  element: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};
