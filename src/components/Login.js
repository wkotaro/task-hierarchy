import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 簡易的な検証
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    // デモ用のログイン処理（実際にはサーバー認証を行う）
    try {
      login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('ログインに失敗しました');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>タスク管理アプリにログイン</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
            />
          </div>

          <button type="submit" className="auth-button">ログイン</button>
        </form>

        <div className="auth-link">
          アカウントをお持ちでない方は<Link to="/register">新規登録</Link>してください
        </div>
      </div>
    </div>
  );
};

export default Login;
