import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TextEditor } from '../components/Editor/TextEditor';
import { useAuth } from '../hooks/useAuth';
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
 */
export const EditorPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSave = async (content: string) => {
    console.log('Saving content:', content);
    
    // TODO: Save content to backend in Feature #5
    // For now, just log to console
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Content saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
      throw error;
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
          {user && <span className="user-email">{user.email}</span>}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <TextEditor onSave={handleSave} />
    </div>
  );
};
