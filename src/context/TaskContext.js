import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('taskHierarchy');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  useEffect(() => {
    localStorage.setItem('taskHierarchy', JSON.stringify(projects));
  }, [projects]);

  // 毎日の初期化処理（繰り返しタスクのリセット）
  useEffect(() => {
    const checkAndResetRecurringTasks = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let needsUpdate = false;
      const updatedProjects = projects.map(project => {
        const updatedMissions = project.missions.map(mission => {
          const updatedDailyMissions = mission.dailyMissions.map(dailyMission => {
            // 繰り返しタスクで、完了している場合
            if (dailyMission.recurring && dailyMission.completed) {
              const lastCompletedDate = new Date(dailyMission.lastCompletedAt || 0);
              lastCompletedDate.setHours(0, 0, 0, 0);

              // 間隔日数の確認
              const daysSinceCompletion = Math.floor((today - lastCompletedDate) / (1000 * 60 * 60 * 24));

              // 指定した間隔日数が経過していれば、タスクをリセット
              if (daysSinceCompletion >= dailyMission.recurringInterval) {
                needsUpdate = true;
                return {
                  ...dailyMission,
                  completed: false
                };
              }
            }
            return dailyMission;
          });

          return {
            ...mission,
            dailyMissions: updatedDailyMissions
          };
        });

        return {
          ...project,
          missions: updatedMissions
        };
      });

      if (needsUpdate) {
        setProjects(updatedProjects);
      }
    };

    // 初回実行
    checkAndResetRecurringTasks();

    // 毎日午前0時に実行するタイマーを設定
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeToMidnight = tomorrow - now;

    const midnightTimer = setTimeout(() => {
      checkAndResetRecurringTasks();

      // 以降は24時間ごとに実行
      const dailyTimer = setInterval(checkAndResetRecurringTasks, 24 * 60 * 60 * 1000);

      // クリーンアップ用に返す
      return () => clearInterval(dailyTimer);
    }, timeToMidnight);

    // クリーンアップ関数
    return () => clearTimeout(midnightTimer);
  }, [projects]);

  // Project CRUD operations
  const addProject = (project) => {
    const newProject = {
      id: Date.now().toString(),
      title: project.title,
      createdAt: new Date().toISOString(),
      missions: []
    };
    setProjects([...projects, newProject]);
    return newProject.id;
  };

  const updateProject = (projectId, updatedProject) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? { ...project, ...updatedProject }
          : project
      )
    );
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter((project) => project.id !== projectId));
  };

  const getProject = (projectId) => {
    return projects.find((project) => project.id === projectId);
  };

  // Mission CRUD operations
  const addMission = (projectId, mission) => {
    const newMission = {
      id: Date.now().toString(),
      title: mission.title,
      targetDate: mission.targetDate || null,
      createdAt: new Date().toISOString(),
      dailyMissions: []
    };

    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            missions: [...project.missions, newMission]
          };
        }
        return project;
      })
    );

    return newMission.id;
  };

  const updateMission = (projectId, missionId, updatedMission) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          // Find current mission to check if targetDate changed
          const currentMission = project.missions.find(m => m.id === missionId) || {};
          const targetDateChanged = currentMission.targetDate !== updatedMission.targetDate;

          return {
            ...project,
            missions: project.missions.map((mission) => {
              if (mission.id === missionId) {
                const updatedMissionObj = { ...mission, ...updatedMission };

                // If target date changed, update all child daily missions
                if (targetDateChanged) {
                  updatedMissionObj.dailyMissions = mission.dailyMissions.map(dailyMission => ({
                    ...dailyMission,
                    targetDate: updatedMission.targetDate
                  }));
                }

                return updatedMissionObj;
              }
              return mission;
            })
          };
        }
        return project;
      })
    );
  };

  const deleteMission = (projectId, missionId) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            missions: project.missions.filter(
              (mission) => mission.id !== missionId
            )
          };
        }
        return project;
      })
    );
  };

  const getMission = (projectId, missionId) => {
    const project = getProject(projectId);
    if (!project) return null;
    return project.missions.find((mission) => mission.id === missionId);
  };

  // Daily Mission CRUD operations
  const addDailyMission = (projectId, missionId, dailyMission) => {
    // Get the parent mission to inherit its target date
    const parentMission = getMission(projectId, missionId);

    const newDailyMission = {
      id: Date.now().toString(),
      title: dailyMission.title,
      targetDate: parentMission.targetDate, // Inherit target date from parent mission
      completed: false,
      createdAt: new Date().toISOString(),
      // 繰り返し設定を追加
      recurring: dailyMission.recurring || false,
      recurringInterval: dailyMission.recurringInterval || 1,
      completionCount: 0,
      lastCompletedAt: null
    };

    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            missions: project.missions.map((mission) => {
              if (mission.id === missionId) {
                return {
                  ...mission,
                  dailyMissions: [...mission.dailyMissions, newDailyMission]
                };
              }
              return mission;
            })
          };
        }
        return project;
      })
    );
  };

  const updateDailyMission = (
    projectId,
    missionId,
    dailyMissionId,
    updatedDailyMission
  ) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            missions: project.missions.map((mission) => {
              if (mission.id === missionId) {
                return {
                  ...mission,
                  dailyMissions: mission.dailyMissions.map((dailyMission) =>
                    dailyMission.id === dailyMissionId
                      ? { ...dailyMission, ...updatedDailyMission }
                      : dailyMission
                  )
                };
              }
              return mission;
            })
          };
        }
        return project;
      })
    );
  };

  const toggleDailyMission = (projectId, missionId, dailyMissionId) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            missions: project.missions.map((mission) => {
              if (mission.id === missionId) {
                return {
                  ...mission,
                  dailyMissions: mission.dailyMissions.map((dailyMission) => {
                    if (dailyMission.id === dailyMissionId) {
                      // 現在のタスク状態
                      const isCurrentlyCompleted = dailyMission.completed;

                      // 達成に変更する場合は、達成カウントを増やし、達成日時を記録
                      if (!isCurrentlyCompleted) {
                        return {
                          ...dailyMission,
                          completed: true,
                          completionCount: (dailyMission.completionCount || 0) + 1,
                          lastCompletedAt: new Date().toISOString()
                        };
                      } else {
                        // 未達成に戻す場合
                        return {
                          ...dailyMission,
                          completed: false
                        };
                      }
                    }
                    return dailyMission;
                  })
                };
              }
              return mission;
            })
          };
        }
        return project;
      })
    );
  };

  const deleteDailyMission = (projectId, missionId, dailyMissionId) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            missions: project.missions.map((mission) => {
              if (mission.id === missionId) {
                return {
                  ...mission,
                  dailyMissions: mission.dailyMissions.filter(
                    (dailyMission) => dailyMission.id !== dailyMissionId
                  )
                };
              }
              return mission;
            })
          };
        }
        return project;
      })
    );
  };

  // Calculate completion stats
  const getProjectProgress = (projectId) => {
    const project = getProject(projectId);
    if (!project || project.missions.length === 0) return 0;

    let totalDailyMissions = 0;
    let completedDailyMissions = 0;

    project.missions.forEach((mission) => {
      totalDailyMissions += mission.dailyMissions.length;
      completedDailyMissions += mission.dailyMissions.filter(
        (dm) => dm.completed
      ).length;
    });

    return totalDailyMissions === 0
      ? 0
      : (completedDailyMissions / totalDailyMissions) * 100;
  };

  const getMissionProgress = (projectId, missionId) => {
    const mission = getMission(projectId, missionId);
    if (!mission || mission.dailyMissions.length === 0) return 0;

    const completedCount = mission.dailyMissions.filter(
      (dm) => dm.completed
    ).length;
    return (completedCount / mission.dailyMissions.length) * 100;
  };

  return (
    <TaskContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProject,
        addMission,
        updateMission,
        deleteMission,
        getMission,
        addDailyMission,
        updateDailyMission,
        toggleDailyMission,
        deleteDailyMission,
        getProjectProgress,
        getMissionProgress
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
