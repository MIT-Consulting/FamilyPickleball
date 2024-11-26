import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Filter out the specific defaultProps warning from react-beautiful-dnd
const originalConsoleError = console.error;
console.error = function filterWarnings(msg, ...args) {
  if (typeof msg === 'string' && msg.includes('defaultProps')) {
    return;
  }
  originalConsoleError(msg, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 