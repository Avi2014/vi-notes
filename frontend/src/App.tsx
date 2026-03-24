import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EditorPage } from './pages/EditorPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

/**
 * App Component
 * 
 * Root component for the Vi-Notes application.
 * Provides authentication context and routing for all pages.
 * 
 * Routes:
 * - /login: Login page (public)
 * - /register: Registration page (public)
 * - /editor: Text editor page (protected)
 * - /: Redirects to /editor
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
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/editor" replace />} />
          
          {/* Catch all - redirect to editor */}
          <Route path="*" element={<Navigate to="/editor" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
