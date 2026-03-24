import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSessions, deleteSession, Session } from '../services/sessionService';
import './DashboardPage.css';

/**
 * Dashboard Page
 * 
 * Shows user's writing sessions with:
 * - List of all sessions
 * - Session metadata (title, word count, date)
 * - Search functionality
 * - Delete session capability
 * - Open session for viewing/editing
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const SESSIONS_PER_PAGE = 10;

  /**
   * Fetch sessions for current page
   */
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSessions(
        currentPage * SESSIONS_PER_PAGE,
        SESSIONS_PER_PAGE,
        searchTerm
      );
      setSessions(result.sessions);
      setTotalSessions(result.total);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load sessions';
      setError(errorMsg);
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);

  /**
   * Load sessions on mount and when filters change
   */
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * Handle session deletion
   */
  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }

    setIsDeletingId(sessionId);
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.sessionId !== sessionId));
      setTotalSessions(Math.max(0, totalSessions - 1));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete session';
      setError(errorMsg);
      console.error('Failed to delete session:', err);
    } finally {
      setIsDeletingId(null);
    }
  };

  /**
   * Handle session click - navigate to detail view
   */
  const handleViewSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  /**
   * Calculate total pages
   */
  const totalPages = Math.ceil(totalSessions / SESSIONS_PER_PAGE);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  /**
   * Format date
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>📚 Writing Sessions</h1>
          <p className="dashboard-subtitle">View and manage your writing sessions</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/editor')}
          >
            ✏️ New Session
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="user-info">
        <span>👤 {user?.email}</span>
      </div>

      {/* Search bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search sessions by title or description..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(0); // Reset to first page on search
          }}
          className="search-input"
        />
      </div>

      {/* Error message */}
      {error && <div className="error-message">❌ {error}</div>}

      {/* Loading state */}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your sessions...</p>
        </div>
      )}

      {/* Sessions list */}
      {!isLoading && sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No sessions yet</h2>
          <p>
            {searchTerm
              ? 'No sessions match your search. Try a different term.'
              : 'Start writing to create your first session!'}
          </p>
          {!searchTerm && (
            <button className="btn btn-primary" onClick={() => navigate('/editor')}>
              Create Your First Session
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="sessions-grid">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="session-card"
                onClick={() => handleViewSession(session.sessionId)}
              >
                <div className="session-card-header">
                  <h3 className="session-title">{session.title}</h3>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.sessionId);
                    }}
                    disabled={isDeletingId === session.sessionId}
                    title="Delete session"
                  >
                    {isDeletingId === session.sessionId ? '⏳' : '🗑️'}
                  </button>
                </div>

                {session.description && (
                  <p className="session-description">{session.description}</p>
                )}

                <div className="session-stats">
                  <div className="stat">
                    <span className="stat-icon">📊</span>
                    <span className="stat-label">Words</span>
                    <span className="stat-value">{session.wordCount.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🔤</span>
                    <span className="stat-label">Characters</span>
                    <span className="stat-value">{session.characterCount.toLocaleString()}</span>
                  </div>
                  {(session.pasteCount !== undefined && session.pasteCount > 0) && (
                    <div className="stat">
                      <span className="stat-icon">📋</span>
                      <span className="stat-label">Pastes</span>
                      <span className="stat-value">{session.pasteCount}</span>
                    </div>
                  )}
                </div>

                <div className="session-footer">
                  <span className="session-date">{formatDate(session.createdAt)}</span>
                  <span className="session-arrow">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={!hasPrevPage}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={!hasNextPage}
              >
                Next →
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="sessions-summary">
            <p>
              Showing {sessions.length > 0 ? currentPage * SESSIONS_PER_PAGE + 1 : 0} to{' '}
              {Math.min((currentPage + 1) * SESSIONS_PER_PAGE, totalSessions)} of{' '}
              <strong>{totalSessions}</strong> sessions
            </p>
          </div>
        </>
      )}
    </div>
  );
};
