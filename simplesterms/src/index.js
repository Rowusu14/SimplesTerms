import React from 'react';
import ReactDOM from 'react-dom/client';
import FileReaderComponent from './FileReaderComponent.js';


const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); 
  root.render(
    <React.StrictMode>
      <FileReaderComponent />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found in the DOM!");
}
