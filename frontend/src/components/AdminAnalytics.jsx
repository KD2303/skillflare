/**
 * Admin Analytics Dashboard
 * Displays key metrics and statistics
 */

import { useState, useEffect } from "react";
import { getAnalytics } from "../services/adminService.js";
import { BarChart3, Users, AlertCircle, Zap } from "lucide-react";
import Loading from "./Loading.jsx";
import Alert from "./Alert.jsx";

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-analytics">
      {error && <Alert type="error" message={error} />}

      <div className="analytics-grid">
        {/* Users Section */}
        <div className="analytics-card">
          <div className="card-header">
            <Users size={24} className="card-icon users-icon" />
            <h3>Users</h3>
          </div>
          <div className="card-stats">
            <div className="stat">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{analytics?.users?.total || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Banned</span>
              <span className="stat-value banned">
                {analytics?.users?.banned || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Suspended</span>
              <span className="stat-value suspended">
                {analytics?.users?.suspended || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Mentors</span>
              <span className="stat-value">
                {analytics?.users?.mentors || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Admins</span>
              <span className="stat-value admin">
                {analytics?.users?.admins || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="analytics-card">
          <div className="card-header">
            <BarChart3 size={24} className="card-icon tasks-icon" />
            <h3>Tasks</h3>
          </div>
          <div className="card-stats">
            <div className="stat">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{analytics?.tasks?.total || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value">
                {analytics?.tasks?.completed || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">
                {analytics?.tasks?.total > 0
                  ? (
                      (analytics.tasks.completed / analytics.tasks.total) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="analytics-card">
          <div className="card-header">
            <AlertCircle size={24} className="card-icon reports-icon" />
            <h3>Reports</h3>
          </div>
          <div className="card-stats">
            <div className="stat">
              <span className="stat-label">Total Reports</span>
              <span className="stat-value">
                {analytics?.reports?.total || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Open Reports</span>
              <span className="stat-value pending">
                {analytics?.reports?.open || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Resolution Rate</span>
              <span className="stat-value">
                {analytics?.reports?.total > 0
                  ? (
                      ((analytics.reports.total - analytics.reports.open) /
                        analytics.reports.total) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* AI Section */}
        <div className="analytics-card">
          <div className="card-header">
            <Zap size={24} className="card-icon ai-icon" />
            <h3>AI Interactions</h3>
          </div>
          <div className="card-stats">
            <div className="stat">
              <span className="stat-label">Total Interactions</span>
              <span className="stat-value">
                {analytics?.ai?.totalInteractions || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Flagged</span>
              <span className="stat-value warned">
                {analytics?.ai?.flaggedInteractions || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Safety Rate</span>
              <span className="stat-value">
                {100 - (analytics?.ai?.flagPercentage || 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <button className="refresh-btn" onClick={fetchAnalytics}>
        Refresh Data
      </button>
    </div>
  );
};

export default AdminAnalytics;
