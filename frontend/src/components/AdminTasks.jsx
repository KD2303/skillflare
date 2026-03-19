/**
 * Admin Tasks Management
 * View, edit, and delete tasks
 */

import { useState, useEffect } from "react";
import {
  getAdminTasks,
  editTask,
  deleteTask,
} from "../services/adminService.js";
import { Trash2, Edit, Search } from "lucide-react";
import Loading from "./Loading.jsx";
import Alert from "./Alert.jsx";
import Modal from "./Modal.jsx";

export const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteReason, setDeleteReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [page]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminTasks(page, 20);
      setTasks(response.data.tasks);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditData({
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline).toISOString().split("T")[0],
      credit: task.credit,
    });
    setShowEditModal(true);
  };

  const handleEditTask = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await editTask(selectedTask._id, editData);
      setShowEditModal(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to edit task");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const handleDeleteTask = async () => {
    if (!deleteReason.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await deleteTask(selectedTask._id, deleteReason);
      setShowDeleteModal(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (task) => {
    const statusColors = {
      open: "active",
      assigned: "info",
      completed: "success",
      cancelled: "danger",
    };
    return (
      <span className={`badge ${statusColors[task.status] || "secondary"}`}>
        {task.status}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-tasks">
      {error && <Alert type="error" message={error} />}

      <div className="tasks-header">
        <h3>All Tasks</h3>
        <span className="total-count">Total: {tasks.length}</span>
      </div>

      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Posted By</th>
              <th>Status</th>
              <th>Credit</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td className="task-title">{task.title}</td>
                <td>{task.postedBy?.name || "Unknown"}</td>
                <td>{getStatusBadge(task)}</td>
                <td>{task.credit}</td>
                <td>{new Date(task.deadline).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => openEditModal(task)}
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => openDeleteModal(task)}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="btn btn-sm"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="btn btn-sm"
        >
          Next
        </button>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <Modal title="Edit Task" onClose={() => setShowEditModal(false)}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="input"
                rows="4"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={editData.deadline}
                  onChange={(e) =>
                    setEditData({ ...editData, deadline: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Credit</label>
                <input
                  type="number"
                  value={editData.credit}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      credit: parseInt(e.target.value),
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleEditTask}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Task Modal */}
      {showDeleteModal && (
        <Modal title="Delete Task" onClose={() => setShowDeleteModal(false)}>
          <div className="modal-body">
            <p>
              Task: <strong>{selectedTask?.title}</strong>
            </p>
            <div className="form-group">
              <label>Reason for Deletion</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason..."
                className="input"
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={handleDeleteTask}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Task"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminTasks;
