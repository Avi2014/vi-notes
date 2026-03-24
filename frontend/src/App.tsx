import React from 'react';
import './App.css';
import { EditorPage } from './pages/EditorPage';

/**
 * App Component
 * 
 * Root component for the Vi-Notes application.
 * Currently displays the editor page for Feature #1.
 * Will include routing (Feature #2+) and authentication context in later features.
 */
function App() {
  return (
    <div className="app">
      <EditorPage />
    </div>
  );
}

export default App;
