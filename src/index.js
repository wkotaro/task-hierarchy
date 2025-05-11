import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { TaskProvider } from './context/TaskContext';
import './styles.css';

ReactDOM.render(
  <Router>
    <TaskProvider>
      <App />
    </TaskProvider>
  </Router>,
  document.getElementById('root')
);
