import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useKeystrokeTracking } from '../../hooks/useKeystrokeTracking';
import { usePasteTracking } from '../../hooks/usePasteTracking';
import './TextEditor.css';

interface TextEditorProps {
  onSave?: (content: string) => void;
}

/**
 * TextEditor Component
 * 
 * A clean, distraction-free text editor for writing content.
 * Features:
 * - Real-time character and word count
 * - Auto-save indicator
 * - Responsive design
 * - No formatting options (clean writing space)
 */
export const TextEditor: React.FC<TextEditorProps> = ({ onSave }) => {
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pasteCount, setPasteCount] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Generate unique session ID for this editing session
  const sessionIdRef = useRef<string>(
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  
  // Initialize keystroke tracking
  const { attachListener } = useKeystrokeTracking(sessionIdRef.current);

  // Initialize paste tracking
  const { attachListener: attachPasteListener } = usePasteTracking(sessionIdRef.current);

  // Calculate word count
  const wordCount = useCallback((text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }, []);

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Handle paste events
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (pastedText.length > 0) {
      setPasteCount(prev => prev + 1);
      console.log(`✅ Paste detected and tracked! Total pastes: ${pasteCount + 1}`);
    }
  }, [pasteCount]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(content);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  // Attach keystroke listener when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      attachListener(textareaRef.current);
    }
  }, [attachListener]);

  // Attach paste listener when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      attachPasteListener(textareaRef.current);
      // Also attach our counter
      textareaRef.current.addEventListener('paste', handlePaste as EventListener);
      
      return () => {
        textareaRef.current?.removeEventListener('paste', handlePaste as EventListener);
      };
    }
  }, [attachPasteListener, handlePaste]);

  const characterCount = content.length;
  const words = wordCount(content);

  return (
    <div className="text-editor">
      <div className="editor-header">
        <h1 className="editor-title">Write Your Thoughts</h1>
        <div className="editor-status">
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isSaving || content.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {lastSaved && (
            <span className="last-saved">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing... This is a distraction-free writing space. Your thoughts are captured safely."
        spellCheck="true"
      />

      <div className="editor-footer">
        <div className="stats">
          <span className="stat-item">
            <span className="stat-label">Words:</span>
            <span className="stat-value">{words}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Characters:</span>
            <span className="stat-value">{characterCount}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Pastes:</span>
            <span className="stat-value" style={{ color: pasteCount > 0 ? '#667eea' : '#999' }}>
              {pasteCount}
            </span>
          </span>
        </div>
        <button 
          className="clear-button"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all content?')) {
              setContent('');
            }
          }}
          disabled={content.length === 0}
        >
          Clear
        </button>
      </div>
    </div>
  );
};
