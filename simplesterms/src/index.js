import React from 'react';
import ReactDOM from 'react-dom/client';  // In React 18, we use createRoot
import App from './App.js'
import FileReaderComponent from './FileReaderComponent.js';


const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);  // React 18+ uses createRoot
  root.render(
    <React.StrictMode>
      <FileReaderComponent />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found in the DOM!");
}
