import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextEditor } from '../components/Editor/TextEditor';
import { useAuth } from '../hooks/useAuth';
import { createSession } from '../services/sessionService';
import './EditorPage.css';

/**
 * EditorPage Component
 * 
 * Main page that displays the text editor for writing content.
 * Requires authentication (protected route).
 * Features:
 * - Display user email in header
 * - Logout button
 * - Text editor with save functionality
 * - Save session to database
 */
interface EditorPageState {
  sessionId: string;
}

export const EditorPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorContentRef = useRef<string>('');
  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const handleSave = async (content: string) => {
    editorContentRef.current = content;
    setSessionTitle('');
    setSessionDescription('');
    setError(null);
    setIsSaveModalOpen(true);
  };

  const handleSaveSession = async () => {
    if (!sessionTitle.trim()) {
      setError('Session title is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createSession({
        sessionId: sessionIdRef.current,
        title: sessionTitle,
        description: sessionDescription,
        content: editorContentRef.current
      });

      setIsSaveModalOpen(false);
      // Show success message and redirect to dashboard
      alert('✅ Session saved successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save session';
      setError(errorMsg);
      console.error('Failed to save session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="editor-page">
      <header className="editor-header">
        <h1>Vi-Notes</h1>
        <div className="editor-header-right">
          <button onClick={() => navigate('/dashboard')} className="dashboard-button">
            📚 Dashboard
          </button>
          {user && <span className="user-email">{user.email}</span>}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <TextEditor onSave={handleSave} sessionId={sessionIdRef.current} />

      {/* Save Session Modal */}
      {isSaveModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSaveModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>💾 Save Writing Session</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="title">Session Title *</label>
              <input
                id="title"
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Give your session a name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                placeholder="Add any notes about this session"
                rows={3}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsSaveModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveSession}
                disabled={isSaving || !sessionTitle.trim()}
              >
                {isSaving ? '⏳ Saving...' : '💾 Save Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
