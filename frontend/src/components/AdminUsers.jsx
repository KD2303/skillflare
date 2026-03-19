/**
 * Admin Users Management
 * View, search, ban, suspend, and manage users
 */

import { useState, useEffect } from "react";
import {
  getAdminUsers,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  changeUserRole,
} from "../services/adminService.js";
import { Search, Ban, Shield, AlertCircle } from "lucide-react";
import Loading from "./Loading.jsx";
import Alert from "./Alert.jsx";
import Modal from "./Modal.jsx";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [newRole, setNewRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
      };
      if (search) {
        params.search = search;
      }
      const response = await getAdminUsers(page, 20, params);
      setUsers(response.data.users);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    // Validation for role changes
    if (actionType === "role") {
      if (!newRole.trim()) {
        setError("Please select a new role");
        return;
      }
    } else {
      // Validation for other actions (ban, suspend, etc.)
      if (!actionReason.trim()) {
        setError("Please provide a reason");
        return;
      }
    }

    try {
      setActionLoading(true);
      setError(null);

      console.log(
        `Performing action: ${actionType} on user: ${selectedUser._id}`,
      );

      switch (actionType) {
        case "ban":
          await banUser(selectedUser._id, actionReason);
          setError(null);
          break;
        case "unban":
          await unbanUser(selectedUser._id, actionReason);
          setError(null);
          break;
        case "suspend":
          await suspendUser(selectedUser._id, actionReason);
          setError(null);
          break;
        case "unsuspend":
          await unsuspendUser(selectedUser._id, actionReason);
          setError(null);
          break;
        case "role":
          await changeUserRole(selectedUser._id, newRole);
          setError(null);
          break;
        default:
          setError("Unknown action type");
          break;
      }

      // Close modal and refresh data on success
      setShowActionModal(false);
      await fetchUsers();
      // Show success message
      setError(null);
    } catch (err) {
      console.error(`Error performing ${actionType}:`, err);
      const errorMessage =
        err.response?.data?.error || err.message || "Action failed";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setActionReason("");
    setNewRole("");
    setShowActionModal(true);
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) return <span className="badge banned">Banned</span>;
    if (user.isSuspended)
      return <span className="badge suspended">Suspended</span>;
    return <span className="badge active">Active</span>;
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-users">
      {error && <Alert type="error" message={error} />}

      <div className="search-container">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Credit Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{getStatusBadge(user)}</td>
                <td>{user.creditPoints || 0}</td>
                <td>
                  <div className="action-buttons">
                    {!user.isBanned && (
                      <button
                        className="btn-sm btn-danger"
                        onClick={() => openActionModal(user, "ban")}
                        title="Ban user"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                    {user.isBanned && (
                      <button
                        className="btn-sm btn-success"
                        onClick={() => openActionModal(user, "unban")}
                        title="Unban user"
                      >
                        <Shield size={16} />
                      </button>
                    )}
                    {!user.isSuspended && (
                      <button
                        className="btn-sm btn-warning"
                        onClick={() => openActionModal(user, "suspend")}
                        title="Suspend user"
                      >
                        <AlertCircle size={16} />
                      </button>
                    )}
                    {user.isSuspended && (
                      <button
                        className="btn-sm btn-info"
                        onClick={() => openActionModal(user, "unsuspend")}
                        title="Unsuspend user"
                      >
                        <Shield size={16} />
                      </button>
                    )}
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => openActionModal(user, "role")}
                      title="Change role"
                    >
                      <Shield size={16} />
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

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} User`}
        onClose={() => setShowActionModal(false)}
      >
        <div className="modal-body">
          <p>
            User: <strong>{selectedUser?.name}</strong>
          </p>
          <p>
            Email: <strong>{selectedUser?.email}</strong>
          </p>

          {actionType === "role" ? (
            <div className="form-group">
              <label>New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="input"
              >
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason..."
                className="input"
                rows="4"
              ></textarea>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="btn btn-danger"
              onClick={handleAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Confirm"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowActionModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
