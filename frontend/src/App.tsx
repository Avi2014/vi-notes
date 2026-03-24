import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EditorPage } from './pages/EditorPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SessionDetailPage } from './pages/SessionDetailPage';

/**
 * App Component
 * 
 * Root component for the Vi-Notes application.
 * Provides authentication context and routing for all pages.
 * 
 * Routes:
 * - /: Home - redirects to /login (unauthenticated) or /editor (authenticated)
 * - /login: Login page (public)
 * - /register: Registration page (public)
 * - /editor: Text editor page (protected)
 * - /dashboard: Sessions dashboard (protected)
 * - /session/:sessionId: Session detail view (protected)
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/editor" 
            element={<ProtectedRoute element={<EditorPage />} />}
          />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={<DashboardPage />} />}
          />
          <Route 
            path="/session/:sessionId" 
            element={<ProtectedRoute element={<SessionDetailPage />} />}
          />
          
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
