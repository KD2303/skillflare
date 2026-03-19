/**
 * Admin Reports Management
 * View and take action on user reports
 */

import { useState, useEffect } from "react";
import { getAdminReports, takeReportAction } from "../services/adminService.js";
import { AlertCircle, Check } from "lucide-react";
import Loading from "./Loading.jsx";
import Alert from "./Alert.jsx";
import Modal from "./Modal.jsx";

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("open");
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = statusFilter ? { status: statusFilter } : {};
      const response = await getAdminReports(page, 20, filters);
      setReports(response.data.reports);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (report) => {
    setSelectedReport(report);
    setActionType("");
    setActionNotes("");
    setShowActionModal(true);
  };

  const handleTakeAction = async () => {
    if (!actionType || !actionNotes.trim()) {
      setError("Please select an action and provide notes");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await takeReportAction(selectedReport._id, actionType, actionNotes);
      setShowActionModal(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to take action");
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      low: "secondary",
      medium: "info",
      high: "warning",
      critical: "danger",
    };
    return (
      <span className={`badge ${colors[severity] || "secondary"}`}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: "danger",
      under_review: "warning",
      resolved: "success",
      dismissed: "secondary",
    };
    return (
      <span className={`badge ${colors[status] || "secondary"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-reports">
      {error && <Alert type="error" message={error} />}

      <div className="filter-bar">
        <label>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input"
        >
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reason</th>
              <th>Reported By</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>
                  <span className="badge-secondary">{report.type}</span>
                </td>
                <td className="reason">{report.reason}</td>
                <td>{report.reportedBy?.name || "Unknown"}</td>
                <td>{getSeverityBadge(report.severity)}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                  {report.status !== "resolved" && (
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => openActionModal(report)}
                    >
                      <Check size={16} /> Take Action
                    </button>
                  )}
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
      {showActionModal && (
        <Modal
          title="Take Report Action"
          onClose={() => setShowActionModal(false)}
        >
          <div className="modal-body">
            <div className="report-details">
              <p>
                <strong>Type:</strong> {selectedReport?.type}
              </p>
              <p>
                <strong>Reason:</strong> {selectedReport?.reason}
              </p>
              <p>
                <strong>Severity:</strong> {selectedReport?.severity}
              </p>
            </div>

            <div className="form-group">
              <label>Action</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="input"
              >
                <option value="">Select an action</option>
                <option value="ignore">Ignore Report</option>
                <option value="warning">Issue Warning</option>
                <option value="suspend">Suspend User</option>
                <option value="ban">Ban User</option>
                <option value="delete">Delete Content</option>
              </select>
            </div>

            <div className="form-group">
              <label>Action Notes</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter notes about the action taken..."
                className="input"
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleTakeAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Take Action"}
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
      )}
    </div>
  );
};

export default AdminReports;
