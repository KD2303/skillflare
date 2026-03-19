import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/taskService";
import { ArrowLeft, PlusCircle, X, Plus, Info } from "lucide-react";
import { ButtonLoading, Alert, DatePicker } from "../components";
import { SKILLS } from "../utils/constants";
import toast from "react-hot-toast";

const PostTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: [],
    creditPoints: 20,
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState("");

  const isTeacher = user?.role === "teacher";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddSkill = (skill) => {
    if (
      skill &&
      !formData.skills.includes(skill) &&
      formData.skills.length < 5
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (formData.skills.length === 0) {
      newErrors.skills = "At least one skill is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    if (
      isTeacher &&
      (formData.creditPoints < 1 || formData.creditPoints > 100)
    ) {
      newErrors.creditPoints = "Credits must be between 1 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const taskData = {
        ...formData,
        creditPoints: isTeacher ? formData.creditPoints : 0,
      };
      const response = await taskService.createTask(taskData);
      toast.success("Task posted successfully!");
      navigate(`/tasks/${response.task._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post task");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="wrapper py-8 animate-fade-in text-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-brand-text-secondary hover:text-brand-orange transition-colors group"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back
            </span>
          </button>

          <h1 className="text-4xl font-black tracking-tight text-white flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shadow-glow">
              <PlusCircle size={28} />
            </div>
            <span>
              Create <span className="text-gradient">Mission</span>
            </span>
          </h1>
          <div className="hidden md:block w-20" />
        </div>

        {/* Info alert for students */}
        {!isTeacher && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-start space-x-4 mb-8">
            <Info className="text-blue-400 mt-1 flex-shrink-0" size={24} />
            <p className="text-brand-text-secondary leading-relaxed">
              As a student, you can post missions for peer collaboration.
              <span className="block mt-1 text-sm font-bold text-blue-400/80 uppercase tracking-widest">
                Note: Student tasks do not award credit points.
              </span>
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="card bg-brand-surface/20 border-brand-border/50 p-8 space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Title */}
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-muted mb-3 block"
              >
                Mission Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full bg-brand-dark border ${errors.title ? "border-red-500" : "border-brand-border"} rounded-xl p-4 text-white focus:border-brand-orange transition-all outline-none font-bold text-lg placeholder:text-brand-text-muted/50`}
                placeholder="e.g., Design a Neural Network Architecture"
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-muted mb-3 block"
              >
                Mission Brief *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`w-full bg-brand-dark border ${errors.description ? "border-red-500" : "border-brand-border"} rounded-xl p-4 text-white focus:border-brand-orange transition-all outline-none font-medium leading-relaxed placeholder:text-brand-text-muted/50`}
                placeholder="Provide details about the task, requirements, and expected deliverables..."
                maxLength={2000}
              />
              <div className="flex justify-between mt-2">
                {errors.description ? (
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
                  {formData.description.length}/2000
                </span>
              </div>
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-muted mb-4 block">
                Required Intel * (max 5)
              </label>

              {/* Current skills */}
              <div className="flex flex-wrap gap-3 mb-4">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 animate-fade-in"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add skill */}
              <div className="flex space-x-3">
                <select
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 bg-brand-dark border border-brand-border rounded-xl p-4 text-white focus:border-brand-orange transition-all outline-none font-bold text-sm"
                  disabled={formData.skills.length >= 5}
                >
                  <option value="" className="bg-brand-dark">
                    Protocol Selection...
                  </option>
                  {SKILLS.filter((s) => !formData.skills.includes(s)).map(
                    (skill) => (
                      <option
                        key={skill}
                        value={skill}
                        className="bg-brand-dark"
                      >
                        {skill}
                      </option>
                    ),
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkill)}
                  disabled={!newSkill || formData.skills.length >= 5}
                  className="w-14 h-14 bg-white/5 border border-brand-border/50 text-white rounded-xl flex items-center justify-center hover:bg-brand-orange hover:border-brand-orange transition-all disabled:opacity-30"
                >
                  <Plus size={24} />
                </button>
              </div>
              {errors.skills && (
                <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                  {errors.skills}
                </p>
              )}
            </div>

            {/* Credit Points (Teachers only) */}
            {isTeacher && (
              <div>
                <label
                  htmlFor="creditPoints"
                  className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-muted mb-3 block"
                >
                  Reward Points *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="creditPoints"
                    name="creditPoints"
                    value={formData.creditPoints}
                    onChange={handleChange}
                    min={1}
                    max={100}
                    className={`w-full bg-brand-dark border ${errors.creditPoints ? "border-red-500" : "border-brand-border"} rounded-xl p-4 pl-12 text-white focus:border-brand-orange transition-all outline-none font-black text-xl`}
                  />
                  <Award
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange shadow-glow"
                  />
                </div>
                <div className="mt-2 flex items-center space-x-2 opacity-60">
                  <Info size={12} className="text-brand-orange" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                    Credits awarded upon mission success
                  </span>
                </div>
                {errors.creditPoints && (
                  <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                    {errors.creditPoints}
                  </p>
                )}
              </div>
            )}

            {/* Deadline */}
            <div className={isTeacher ? "" : "md:col-span-2"}>
              <label
                htmlFor="deadline"
                className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-muted mb-3 block"
              >
                Mission Deadline *
              </label>
              <DatePicker
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                minDate={getMinDate()}
                error={!!errors.deadline}
                placeholder="DD-MM-YYYY"
              />
              {errors.deadline && (
                <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                  {errors.deadline}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-orange/5 group-hover:bg-brand-orange/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xs font-black text-brand-orange uppercase tracking-[.25em] mb-4">
                  Mission Parameters
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-brand-orange"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
                      Protocol:
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-brand-orange"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
                      Reward:
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {isTeacher ? formData.creditPoints : 0} PTS
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-brand-orange"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
                      Specialization:
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {formData.skills.length} TAGS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 text-brand-text-muted hover:text-white font-bold transition-colors"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-10 py-3 shadow-glow"
                >
                  {loading ? (
                    <ButtonLoading />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <PlusCircle size={18} />
                      <span>Deploy Mission</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostTask;
