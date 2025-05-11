import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import Modal from './Modal';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    getProject,
    updateProject,
    deleteProject,
    addMission,
    deleteMission,
    getMissionProgress
  } = useTaskContext();

  const project = getProject(projectId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMissionModalOpen, setIsAddMissionModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(
    project ? { title: project.title, description: project.description } : { title: '', description: '' }
  );
  const [newMission, setNewMission] = useState({ title: '', description: '', targetDate: '' });

  // Redirect if project not found
  if (!project) {
    return (
      <div className="card">
        <p>プロジェクトが見つかりません。</p>
        <Link to="/">
          <button className="back-button">
            <i className="fas fa-arrow-left"></i> ダッシュボードに戻る
          </button>
        </Link>
      </div>
    );
  }

  const handleEditProject = () => {
    if (editedProject.title.trim()) {
      updateProject(projectId, editedProject);
      setIsEditModalOpen(false);
    }
  };

  const handleAddMission = () => {
    if (newMission.title.trim()) {
      addMission(projectId, newMission);
      setNewMission({ title: '', description: '', targetDate: '' });
      setIsAddMissionModalOpen(false);
    }
  };

  const handleDeleteProject = () => {
    deleteProject(projectId);
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate remaining days
  const getRemainingDays = (targetDate) => {
    if (!targetDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(targetDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div>
      <Link to="/">
        <button className="back-button">
          <i className="fas fa-arrow-left"></i> ダッシュボードに戻る
        </button>
      </Link>

      <div className="header">
        <h1>{project.title}</h1>
        <div>
          <button className="edit" onClick={() => setIsEditModalOpen(true)}>
            <i className="fas fa-edit"></i> 編集
          </button>
          <button className="delete" onClick={handleDeleteProject}>
            <i className="fas fa-trash"></i> 削除
          </button>
        </div>
      </div>

      <div className="card">
        <p>{project.description}</p>
        <p><small>作成日: {formatDate(project.createdAt)}</small></p>
      </div>

      <div className="header">
        <h2>ミッション一覧</h2>
        <button onClick={() => setIsAddMissionModalOpen(true)}>
          <i className="fas fa-plus"></i> 新規ミッション
        </button>
      </div>

      {project.missions.length === 0 ? (
        <div className="card">
          <p>ミッションがありません。新しいミッションを追加してください。</p>
        </div>
      ) : (
        <div className="item-list">
          {project.missions.map((mission) => {
            const progress = getMissionProgress(projectId, mission.id);
            const remainingDays = getRemainingDays(mission.targetDate);

            return (
              <div key={mission.id} className="item">
                <div className="item-header">
                  <h3 className="item-title">{mission.title}</h3>
                  <div className="item-actions">
                    <button
                      className="delete"
                      onClick={() => deleteMission(projectId, mission.id)}
                    >
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

                <p>{mission.description}</p>

                {mission.targetDate && (
                  <p>
                    <small>
                      <i className="fas fa-calendar-alt"></i> 期限: {formatDate(mission.targetDate)}
                      {remainingDays !== null && (
                        <span className={remainingDays < 0 ? 'overdue' : ''}>
                          （{remainingDays >= 0
                            ? `残り${remainingDays}日`
                            : `期限切れ(${Math.abs(remainingDays)}日前)`}）
                        </span>
                      )}
                    </small>
                  </p>
                )}

                <p><small>デイリーミッション数: {mission.dailyMissions.length}</small></p>

                <Link to={`/project/${projectId}/mission/${mission.id}`}>
                  <button style={{ marginTop: '10px' }}>
                    <i className="fas fa-arrow-right"></i> 詳細を見る
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="プロジェクトを編集"
      >
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={editedProject.title}
            onChange={handleChange(setEditedProject)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">説明</label>
          <textarea
            id="description"
            name="description"
            value={editedProject.description}
            onChange={handleChange(setEditedProject)}
          ></textarea>
        </div>

        <button onClick={handleEditProject}>
          <i className="fas fa-save"></i> 保存
        </button>
      </Modal>

      {/* Add Mission Modal */}
      <Modal
        isOpen={isAddMissionModalOpen}
        onClose={() => setIsAddMissionModalOpen(false)}
        title="新規ミッション"
      >
        <div className="form-group">
          <label htmlFor="missionTitle">タイトル</label>
          <input
            type="text"
            id="missionTitle"
            name="title"
            value={newMission.title}
            onChange={handleChange(setNewMission)}
            placeholder="例: 食事制限"
          />
        </div>

        <div className="form-group">
          <label htmlFor="missionDescription">説明</label>
          <textarea
            id="missionDescription"
            name="description"
            value={newMission.description}
            onChange={handleChange(setNewMission)}
            placeholder="例: カロリー摂取を制限して体重を減らす"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="targetDate">目標達成日</label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            value={newMission.targetDate}
            onChange={handleChange(setNewMission)}
          />
        </div>

        <button onClick={handleAddMission}>
          <i className="fas fa-plus"></i> 追加
        </button>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
