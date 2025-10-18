import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';
import './styles/main.scss';
import { AuthProvider } from './context/AuthContext';

/**
 * Application entry point that renders the LumiFlix - mini project 2
 * 
 * This module initializes the LumiFlix - mini project 2 by:
 * - Creating a React root from the DOM element with id 'root'
 * - Wrapping the App component with necessary providers:
 *   - React.StrictMode for development mode checks
 *   - AuthProvider for authentication context
 *   - BrowserRouter for client-side routing
 * - Rendering the complete application tree
 * 
 * @fileoverview Main entry point for LumiFlix - mini project 2
 * @requires React - Core React library
 * @requires react-dom/client - React DOM rendering utilities
 * @requires react-router-dom - React routing components
 * @requires ./pages/App - Main application component
 * @requires ./styles/main.scss - Global application styles
 * @requires ./context/AuthContext - Authentication context provider
 * 
 * @since 1.0.0
 */

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);


