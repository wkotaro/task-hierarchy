import React, { useEffect, createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';

// ショートカットコンテキスト
export const ShortcutContext = createContext();

// ショートカットフックを提供
export const useShortcuts = () => {
  return useContext(ShortcutContext);
};

export const ShortcutProvider = ({ children }) => {
  const { addProject } = useTaskContext();
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const [shortcutMode, setShortcutMode] = useState(null);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // ログイン・登録画面かどうかを確認
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // 有効なショートカットリスト
  const shortcuts = [
    { key: 'n p', description: '新規プロジェクト作成', path: '/dashboard' },
    { key: 'n m', description: '選択中のプロジェクトに新規ミッション作成', path: '/project/' },
    { key: 'n t', description: '選択中のミッションに新規タスク作成', path: '/project/' },
    { key: '?', description: 'ショートカット一覧を表示', path: '*' },
    { key: 'Esc', description: 'モーダル・ダイアログを閉じる', path: '*' }
  ];

  // グローバルキーボードショートカットを設定
  useEffect(() => {
    // 未ログインまたは認証画面の場合はショートカットを無効化
    if (!currentUser || isAuthPage) {
      return;
    }

    let keysPressed = {};
    let keyTimeout = null;

    const handleKeyDown = (e) => {
      // 入力欄でのショートカットは無効化
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      keysPressed[e.key.toLowerCase()] = true;

      // タイムアウトをリセット（連続キー用）
      clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => {
        keysPressed = {};
      }, 1000);

      // ヘルプ表示
      if (e.key === '?') {
        setShowShortcutHelp(prev => !prev);
        return;
      }

      // モーダル閉じる
      if (e.key === 'Escape') {
        setShowShortcutHelp(false);
        setShortcutMode(null);
        return;
      }

      // 新規プロジェクト (n→p)
      if (keysPressed['n'] && e.key.toLowerCase() === 'p') {
        // ダッシュボード画面でのみ有効
        if (location.pathname === '/dashboard' || location.pathname === '/') {
          e.preventDefault();
          setShortcutMode('project');

          // プロジェクト作成ダイアログを表示など
          // この例ではダイアログは不要でタスクに直接渡すので、外部から呼び出せるようにする
          const projectName = prompt('新しいプロジェクト名を入力してください:');
          if (projectName && projectName.trim()) {
            addProject({ title: projectName.trim() });
          }
          setShortcutMode(null);
        }
      }

      // その他のショートカット...
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimeout);
    };
  }, [location, addProject, currentUser, isAuthPage]);

  // ヘルプ画面のレンダリング
  const renderShortcutHelp = () => {
    if (!showShortcutHelp) return null;

    return (
      <div className="shortcut-help-overlay">
        <div className="shortcut-help-dialog">
          <div className="shortcut-help-header">
            <h3>キーボードショートカット</h3>
            <button onClick={() => setShowShortcutHelp(false)} className="close-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="shortcut-list">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                <span className="shortcut-key">{shortcut.key}</span>
                <span className="shortcut-description">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // コンテキスト値
  const value = {
    shortcutMode,
    showShortcutHelp,
    toggleShortcutHelp: () => setShowShortcutHelp(prev => !prev),
    shortcuts
  };

  return (
    <ShortcutContext.Provider value={value}>
      {children}
      {renderShortcutHelp()}
    </ShortcutContext.Provider>
  );
};

export default ShortcutProvider;
