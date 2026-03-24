import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getSessionStats, updateSession } from '../services/sessionService';
import './SessionDetailPage.css';

interface SessionStats {
  sessionId: string;
  title: string;
  content: {
    wordCount: number;
    characterCount: number;
    duration: string;
  };
  keystrokes: {
    total: number;
    avgInterval: string;
    eventCount: number;
  };
  pastes: {
    total: number;
    totalChars: number;
    avgLength: number;
    multilineCount: number;
  };
}

/**
 * Session Detail Page
 * 
 * Shows full session details including:
 * - Full content view
 * - Session metadata (title, description)
 * - Detailed statistics
 * - Edit capability
 * - Back to dashboard
 */
export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetch session details
   */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!sessionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [sessionData, statsData] = await Promise.all([
          getSession(sessionId),
          getSessionStats(sessionId)
        ]);

        setSession(sessionData);
        setStats(statsData);
        setEditedTitle(sessionData.title);
        setEditedDescription(sessionData.description || '');
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message || 'Failed to load session';
        setError(errorMsg);
        console.error('Failed to fetch session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [sessionId]);

  /**
   * Handle save changes
   */
  const handleSaveChanges = async () => {
    if (!sessionId) return;

    setIsSaving(true);
    try {
      const updated = await updateSession(sessionId, {
        title: editedTitle,
        description: editedDescription
      });
      setSession(updated);
      setIsEditing(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to save changes';
      setError(errorMsg);
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="session-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-detail-page">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-detail-page">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="empty-state">
          <p>Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <button
          className="btn btn-primary"
          onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
          disabled={isSaving}
        >
          {isSaving ? '⏳ Saving...' : isEditing ? '💾 Save' : '✏️ Edit'}
        </button>
      </div>

      {/* Session metadata */}
      <div className="session-metadata">
        {isEditing ? (
          <>
            <input
              type="text"
              className="edit-title-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Session title"
            />
            <textarea
              className="edit-description-input"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add notes about this session..."
              rows={3}
            />
          </>
        ) : (
          <>
            <h1 className="session-title">{session.title}</h1>
            {session.description && (
              <p className="session-description">{session.description}</p>
            )}
          </>
        )}
        <div className="session-meta-info">
          <span className="meta-item">📅 {new Date(session.createdAt).toLocaleDateString()}</span>
          <span className="meta-item">⏱️ {session.startedAt && new Date(session.startedAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-section">
          <h2>📊 Session Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <div className="stat-label">Words</div>
                <div className="stat-value">{stats.content.wordCount.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔤</div>
              <div className="stat-info">
                <div className="stat-label">Characters</div>
                <div className="stat-value">{stats.content.characterCount.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⌨️</div>
              <div className="stat-info">
                <div className="stat-label">Keystrokes</div>
                <div className="stat-value">{stats.keystrokes.total.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-label">Pastes</div>
                <div className="stat-value">{stats.pastes.total}</div>
              </div>
            </div>
          </div>

          <div className="detailed-stats">
            <div className="stat-group">
              <h3>⌨️ Keystroke Activity</h3>
              <p>Average interval between keystrokes: <strong>{stats.keystrokes.avgInterval}</strong></p>
              <p>Total keystroke events recorded: <strong>{stats.keystrokes.eventCount.toLocaleString()}</strong></p>
            </div>
            <div className="stat-group">
              <h3>📋 Paste Activity</h3>
              <p>Total pasted characters: <strong>{stats.pastes.totalChars.toLocaleString()}</strong></p>
              <p>Average paste length: <strong>{stats.pastes.avgLength}</strong> characters</p>
              <p>Multiline pastes: <strong>{stats.pastes.multilineCount}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Content section */}
      <div className="content-section">
        <h2>📄 Content</h2>
        <div className="content-display">
          <p>{session.content}</p>
        </div>
        <div className="content-info">
          <p>
            <strong>{session.wordCount.toLocaleString()}</strong> words • 
            <strong> {session.characterCount.toLocaleString()}</strong> characters
          </p>
        </div>
      </div>
    </div>
  );
};
