import { Link } from "react-router-dom";
import { Calendar, User, Award, Clock, Edit, Trash2 } from "lucide-react";
import {
  getStatusColor,
  getStatusLabel,
  formatDate,
  getDaysUntil,
  truncateText,
} from "../utils/helpers";

const TaskCard = ({ task, onEdit, onDelete, isOwner }) => {
  const daysUntil = getDaysUntil(task.deadline);
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const isUrgent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 2;

  const statusStyles = {
    open: "bg-green-500/10 text-green-400 border-green-500/20",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    submitted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    reassigned: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const currentStatusStyle = statusStyles[task.status] || statusStyles.open;

  const handleEditClick = (e) => {
    e.preventDefault();
    if (onEdit) onEdit(task);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    if (onDelete) {
      if (window.confirm("Are you sure you want to delete this task?")) {
        onDelete(task._id);
      }
    }
  };

  const cardContent = (
    <div className="card card-hover h-full flex flex-col group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              task.posterRole === "teacher"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
            }`}
          >
            {task.posterRole}
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${currentStatusStyle}`}
          >
            {getStatusLabel(task.status)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {task.creditPoints > 0 && (
            <div className="flex items-center space-x-1 text-brand-orange font-bold">
              <Award size={16} className="text-brand-orange" />
              <span className="text-sm">{task.creditPoints}</span>
            </div>
          )}
          {isOwner && task.status === "open" && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={handleEditClick}
                  className="p-1.5 rounded-md hover:bg-brand-orange/20 text-brand-orange transition-colors"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors">
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-brand-text-secondary text-sm mb-4 line-clamp-2 flex-grow">
        {task.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {task.skills?.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-2 py-0.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-secondary text-[11px]"
          >
            {skill}
          </span>
        ))}
        {task.skills?.length > 3 && (
          <span className="px-2 py-0.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-secondary text-[11px]">
            +{task.skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-brand-text-muted border-t border-brand-border pt-4 mt-auto">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
            <User size={12} className="text-brand-text-secondary" />
          </div>
          <span className="text-brand-text-secondary font-medium">
            {task.postedBy?.name || "Unknown"}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {isOverdue ? (
            <span className="text-red-500 flex items-center space-x-1 font-medium">
              <Clock size={14} />
              <span>Overdue</span>
            </span>
          ) : isUrgent ? (
            <span className="text-brand-orange flex items-center space-x-1 font-medium">
              <Clock size={14} />
              <span>
                {daysUntil === 0 ? "Due today" : `Due in ${daysUntil}d`}
              </span>
            </span>
          ) : (
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If edit/delete handlers are provided, don't wrap in Link
  if (onEdit || onDelete) {
    return cardContent;
  }

  return <Link to={`/tasks/${task._id}`}>{cardContent}</Link>;
};

export default TaskCard;
