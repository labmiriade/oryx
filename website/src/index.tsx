import React from 'react';
import ReactDOM from 'react-dom';
import './styles/color-scheme.css';
import './styles/application.css';
import './styles/mobile.css';
import './styles/override.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
