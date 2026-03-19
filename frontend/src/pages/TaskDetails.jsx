import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  Award,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import {
  PageLoading,
  Avatar,
  Alert,
  Modal,
  StarRating,
  ChatWindow,
  ButtonLoading,
} from '../components';
import {
  getStatusColor,
  getStatusLabel,
  formatDate,
  formatDateTime,
  getDaysUntil,
  isOverdue,
} from '../utils/helpers';
import toast from 'react-hot-toast';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [reviewData, setReviewData] = useState({
    satisfied: true,
    feedback: '',
    rating: 5,
  });
  const [reassignReason, setReassignReason] = useState('');

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTask(id);
      setTask(response.task);
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTask = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to take this task');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      await taskService.takeTask(id);
      toast.success('Task taken successfully!');
      loadTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to take task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitTask = async () => {
    if (!submitContent.trim()) {
      toast.error('Please provide submission details');
      return;
    }

    try {
      setActionLoading(true);
      await taskService.submitTask(id, submitContent);
      toast.success('Work submitted successfully!');
      setShowSubmitModal(false);
      setSubmitContent('');
      loadTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewTask = async () => {
    try {
      setActionLoading(true);
      await taskService.reviewTask(id, reviewData);
      toast.success(
        reviewData.satisfied ? 'Task completed! Credits awarded.' : 'Review submitted'
      );
      setShowReviewModal(false);
      loadTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignTask = async () => {
    try {
      setActionLoading(true);
      await taskService.reassignTask(id, reassignReason);
      toast.success('Task reassigned successfully');
      setShowReassignModal(false);
      setReassignReason('');
      loadTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reassign task');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!task) {
    return (
      <div className="page-container">
        <Alert type="error" message="Task not found" />
        <Link to="/browse" className="btn-primary mt-4">
          Back to Browse
        </Link>
      </div>
    );
  }

  const isTaskPoster = user?._id === task.postedBy?._id;
  const isTaskTaker = user?._id === task.takenBy?._id;
  const canTakeTask =
    isAuthenticated &&
    user?.role === 'student' &&
    !isTaskPoster &&
    (task.status === 'open' || task.status === 'reassigned');
  const canSubmit = isTaskTaker && task.status === 'in_progress';
  const canReview = isTaskPoster && task.status === 'submitted';
  const canReassign =
    isTaskPoster && ['in_progress', 'submitted'].includes(task.status);
  const showChat =
    isAuthenticated &&
    (isTaskPoster || isTaskTaker) &&
    task.chatRoom &&
    ['in_progress', 'submitted', 'completed'].includes(task.status);

  const daysUntil = getDaysUntil(task.deadline);
  const taskOverdue = isOverdue(task.deadline);

  return (
    <div className="wrapper py-8 animate-fade-in text-white">
      {/* Back button */}
      <Link
        to="/browse"
        className="inline-flex items-center space-x-2 text-brand-text-secondary hover:text-brand-orange mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to Browse</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task header */}
          <div className="card bg-brand-surface/40 border-brand-border/50 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-[60px] rounded-full group-hover:bg-brand-orange/10 transition-colors"></div>
            
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <span
                  className={`text-[10px] font-bold uppercase border px-2 py-1 rounded-md ${
                    task.posterRole === 'teacher'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                  }`}
                >
                  {task.posterRole === 'teacher' ? 'Teacher Posted' : 'Student Posted'}
                </span>
                <span className={`text-[10px] font-bold uppercase border px-2 py-1 rounded-md ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>
              {task.creditPoints > 0 && (
                <div className="flex items-center space-x-2 text-brand-orange">
                  <Award size={22} className="shadow-glow" />
                  <span className="font-black text-2xl tracking-tighter">{task.creditPoints} <span className="text-xs uppercase tracking-normal">Credits</span></span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-black text-white mb-6 leading-tight tracking-tight">
              {task.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {task.skills?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-brand-text-secondary hover:border-brand-orange/50 transition-colors">
                  {skill}
                </span>
              ))}
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-brand-text-secondary text-lg leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </div>

          {/* Submission section */}
          {task.submission?.content && (
            <div className="card bg-brand-surface/40 border-brand-border/50 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                   <CheckCircle size={20} />
                </div>
                <span>Work <span className="text-gradient">Submission</span></span>
              </h2>
              <div className="bg-brand-dark/50 border border-brand-border p-6 rounded-2xl mb-4">
                <p className="text-brand-text-secondary whitespace-pre-wrap leading-relaxed">
                  {task.submission.content}
                </p>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
                Submitted on {formatDateTime(task.submission.submittedAt)}
              </p>
            </div>
          )}

          {/* Review section */}
          {task.review?.reviewedAt && (
            <div className="card bg-brand-surface/40 border-brand-border/50 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  task.review.satisfied ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                   {task.review.satisfied ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <span>Task <span className="text-gradient">Review</span></span>
              </h2>
              
              <div className={`p-1 rounded-2xl border ${
                task.review.satisfied ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
              }`}>
                <div className="bg-brand-dark/40 p-6 rounded-xl">
                  <div className="flex items-center space-x-2 mb-4">
                     <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                       task.review.satisfied ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                     }`}>
                        {task.review.satisfied ? 'Satisfied' : 'Revision Required'}
                     </span>
                  </div>
                  {task.review.feedback && (
                    <p className="text-brand-text-secondary leading-relaxed mb-4 italic">
                      "{task.review.feedback}"
                    </p>
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
                    Reviewed on {formatDateTime(task.review.reviewedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat section */}
          {showChat && (
            <div className="card bg-brand-surface/40 border-brand-border/50 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                   <MessageSquare size={20} />
                </div>
                <span>Collaboration <span className="text-gradient">Hub</span></span>
              </h2>
              <div className="rounded-2xl overflow-hidden border border-brand-border bg-brand-dark/50">
                <ChatWindow taskId={task._id} chatRoomId={task.chatRoom?._id || task.chatRoom} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Posted by */}
          <div className="card bg-brand-card/60 border-brand-border/50 p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-4">
              Posted by
            </h3>
            <Link
              to={`/user/${task.postedBy?._id}`}
              className="flex items-center space-x-4 group"
            >
              <Avatar name={task.postedBy?.name} size="large" src={task.postedBy?.avatar} className="ring-2 ring-white/5 group-hover:ring-brand-orange/50 transition-all" />
              <div>
                <p className="font-bold text-white group-hover:text-brand-orange transition-colors">
                  {task.postedBy?.name}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    task.postedBy?.role === 'teacher'
                      ? 'text-blue-400'
                      : 'text-brand-orange'
                  }`}
                >
                  {task.postedBy?.role === 'teacher' ? 'Instructor' : 'Peer Student'}
                </span>
              </div>
            </Link>
          </div>

          {/* Taken by */}
          {task.takenBy && (
            <div className="card bg-brand-card/60 border-brand-border/50 p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-4">
                Working on this
              </h3>
              <Link
                to={`/user/${task.takenBy?._id}`}
                className="flex items-center space-x-4 group"
              >
                <Avatar name={task.takenBy?.name} size="large" src={task.takenBy?.avatar} className="ring-2 ring-white/5 group-hover:ring-brand-orange/50 transition-all" />
                <div>
                  <p className="font-bold text-white group-hover:text-brand-orange transition-colors">
                    {task.takenBy?.name}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">Student</span>
                </div>
              </Link>
            </div>
          )}

          {/* Timeline & Stats Card */}
          <div className="card bg-brand-card/60 border-brand-border/50 p-6 space-y-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-4">
                Deadline
              </h3>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${taskOverdue ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'}`}>
                  <Calendar size={18} />
                </div>
                <div>
                  <p className={`font-bold ${taskOverdue ? 'text-red-500' : 'text-white'}`}>
                    {formatDate(task.deadline)}
                  </p>
                  {!taskOverdue && daysUntil !== null && (
                    <p className="text-xs text-brand-text-muted font-bold">
                      {daysUntil === 0
                        ? 'Due today'
                        : daysUntil === 1
                        ? 'Due tomorrow'
                        : `${daysUntil} days left`}
                    </p>
                  )}
                  {taskOverdue && (
                    <p className="text-xs text-red-500/80 font-bold flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>Expired</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-4">
                Project Created
              </h3>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/5 text-brand-text-muted">
                   <Clock size={18} />
                </div>
                <p className="font-bold text-brand-text-secondary text-sm">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-brand-card p-6 space-y-4 border border-brand-orange/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
            {canTakeTask && (
              <button
                onClick={handleTakeTask}
                disabled={actionLoading}
                className="btn-primary w-full py-4 shadow-glow"
              >
                {actionLoading ? <ButtonLoading /> : 'Accept Mission'}
              </button>
            )}

            {canSubmit && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              >
                Submit Mission
              </button>
            )}

            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-primary w-full py-4 shadow-glow"
              >
                Review Work
              </button>
            )}

            {canReassign && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="w-full py-4 bg-white/5 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest rounded-xl transition-all mt-4 flex items-center justify-center space-x-2"
              >
                <RotateCcw size={14} />
                <span>Reassign Project</span>
              </button>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="btn-primary w-full py-4 shadow-glow block text-center">
                Login to Participate
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Your Work"
        size="large"
      >
        <div className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted mb-2 block">Describe your findings</label>
            <textarea
              value={submitContent}
              onChange={(e) => setSubmitContent(e.target.value)}
              rows={6}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-4 text-white focus:border-brand-orange transition-colors outline-none font-medium"
              placeholder="Provide a detailed summary of your work, links to files, or any final notes..."
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-6 py-3 text-brand-text-muted hover:text-white font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitTask}
              disabled={actionLoading}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
            >
              {actionLoading ? <ButtonLoading /> : 'Complete Submission'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Submission"
        size="large"
      >
        <div className="space-y-8">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted mb-4 block text-center">Current Status</label>
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  setReviewData((prev) => ({ ...prev, satisfied: true }))
                }
                className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center group ${
                  reviewData.satisfied
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-white/5 bg-white/5 text-brand-text-muted'
                }`}
              >
                <CheckCircle className={`mb-2 transition-transform ${reviewData.satisfied ? 'scale-110' : ''}`} size={32} />
                <span className="font-black uppercase tracking-widest text-xs">Mission Clear</span>
              </button>
              <button
                onClick={() =>
                  setReviewData((prev) => ({ ...prev, satisfied: false }))
                }
                className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center group ${
                  !reviewData.satisfied
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-white/5 bg-white/5 text-brand-text-muted'
                }`}
              >
                <XCircle className={`mb-2 transition-transform ${!reviewData.satisfied ? 'scale-110' : ''}`} size={32} />
                <span className="font-black uppercase tracking-widest text-xs">Request Revision</span>
              </button>
            </div>
          </div>

          {reviewData.satisfied && (
            <div className="animate-fade-in">
              <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted mb-4 block text-center">Performance Rating</label>
              <div className="flex justify-center">
                <StarRating
                  rating={reviewData.rating}
                  onRate={(rating) =>
                    setReviewData((prev) => ({ ...prev, rating }))
                  }
                  size="large"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted mb-2 block">Feedback & Notes</label>
            <textarea
              value={reviewData.feedback}
              onChange={(e) =>
                setReviewData((prev) => ({ ...prev, feedback: e.target.value }))
              }
              rows={4}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-4 text-white focus:border-brand-orange transition-colors outline-none font-medium"
              placeholder="Provide constructive feedback for the student..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowReviewModal(false)}
              className="px-6 py-3 text-brand-text-muted hover:text-white font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReviewTask}
              disabled={actionLoading}
              className={`px-8 py-3 font-black uppercase tracking-widest rounded-xl transition-all shadow-glow ${
                reviewData.satisfied ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-brand-orange hover:bg-orange-600 text-white'
              }`}
            >
              {actionLoading ? (
                <ButtonLoading />
              ) : reviewData.satisfied ? (
                'Finalize & Pay'
              ) : (
                'Send Revision'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reassign Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reassign Project"
      >
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-3">
             <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />
             <p className="text-sm text-red-200 leading-relaxed font-medium">
                This will terminate the current partnership and return the mission to the public board.
             </p>
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted mb-2 block">Reason for Termination</label>
            <textarea
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              rows={3}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-4 text-white focus:border-brand-orange transition-colors outline-none font-medium"
              placeholder="Briefly explain why this needs reassignment..."
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowReassignModal(false)}
              className="px-6 py-3 text-brand-text-muted hover:text-white font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReassignTask}
              disabled={actionLoading}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              {actionLoading ? <ButtonLoading /> : 'Confirm Termination'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetails;
