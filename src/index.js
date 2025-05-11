import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import { TaskProvider } from './context/TaskContext';
import './styles.css';

// 現在の環境に基づいてベースURLを設定
const basename = process.env.PUBLIC_URL || '/';

ReactDOM.render(
  <Router basename={basename}>
    <TaskProvider>
      <App />
    </TaskProvider>
  </Router>,
  document.getElementById('root')
);
