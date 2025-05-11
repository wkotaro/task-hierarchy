import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // ローカルストレージからユーザー情報を取得（ブラウザ更新時の状態維持）
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('users');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    setLoading(false);
  }, []);

  // ユーザー情報の保存
  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // 新規登録処理
  const register = (name, email, password) => {
    // 既存のユーザーかチェック
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    // 新しいユーザーを作成
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // 実際のアプリではハッシュ化する
      createdAt: new Date().toISOString()
    };

    // ユーザーリストに追加
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // ログイン処理を行う
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return newUser;
  };

  // ログイン処理
  const login = (email, password) => {
    // ユーザーを検索
    const user = users.find(user => user.email === email);

    // ユーザーが存在しない、またはパスワードが一致しない場合
    if (!user || user.password !== password) {
      // デモ用の簡易的なユーザー作成（ユーザーが存在しない場合）
      if (users.length === 0) {
        const newUser = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
          password,
          createdAt: new Date().toISOString()
        };

        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);

        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return newUser;
      }

      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    // ログイン成功
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  };

  // ログアウト処理
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    users,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
