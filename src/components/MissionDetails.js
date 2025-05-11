import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import Modal from './Modal';

const MissionDetails = () => {
  const { projectId, missionId } = useParams();
  const navigate = useNavigate();
  const {
    getProject,
    getMission,
    updateMission,
    deleteMission,
    addDailyMission,
    updateDailyMission,
    toggleDailyMission,
    deleteDailyMission,
    getMissionProgress
  } = useTaskContext();

  const project = getProject(projectId);
  const mission = getMission(projectId, missionId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddingDaily, setIsAddingDaily] = useState(false);
  const [isEditDailyModalOpen, setIsEditDailyModalOpen] = useState(false);
  const [editedMission, setEditedMission] = useState(
    mission ? {
      title: mission.title,
      targetDate: mission.targetDate || ''
    } : {
      title: '',
      targetDate: ''
    }
  );
  const [newDailyMission, setNewDailyMission] = useState({
    title: '',
    recurring: false,
    recurringInterval: 1
  });
  const [selectedDailyMission, setSelectedDailyMission] = useState(null);

  // Redirect if mission not found
  if (!project || !mission) {
    return (
      <div className="card">
        <p>ミッションが見つかりません。</p>
        <Link to="/">
          <button className="back-button">
            <i className="fas fa-arrow-left"></i> ダッシュボードに戻る
          </button>
        </Link>
      </div>
    );
  }

  const handleEditMission = () => {
    if (editedMission.title.trim()) {
      updateMission(projectId, missionId, editedMission);
      setIsEditModalOpen(false);
    }
  };

  const handleAddDailyMission = (e) => {
    e.preventDefault();
    if (newDailyMission.title.trim()) {
      addDailyMission(projectId, missionId, newDailyMission);
      setNewDailyMission({
        title: '',
        recurring: false,
        recurringInterval: 1
      });
      setIsAddingDaily(false);
    }
  };

  const startAddingDaily = () => {
    setIsAddingDaily(true);
  };

  const cancelAddingDaily = () => {
    setNewDailyMission({
      title: '',
      recurring: false,
      recurringInterval: 1
    });
    setIsAddingDaily(false);
  };

  const handleEditDailyMission = () => {
    if (selectedDailyMission && selectedDailyMission.title.trim()) {
      updateDailyMission(
        projectId,
        missionId,
        selectedDailyMission.id,
        {
          title: selectedDailyMission.title,
          recurring: selectedDailyMission.recurring,
          recurringInterval: selectedDailyMission.recurringInterval
        }
      );
      setIsEditDailyModalOpen(false);
    }
  };

  const handleDeleteMission = () => {
    deleteMission(projectId, missionId);
    navigate(`/project/${projectId}`);
  };

  const openEditDailyModal = (dailyMission) => {
    setSelectedDailyMission({
      ...dailyMission,
      recurring: dailyMission.recurring || false,
      recurringInterval: dailyMission.recurringInterval || 1,
      completionCount: dailyMission.completionCount || 0
    });
    setIsEditDailyModalOpen(true);
  };

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const progress = getMissionProgress(projectId, missionId);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
    <div className="mission-detail-page">
      <div className="navigation-buttons">
        <Link to="/">
          <button className="back-button">
            <i className="fas fa-home"></i> ダッシュボードに戻る
          </button>
        </Link>
        <Link to={`/project/${projectId}`}>
          <button className="back-button">
            <i className="fas fa-arrow-left"></i> プロジェクトに戻る
          </button>
        </Link>
      </div>

      <div className="mission-card">
        <div className="mission-card-header">
          <h1>{mission.title}</h1>
          <div>
            <button
              className="tree-btn add-btn"
              onClick={startAddingDaily}
            >
              <i className="fas fa-plus"></i>
            </button>
            <button className="edit" onClick={() => setIsEditModalOpen(true)}>
              <i className="fas fa-edit"></i> 編集
            </button>
            <button className="delete" onClick={handleDeleteMission}>
              <i className="fas fa-trash"></i> 削除
            </button>
          </div>
        </div>

        <div className="mission-details">
          <h3>進捗状況</h3>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <p>{Math.round(progress)}% 完了</p>

          {mission.targetDate && (
            <p className="deadline-info">
              <i className="fas fa-calendar-alt"></i> 目標達成日: {formatDate(mission.targetDate)}
              {getRemainingDays(mission.targetDate) !== null && (
                <span className={getRemainingDays(mission.targetDate) < 0 ? 'overdue' : ''}>
                  （{getRemainingDays(mission.targetDate) >= 0
                    ? `残り${getRemainingDays(mission.targetDate)}日`
                    : `期限切れ(${Math.abs(getRemainingDays(mission.targetDate))}日前)`}）
                </span>
              )}
            </p>
          )}
        </div>

        <div className="mission-daily-list">
          {/* Inline Daily Mission Creation Form */}
          {isAddingDaily && (
            <div className="inline-form daily-mission-form">
              <form onSubmit={handleAddDailyMission}>
                <div className="form-row">
                  <input
                    type="text"
                    name="title"
                    value={newDailyMission.title}
                    onChange={handleChange(setNewDailyMission)}
                    placeholder="デイリーミッション名"
                    autoFocus
                  />
                  <div className="inline-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="recurring"
                        checked={newDailyMission.recurring}
                        onChange={(e) => {
                          setNewDailyMission({
                            ...newDailyMission,
                            recurring: e.target.checked
                          });
                        }}
                      />
                      繰り返し
                    </label>
                  </div>
                  {newDailyMission.recurring && (
                    <input
                      type="number"
                      name="recurringInterval"
                      min="1"
                      value={newDailyMission.recurringInterval}
                      onChange={handleChange(setNewDailyMission)}
                      placeholder="間隔（日）"
                    />
                  )}
                  <div className="inline-form-actions">
                    <button type="submit" className="inline-save-btn">
                      <i className="fas fa-check"></i>
                    </button>
                    <button
                      type="button"
                      className="inline-cancel-btn"
                      onClick={cancelAddingDaily}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {mission.dailyMissions.length === 0 && !isAddingDaily ? (
            <p className="empty-note">デイリーミッションがありません。新しいデイリーミッションを追加してください。</p>
          ) : (
            <div className="daily-missions-container">
              {mission.dailyMissions.map((dailyMission) => (
                <div
                  key={dailyMission.id}
                  className={`flat-daily-mission ${dailyMission.completed ? 'completed' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={dailyMission.completed}
                      onChange={() => toggleDailyMission(projectId, missionId, dailyMission.id)}
                    />
                    <span style={{ marginLeft: '10px' }}>{dailyMission.title}</span>

                    {dailyMission.recurring && (
                      <span className="badge recurring-badge" title={`${dailyMission.recurringInterval}日ごとに繰り返し`}>
                        <i className="fas fa-redo-alt"></i> {dailyMission.recurringInterval}日毎
                      </span>
                    )}

                    {(dailyMission.completionCount > 0) && (
                      <span className="badge completion-badge" title="達成回数">
                        {dailyMission.completionCount}回達成
                      </span>
                    )}
                  </div>

                  <div className="item-actions">
                    <button
                      className="edit"
                      style={{ marginRight: '5px' }}
                      onClick={() => openEditDailyModal(dailyMission)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteDailyMission(projectId, missionId, dailyMission.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Mission Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="ミッションを編集"
      >
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={editedMission.title}
            onChange={handleChange(setEditedMission)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="missionTargetDate">目標達成日</label>
          <input
            type="date"
            id="missionTargetDate"
            name="targetDate"
            value={editedMission.targetDate}
            onChange={handleChange(setEditedMission)}
          />
        </div>

        <button onClick={handleEditMission}>
          <i className="fas fa-save"></i> 保存
        </button>
      </Modal>

      {/* Edit Daily Mission Modal */}
      <Modal
        isOpen={isEditDailyModalOpen}
        onClose={() => setIsEditDailyModalOpen(false)}
        title="デイリーミッションを編集"
      >
        {selectedDailyMission && (
          <>
            <div className="form-group">
              <label htmlFor="editDailyTitle">タイトル</label>
              <input
                type="text"
                id="editDailyTitle"
                name="title"
                value={selectedDailyMission.title}
                onChange={handleChange(setSelectedDailyMission)}
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="editDailyMissionRecurring"
                name="recurring"
                checked={selectedDailyMission.recurring}
                onChange={(e) => {
                  setSelectedDailyMission({
                    ...selectedDailyMission,
                    recurring: e.target.checked
                  });
                }}
              />
              <label htmlFor="editDailyMissionRecurring">繰り返しタスク</label>
            </div>

            {selectedDailyMission.recurring && (
              <div className="form-group">
                <label htmlFor="editDailyMissionRecurringInterval">繰り返し間隔（日数）</label>
                <input
                  type="number"
                  id="editDailyMissionRecurringInterval"
                  name="recurringInterval"
                  min="1"
                  value={selectedDailyMission.recurringInterval}
                  onChange={handleChange(setSelectedDailyMission)}
                />
              </div>
            )}

            {selectedDailyMission.completionCount > 0 && (
              <div className="form-group completion-count">
                <p>
                  <strong>達成回数:</strong> {selectedDailyMission.completionCount}回
                </p>
              </div>
            )}

            <button onClick={handleEditDailyMission}>
              <i className="fas fa-save"></i> 保存
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MissionDetails;
