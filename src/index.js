import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import { TaskProvider } from './context/TaskContext';
import './styles.css';

// HashRouterでbasenameは不要なので削除
ReactDOM.render(
  <Router>
    <TaskProvider>
      <App />
    </TaskProvider>
  </Router>,
  document.getElementById('root')
);
