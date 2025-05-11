import React, { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import Modal from './Modal';
import SocialShare from './SocialShare';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);

  // ログインしていない場合はログイン画面にリダイレクト
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addMission,
    updateMission,
    deleteMission,
    addDailyMission,
    updateDailyMission,
    deleteDailyMission,
    toggleDailyMission
  } = useTaskContext();

  const [expandedProjects, setExpandedProjects] = useState({});

  // State for inline editing
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingMission, setIsAddingMission] = useState({});
  const [isAddingDailyMission, setIsAddingDailyMission] = useState({});

  // We'll still keep edit modals
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isEditMissionModalOpen, setIsEditMissionModalOpen] = useState(false);
  const [isEditDailyMissionModalOpen, setIsEditDailyMissionModalOpen] = useState(false);

  // State for form data
  const [newProject, setNewProject] = useState({ title: '' });
  const [selectedProject, setSelectedProject] = useState(null);
  const [newMission, setNewMission] = useState({ title: '', targetDate: '' });
  const [selectedMission, setSelectedMission] = useState(null);
  const [newDailyMission, setNewDailyMission] = useState({
    title: '',
    recurring: false,
    recurringInterval: 1
  });
  const [selectedDailyMission, setSelectedDailyMission] = useState(null);

  // SNS共有用のステート
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showProjectSharePanel, setShowProjectSharePanel] = useState({});
  const [shareData, setShareData] = useState({
    title: `${currentUser.name}のタスク管理`,
    description: '私のタスク進捗状況を確認してください！',
    projectTitle: null
  });

  // Toggle expand/collapse for projects
  const toggleProjectExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Handle form changes
  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  // Project handlers
  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProject.title.trim()) {
      addProject(newProject);
      setNewProject({ title: '' });
      setIsAddingProject(false);
    }
  };

  const startAddingProject = () => {
    setIsAddingProject(true);
  };

  const cancelAddingProject = () => {
    setNewProject({ title: '' });
    setIsAddingProject(false);
  };

  const openEditProjectModal = (project, e) => {
    e.stopPropagation();
    setSelectedProject({
      id: project.id,
      title: project.title
    });
    setIsEditProjectModalOpen(true);
  };

  const handleEditProject = () => {
    if (selectedProject && selectedProject.title.trim()) {
      updateProject(selectedProject.id, {
        title: selectedProject.title
      });
      setIsEditProjectModalOpen(false);
    }
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('このプロジェクトを本当に削除しますか？')) {
      deleteProject(projectId);
    }
  };

  // Mission handlers
  const startAddingMission = (projectId, e) => {
    e.stopPropagation();
    setIsAddingMission({ ...isAddingMission, [projectId]: true });
    setNewMission({ title: '', targetDate: '' });
  };

  const cancelAddingMission = (projectId, e) => {
    e.stopPropagation();
    setIsAddingMission({ ...isAddingMission, [projectId]: false });
    setNewMission({ title: '', targetDate: '' });
  };

  const handleAddMission = (projectId, e) => {
    e.preventDefault();
    if (newMission.title.trim()) {
      addMission(projectId, newMission);
      setNewMission({ title: '', targetDate: '' });
      setIsAddingMission({ ...isAddingMission, [projectId]: false });
      // Also expand the project to show the new mission
      setExpandedProjects({ ...expandedProjects, [projectId]: true });
    }
  };

  const openEditMissionModal = (projectId, mission, e) => {
    e.stopPropagation();
    setSelectedProject({ id: projectId });
    setSelectedMission({
      id: mission.id,
      title: mission.title,
      targetDate: mission.targetDate || ''
    });
    setIsEditMissionModalOpen(true);
  };

  const handleEditMission = () => {
    if (selectedMission && selectedMission.title.trim() && selectedProject) {
      updateMission(selectedProject.id, selectedMission.id, {
        title: selectedMission.title,
        targetDate: selectedMission.targetDate || null
      });
      setIsEditMissionModalOpen(false);
    }
  };

  const handleDeleteMission = (projectId, missionId, e) => {
    e.stopPropagation();
    if (window.confirm('このミッションを本当に削除しますか？')) {
      deleteMission(projectId, missionId);
    }
  };

  // Daily Mission handlers
  const startAddingDailyMission = (projectId, missionId, e) => {
    e.stopPropagation();
    const key = `${projectId}-${missionId}`;
    setIsAddingDailyMission({ ...isAddingDailyMission, [key]: true });
    setNewDailyMission({
      title: '',
      recurring: false,
      recurringInterval: 1
    });
  };

  const cancelAddingDailyMission = (projectId, missionId, e) => {
    e.stopPropagation();
    const key = `${projectId}-${missionId}`;
    setIsAddingDailyMission({ ...isAddingDailyMission, [key]: false });
    setNewDailyMission({
      title: '',
      recurring: false,
      recurringInterval: 1
    });
  };

  const handleAddDailyMission = (projectId, missionId, e) => {
    e.preventDefault();
    if (newDailyMission.title.trim()) {
      addDailyMission(projectId, missionId, newDailyMission);
      setNewDailyMission({
        title: '',
        recurring: false,
        recurringInterval: 1
      });
      const key = `${projectId}-${missionId}`;
      setIsAddingDailyMission({ ...isAddingDailyMission, [key]: false });
    }
  };

  const openEditDailyMissionModal = (projectId, missionId, dailyMission, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedProject({ id: projectId });
    setSelectedMission({ id: missionId });
    setSelectedDailyMission({
      id: dailyMission.id,
      title: dailyMission.title,
      completed: dailyMission.completed,
      recurring: dailyMission.recurring || false,
      recurringInterval: dailyMission.recurringInterval || 1,
      completionCount: dailyMission.completionCount || 0
    });
    setIsEditDailyMissionModalOpen(true);
  };

  const handleEditDailyMission = () => {
    if (selectedDailyMission && selectedDailyMission.title.trim() && selectedProject && selectedMission) {
      updateDailyMission(
        selectedProject.id,
        selectedMission.id,
        selectedDailyMission.id,
        {
          title: selectedDailyMission.title,
          recurring: selectedDailyMission.recurring,
          recurringInterval: selectedDailyMission.recurringInterval
        }
      );
      setIsEditDailyMissionModalOpen(false);
    }
  };

  const handleDeleteDailyMission = (projectId, missionId, dailyMissionId, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('このデイリーミッションを本当に削除しますか？')) {
      deleteDailyMission(projectId, missionId, dailyMissionId);
    }
  };

  // 全体の進捗共有パネルを開く
  const toggleSharePanel = () => {
    setShowSharePanel(!showSharePanel);

    // 共有データを更新
    const completedTasks = projects.reduce((acc, project) => {
      project.missions.forEach(mission => {
        acc += mission.dailyMissions.filter(dm => dm.completed).length;
      });
      return acc;
    }, 0);

    const totalTasks = projects.reduce((acc, project) => {
      project.missions.forEach(mission => {
        acc += mission.dailyMissions.length;
      });
      return acc;
    }, 0);

    setShareData({
      title: `${currentUser.name}のタスク管理: ${completedTasks}/${totalTasks}タスク完了`,
      description: `私は${completedTasks}個のタスクを完了しました！（全${totalTasks}個中）`,
      projectTitle: null
    });
  };

  // プロジェクトごとの進捗共有パネルを開く
  const toggleProjectSharePanel = (project) => {
    // 他のプロジェクトの共有パネルをすべて閉じる
    const newState = {};
    projects.forEach(p => {
      newState[p.id] = p.id === project.id ? !showProjectSharePanel[p.id] : false;
    });
    setShowProjectSharePanel(newState);

    if (!showProjectSharePanel[project.id]) {
      // プロジェクト内のタスク完了状況を計算
      let completedTasks = 0;
      let totalTasks = 0;

      project.missions.forEach(mission => {
        completedTasks += mission.dailyMissions.filter(dm => dm.completed).length;
        totalTasks += mission.dailyMissions.length;
      });

      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setShareData({
        title: `${project.title}の進捗: ${percentage}%完了`,
        description: `${project.title}で${completedTasks}個のタスクを完了しました！（全${totalTasks}個中）`,
        projectTitle: project.title
      });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>ダッシュボード</h1>
        <div className="user-controls">
          <span className="user-greeting">こんにちは、{currentUser.name}さん</span>
          <button className="share-tasks-btn" onClick={toggleSharePanel}>
            <i className="fas fa-share-alt"></i> 全体の進捗を共有
          </button>
        </div>
      </div>

      {showSharePanel && (
        <div className="share-panel">
          <SocialShare title={shareData.title} description={shareData.description} />
          <button className="close-share-btn" onClick={toggleSharePanel}>閉じる</button>
        </div>
      )}

      <div className="project-button-container">
        <button onClick={startAddingProject}>
          <i className="fas fa-plus"></i> 新規プロジェクト
        </button>
      </div>

      <div className="card">
        <h2>プロジェクト</h2>

        {/* Inline Project Creation Form */}
        {isAddingProject && (
          <div className="inline-form project-form">
            <form onSubmit={handleAddProject}>
              <div className="form-row">
                <input
                  type="text"
                  name="title"
                  value={newProject.title}
                  onChange={handleChange(setNewProject)}
                  placeholder="プロジェクト名"
                  autoFocus
                />
                <div className="inline-form-actions">
                  <button type="submit" className="inline-save-btn">
                    <i className="fas fa-check"></i>
                  </button>
                  <button type="button" className="inline-cancel-btn" onClick={cancelAddingProject}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 && !isAddingProject ? (
          <p>プロジェクトがありません。新しいプロジェクトを追加してください。</p>
        ) : (
          <div className="hierarchy-tree">
            {projects.map(project => (
              <div key={project.id} className="tree-item project-item">
                <div
                  className="tree-header"
                  onClick={() => toggleProjectExpand(project.id)}
                >
                  <div className="tree-title">
                    <i className={`fas fa-chevron-${expandedProjects[project.id] ? 'down' : 'right'}`}></i>
                    <span className="project-name">{project.title}</span>
                  </div>
                  <div className="tree-actions">
                    <button
                      className="tree-btn share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProjectSharePanel(project);
                      }}
                    >
                      <i className="fas fa-share-alt"></i>
                    </button>
                    <button className="tree-btn add-btn" onClick={(e) => startAddingMission(project.id, e)}>
                      <i className="fas fa-plus"></i>
                    </button>
                    <button className="tree-btn edit-btn" onClick={(e) => openEditProjectModal(project, e)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="tree-btn delete-btn" onClick={(e) => handleDeleteProject(project.id, e)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Project share panel */}
                {showProjectSharePanel[project.id] && (
                  <div className="project-share-panel">
                    <SocialShare
                      title={shareData.title}
                      description={shareData.description}
                      projectTitle={shareData.projectTitle}
                    />
                    <button
                      className="close-share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProjectSharePanel(project);
                      }}
                    >
                      閉じる
                    </button>
                  </div>
                )}

                {expandedProjects[project.id] && (
                  <>
                    {/* Inline Mission Creation Form */}
                    {isAddingMission[project.id] && (
                      <div className="inline-form mission-form">
                        <form onSubmit={(e) => handleAddMission(project.id, e)}>
                          <div className="form-row">
                            <input
                              type="text"
                              name="title"
                              value={newMission.title}
                              onChange={handleChange(setNewMission)}
                              placeholder="ミッション名"
                              autoFocus
                            />
                            <input
                              type="date"
                              name="targetDate"
                              value={newMission.targetDate}
                              onChange={handleChange(setNewMission)}
                              placeholder="目標日"
                            />
                            <div className="inline-form-actions">
                              <button type="submit" className="inline-save-btn">
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                type="button"
                                className="inline-cancel-btn"
                                onClick={(e) => cancelAddingMission(project.id, e)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {project.missions.length === 0 && !isAddingMission[project.id] ? (
                      <p className="empty-note">ミッションがありません</p>
                    ) : (
                      <div className="mission-grid">
                        {project.missions.map(mission => (
                          <div key={mission.id} className="mission-card">
                            <div className="mission-card-header">
                              <h3 className="mission-card-title">{mission.title}</h3>
                              <div className="item-actions">
                                <button
                                  className="tree-btn add-btn"
                                  onClick={(e) => startAddingDailyMission(project.id, mission.id, e)}
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                                <button
                                  className="tree-btn edit-btn"
                                  onClick={(e) => openEditMissionModal(project.id, mission, e)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="tree-btn delete-btn"
                                  onClick={(e) => handleDeleteMission(project.id, mission.id, e)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>

                            {mission.targetDate && (
                              <div className="deadline-info">
                                <i className="fas fa-calendar-alt"></i>
                                <span>{formatDate(mission.targetDate)}</span>
                                {getRemainingDays(mission.targetDate) !== null && (
                                  <span className={`days-remaining ${getRemainingDays(mission.targetDate) < 0 ? 'overdue' : ''}`}>
                                    {getRemainingDays(mission.targetDate) >= 0
                                      ? `残り${getRemainingDays(mission.targetDate)}日`
                                      : `期限切れ(${Math.abs(getRemainingDays(mission.targetDate))}日前)`}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mission-daily-list">
                              {/* Inline Daily Mission Creation Form */}
                              {isAddingDailyMission[`${project.id}-${mission.id}`] && (
                                <div className="inline-form daily-mission-form">
                                  <form onSubmit={(e) => handleAddDailyMission(project.id, mission.id, e)}>
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
                                          onClick={(e) => cancelAddingDailyMission(project.id, mission.id, e)}
                                        >
                                          <i className="fas fa-times"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                </div>
                              )}

                              {mission.dailyMissions.length === 0 && !isAddingDailyMission[`${project.id}-${mission.id}`] ? (
                                <p className="empty-note">デイリーミッションがありません</p>
                              ) : (
                                mission.dailyMissions.map(dailyMission => (
                                  <div
                                    key={dailyMission.id}
                                    className={`flat-daily-mission ${dailyMission.completed ? 'completed' : ''}`}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <input
                                        type="checkbox"
                                        checked={dailyMission.completed}
                                        onChange={() => toggleDailyMission(project.id, mission.id, dailyMission.id)}
                                        className="checkbox"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span style={{ marginLeft: '10px' }}>{dailyMission.title}</span>
                                      {dailyMission.recurring && (
                                        <span className="badge recurring-badge" title={`${dailyMission.recurringInterval}日ごとに繰り返し`}>
                                          <i className="fas fa-redo-alt"></i>
                                        </span>
                                      )}
                                      {dailyMission.completionCount > 0 && (
                                        <span className="badge completion-badge" title="達成回数">
                                          {dailyMission.completionCount}回達成
                                        </span>
                                      )}
                                    </div>
                                    <div className="tree-actions">
                                      <button
                                        className="tree-btn edit-btn"
                                        onClick={(e) => openEditDailyMissionModal(project.id, mission.id, dailyMission, e)}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button
                                        className="tree-btn delete-btn"
                                        onClick={(e) => handleDeleteDailyMission(project.id, mission.id, dailyMission.id, e)}
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        title="プロジェクトを編集"
      >
        {selectedProject && (
          <>
            <div className="form-group">
              <label htmlFor="editTitle">タイトル</label>
              <input
                type="text"
                id="editTitle"
                name="title"
                value={selectedProject.title}
                onChange={handleChange(setSelectedProject)}
              />
            </div>

            <button onClick={handleEditProject}>
              <i className="fas fa-save"></i> 保存
            </button>
          </>
        )}
      </Modal>

      {/* Edit Mission Modal */}
      <Modal
        isOpen={isEditMissionModalOpen}
        onClose={() => setIsEditMissionModalOpen(false)}
        title="ミッションを編集"
      >
        {selectedMission && (
          <>
            <div className="form-group">
              <label htmlFor="editMissionTitle">タイトル</label>
              <input
                type="text"
                id="editMissionTitle"
                name="title"
                value={selectedMission.title}
                onChange={handleChange(setSelectedMission)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="editMissionTargetDate">目標達成日</label>
              <input
                type="date"
                id="editMissionTargetDate"
                name="targetDate"
                value={selectedMission.targetDate}
                onChange={handleChange(setSelectedMission)}
              />
            </div>

            <button onClick={handleEditMission}>
              <i className="fas fa-save"></i> 保存
            </button>
          </>
        )}
      </Modal>

      {/* Edit Daily Mission Modal */}
      <Modal
        isOpen={isEditDailyMissionModalOpen}
        onClose={() => setIsEditDailyMissionModalOpen(false)}
        title="デイリーミッションを編集"
      >
        {selectedDailyMission && (
          <>
            <div className="form-group">
              <label htmlFor="editDailyMissionTitle">タイトル</label>
              <input
                type="text"
                id="editDailyMissionTitle"
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

export default Dashboard;
