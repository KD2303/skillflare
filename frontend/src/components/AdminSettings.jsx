/**
 * Admin Settings Management
 * Configure system settings and AI behavior
 */

import { useState, useEffect } from "react";
import {
  getSystemConfig,
  updateSystemConfig,
  updateAISettings,
} from "../services/adminService.js";
import { Save, AlertCircle } from "lucide-react";
import Loading from "./Loading.jsx";
import Alert from "./Alert.jsx";

export const AdminSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSystemConfig();
      setConfig(response.data.config);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch config");
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureFlagChange = (flag, value) => {
    setConfig({
      ...config,
      featureFlags: {
        ...config.featureFlags,
        [flag]: value,
      },
    });
  };

  const handleAISettingChange = (setting, value) => {
    setConfig({
      ...config,
      aiSettings: {
        ...config.aiSettings,
        [setting]: value,
      },
    });
  };

  const handleSystemLimitChange = (limit, value) => {
    setConfig({
      ...config,
      systemLimits: {
        ...config.systemLimits,
        [limit]: value,
      },
    });
  };

  const handleCreditChange = (type, value) => {
    setConfig({
      ...config,
      creditRewardSystem: {
        ...config.creditRewardSystem,
        [type]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await updateSystemConfig({
        featureFlags: config.featureFlags,
        systemLimits: config.systemLimits,
        creditRewardSystem: config.creditRewardSystem,
      });
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAI = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await updateAISettings(config.aiSettings);
      setSuccess("AI settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save AI settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-settings">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === "features" ? "active" : ""}`}
          onClick={() => setActiveTab("features")}
        >
          Feature Flags
        </button>
        <button
          className={`tab ${activeTab === "ai" ? "active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          AI Settings
        </button>
        <button
          className={`tab ${activeTab === "limits" ? "active" : ""}`}
          onClick={() => setActiveTab("limits")}
        >
          System Limits
        </button>
        <button
          className={`tab ${activeTab === "credits" ? "active" : ""}`}
          onClick={() => setActiveTab("credits")}
        >
          Credit System
        </button>
      </div>

      <div className="settings-content">
        {/* Feature Flags */}
        {activeTab === "features" && (
          <div className="settings-section">
            <h3>Feature Flags</h3>
            <div className="settings-grid">
              {Object.entries(config.featureFlags).map(([key, value]) => (
                <div key={key} className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleFeatureFlagChange(key, e.target.checked)
                      }
                    />
                    <span className="setting-label">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} /> {saving ? "Saving..." : "Save Features"}
            </button>
          </div>
        )}

        {/* AI Settings */}
        {activeTab === "ai" && (
          <div className="settings-section">
            <h3>AI Settings</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>Temperature (0 - 2)</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.aiSettings.temperature}
                  onChange={(e) =>
                    handleAISettingChange(
                      "temperature",
                      parseFloat(e.target.value),
                    )
                  }
                  className="input"
                />
                <small>Higher = more creative, Lower = more focused</small>
              </div>

              <div className="form-group">
                <label>Max Tokens</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={config.aiSettings.maxTokens}
                  onChange={(e) =>
                    handleAISettingChange("maxTokens", parseInt(e.target.value))
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>System Prompt</label>
                <textarea
                  value={config.aiSettings.systemPrompt}
                  onChange={(e) =>
                    handleAISettingChange("systemPrompt", e.target.value)
                  }
                  className="input"
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.aiSettings.safeMode}
                    onChange={(e) =>
                      handleAISettingChange("safeMode", e.target.checked)
                    }
                  />
                  <span> Safe Mode (Filter harmful content)</span>
                </label>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSaveAI}
                disabled={saving}
              >
                <Save size={18} /> {saving ? "Saving..." : "Save AI Settings"}
              </button>
            </div>
          </div>
        )}

        {/* System Limits */}
        {activeTab === "limits" && (
          <div className="settings-section">
            <h3>System Limits</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>Max Tasks Per User</label>
                <input
                  type="number"
                  min="1"
                  value={config.systemLimits.maxTasksPerUser}
                  onChange={(e) =>
                    handleSystemLimitChange(
                      "maxTasksPerUser",
                      parseInt(e.target.value),
                    )
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Max Assigned Tasks Per User</label>
                <input
                  type="number"
                  min="1"
                  value={config.systemLimits.maxTasksAssignedPerUser}
                  onChange={(e) =>
                    handleSystemLimitChange(
                      "maxTasksAssignedPerUser",
                      parseInt(e.target.value),
                    )
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Min Credits For Mentor</label>
                <input
                  type="number"
                  min="0"
                  value={config.systemLimits.minCreditsForMentor}
                  onChange={(e) =>
                    handleSystemLimitChange(
                      "minCreditsForMentor",
                      parseInt(e.target.value),
                    )
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.systemLimits.maintenanceMode}
                    onChange={(e) =>
                      handleSystemLimitChange(
                        "maintenanceMode",
                        e.target.checked,
                      )
                    }
                  />
                  <span> Maintenance Mode</span>
                </label>
              </div>

              {config.systemLimits.maintenanceMode && (
                <div className="form-group">
                  <label>Maintenance Message</label>
                  <textarea
                    value={config.systemLimits.maintenanceMessage || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        systemLimits: {
                          ...config.systemLimits,
                          maintenanceMessage: e.target.value,
                        },
                      })
                    }
                    className="input"
                    rows="3"
                  />
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={18} /> {saving ? "Saving..." : "Save Limits"}
              </button>
            </div>
          </div>
        )}

        {/* Credit System */}
        {activeTab === "credits" && (
          <div className="settings-section">
            <h3>Credit Reward System</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>Task Completion Credits</label>
                <input
                  type="number"
                  min="0"
                  value={config.creditRewardSystem.taskCompletion}
                  onChange={(e) =>
                    handleCreditChange(
                      "taskCompletion",
                      parseInt(e.target.value),
                    )
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Task Posting Credits</label>
                <input
                  type="number"
                  min="0"
                  value={config.creditRewardSystem.taskPosting}
                  onChange={(e) =>
                    handleCreditChange("taskPosting", parseInt(e.target.value))
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Mentorship Credits</label>
                <input
                  type="number"
                  min="0"
                  value={config.creditRewardSystem.mentorship}
                  onChange={(e) =>
                    handleCreditChange("mentorship", parseInt(e.target.value))
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Helpful Rating Credits</label>
                <input
                  type="number"
                  min="0"
                  value={config.creditRewardSystem.helpfulRating}
                  onChange={(e) =>
                    handleCreditChange(
                      "helpfulRating",
                      parseInt(e.target.value),
                    )
                  }
                  className="input"
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={18} /> {saving ? "Saving..." : "Save Credits"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
