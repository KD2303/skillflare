import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { taskService } from "../services/taskService";
import { SKILLS } from "../utils/constants";

const EditTaskModal = ({ task, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: [],
    creditPoints: 20,
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    if (task && isOpen) {
      const deadlineDate = new Date(task.deadline);
      const formattedDeadline = deadlineDate.toISOString().split("T")[0];

      setFormData({
        title: task.title || "",
        description: task.description || "",
        skills: task.skills || [],
        creditPoints: task.creditPoints || 20,
        deadline: formattedDeadline,
      });
      setSelectedSkills(task.skills || []);
      setError("");
    }
  }, [task, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Task description is required");
      return;
    }
    if (selectedSkills.length === 0) {
      setError("Please select at least one skill");
      return;
    }
    if (!formData.deadline) {
      setError("Deadline is required");
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= new Date()) {
      setError("Deadline must be in the future");
      return;
    }

    setLoading(true);
    try {
      await taskService.updateTask(task._id, {
        title: formData.title,
        description: formData.description,
        skills: selectedSkills,
        creditPoints: formData.creditPoints,
        deadline: formData.deadline,
      });

      setError("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-card border border-brand-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border sticky top-0 bg-brand-card">
          <h2 className="text-2xl font-bold text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-surface rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle
                className="text-red-400 flex-shrink-0 mt-0.5"
                size={20}
              />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Task Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed task description"
              rows={6}
              className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Required Skills *
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-brand-orange text-white"
                      : "bg-brand-surface border border-brand-border text-gray-300 hover:border-brand-orange"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Credit Points */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Credit Points
              </label>
              <input
                type="number"
                name="creditPoints"
                value={formData.creditPoints}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white hover:bg-brand-surface rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-orange hover:bg-brand-orange/80 disabled:opacity-50 text-white font-medium rounded-lg transition-all"
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
