import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import Modal from './Modal';

const ProjectList = () => {
  const { projects, addProject, deleteProject, getProjectProgress } = useTaskContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const handleAddProject = () => {
    if (newProject.title.trim()) {
      addProject(newProject);
      setNewProject({ title: '', description: '' });
      setIsModalOpen(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <div className="header">
        <h1>プロジェクト一覧</h1>
        <div>
          <Link to="/dashboard">
            <button style={{ marginRight: '10px' }}>
              <i className="fas fa-sitemap"></i> ダッシュボード
            </button>
          </Link>
          <button onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> 新規プロジェクト
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <p>プロジェクトがありません。新しいプロジェクトを追加してください。</p>
        </div>
      ) : (
        <div className="item-list">
          {projects.map((project) => {
            const progress = getProjectProgress(project.id);

            return (
              <div key={project.id} className="item">
                <div className="item-header">
                  <h3 className="item-title">{project.title}</h3>
                  <div className="item-actions">
                    <button className="delete" onClick={() => deleteProject(project.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p>{Math.round(progress)}% 完了</p>

                <p>{project.description}</p>
                <p><small>作成日: {formatDate(project.createdAt)}</small></p>
                <p><small>ミッション数: {project.missions.length}</small></p>

                <Link to={`/project/${project.id}`}>
                  <button style={{ marginTop: '10px' }}>
                    <i className="fas fa-arrow-right"></i> 詳細を見る
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新規プロジェクト"
      >
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={newProject.title}
            onChange={handleChange}
            placeholder="例: 10kgダイエット"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">説明</label>
          <textarea
            id="description"
            name="description"
            value={newProject.description}
            onChange={handleChange}
            placeholder="例: 3ヶ月で10kg減量する"
          ></textarea>
        </div>

        <button onClick={handleAddProject}>
          <i className="fas fa-plus"></i> 追加
        </button>
      </Modal>
    </div>
  );
};

export default ProjectList;
