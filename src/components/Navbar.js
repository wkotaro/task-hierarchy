import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useShortcuts } from './ShortcutProvider';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const shortcutsContext = useShortcuts();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleShortcutHelp = () => {
    if (shortcutsContext && shortcutsContext.toggleShortcutHelp) {
      shortcutsContext.toggleShortcutHelp();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">タスク階層管理</Link>
      </div>

      {currentUser && (
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">ダッシュボード</Link>
            </li>
            <li className="nav-item">
              <button
                onClick={handleToggleShortcutHelp}
                className="shortcut-help-btn"
                title="キーボードショートカット一覧"
              >
                <i className="fas fa-keyboard"></i>
              </button>
            </li>
          </ul>

          <div className="navbar-user">
            <span className="user-email">{currentUser.email}</span>
            <button
              className="logout-button"
              onClick={handleLogout}
              aria-label="ログアウト"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
