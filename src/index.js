import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from './ThemeContext'; // Import your custom ThemeProvider

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
