import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a root for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application inside StrictMode for development warnings
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance with web vitals (optional)
// Learn more: https://bit.ly/CRA-vitals
// To use, pass a function to log results: reportWebVitals(console.log)
// Or send to an analytics endpoint
reportWebVitals();