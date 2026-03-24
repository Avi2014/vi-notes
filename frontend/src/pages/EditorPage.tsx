import React from 'react';
import { TextEditor } from '../components/Editor/TextEditor';

/**
 * EditorPage Component
 * 
 * Main page that displays the text editor for writing content.
 * Handles saving content (will be integrated with backend in Feature #2).
 */
export const EditorPage: React.FC = () => {
  const handleSave = async (content: string) => {
    console.log('Saving content:', content);
    
    // TODO: Integrate with backend API in Feature #5
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

  return (
    <div className="editor-page">
      <TextEditor onSave={handleSave} />
    </div>
  );
};
