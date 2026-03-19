import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import {
  LayoutDashboard,
  Award,
  Star,
  CheckCircle,
  FileText,
  PlusCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  PageLoading,
  TaskCard,
  EmptyState,
  EditTaskModal,
} from "../components";
import { formatNumber } from "../utils/helpers";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState({ posted: [], taken: [] });
  const [activeTab, setActiveTab] = useState("posted");
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 1. Move function definitions to the TOP of the component
  // to ensure they are defined before the JSX (Return) is reached.

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResponse, tasksResponse] = await Promise.all([
        userService.getStats(),
        taskService.getMyTasks(),
      ]);
      setStats(statsResponse.stats);

      setTasks({
        posted: tasksResponse.postedTasks?.tasks || [],
        taken: tasksResponse.takenTasks?.tasks || [],
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setTasks({ posted: [], taken: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => ({
        ...prev,
        posted: prev.posted.filter((t) => t._id !== taskId),
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingTask(null);
    loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <PageLoading />;
  }

  const statCards = [
    {
      title: "Total Points",
      value: formatNumber(stats?.totalPoints || 0),
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Credit Points",
      value: formatNumber(stats?.creditPoints || 0),
      icon: Award,
      color: "text-brand-orange",
      bgColor: "bg-brand-orange/10",
    },
    {
      title: "Tasks Completed",
      value: formatNumber(stats?.tasksCompleted || 0),
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating?.toFixed(1) || "0.0",
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const tabs = [
    { id: "posted", label: "Tasks Posted", count: tasks.posted.length },
    { id: "taken", label: "Tasks Taken", count: tasks.taken.length },
  ];

  return (
    <div className="wrapper py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center space-x-4 mb-3">
          <div className="p-2 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
            <LayoutDashboard className="w-8 h-8 text-brand-orange" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            My <span className="text-gradient">Dashboard</span>
          </h1>
        </div>
        <p className="text-brand-text-secondary text-lg">
          Welcome back,{" "}
          <span className="text-white font-medium">{user?.name}</span>!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="card p-6 border-brand-border/50 hover:border-brand-orange/20 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-2xl ${stat.bgColor} border border-white/5 transition-transform group-hover:scale-110`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link
          to="/post-task"
          className="card p-6 flex items-center justify-between group hover:border-brand-orange/30 bg-gradient-to-br from-brand-card to-brand-surface"
        >
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-brand-orange/10 rounded-2xl group-hover:bg-brand-orange group-hover:text-white text-brand-orange transition-colors">
              <PlusCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-xl text-white mb-1">
                Post a New Task
              </p>
              <p className="text-sm text-brand-text-secondary">
                Create opportunities for others.
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-brand-text-muted group-hover:text-brand-orange" />
        </Link>

        <Link
          to="/browse"
          className="card p-6 flex items-center justify-between group hover:border-blue-500/30 bg-gradient-to-br from-brand-card to-brand-surface"
        >
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500 group-hover:text-white text-blue-400 transition-colors">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-xl text-white mb-1">
                Browse Live Tasks
              </p>
              <p className="text-sm text-brand-text-secondary">
                Find tasks and earn credits.
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-brand-text-muted group-hover:text-blue-400" />
        </Link>
      </div>

      {/* Tasks Section */}
      <div className="card overflow-hidden p-0 border-brand-border/30">
        <div className="bg-brand-surface/30 px-6 border-b border-brand-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-5 font-bold text-xs uppercase tracking-widest relative ${
                  activeTab === tab.id
                    ? "text-brand-orange"
                    : "text-brand-text-muted"
                }`}
              >
                {tab.label}
                <span className="ml-3 px-2 py-0.5 rounded-md text-[10px] bg-brand-border">
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-orange shadow-glow" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === "posted" ? (
            tasks.posted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.posted.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isOwner={true}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tasks posted"
                action={
                  <Link to="/post-task" className="btn-primary">
                    Post Task
                  </Link>
                }
              />
            )
          ) : tasks.taken.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tasks.taken.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tasks taken"
              action={
                <Link to="/browse" className="btn-primary">
                  Browse Tasks
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditTaskModal
          task={editingTask}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
