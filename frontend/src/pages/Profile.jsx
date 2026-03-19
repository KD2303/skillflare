import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';
import {
  User,
  Award,
  Star,
  CheckCircle,
  FileText,
  Edit,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { PageLoading, Avatar, TaskCard, StarRating, EmptyState } from '../components';
import { formatDate, formatNumber } from '../utils/helpers';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('completed');

  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = isOwnProfile ? currentUser?._id : id;

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, tasksResponse] = await Promise.all([
        userService.getProfile(profileId),
        taskService.getTasksByUser(profileId, 'taken'),
      ]);
      setUser(profileResponse.user);
      setTasks(tasksResponse.tasks.filter((t) => t.status === 'completed'));
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <div className="page-container">
        <EmptyState
          title="User not found"
          description="The profile you're looking for doesn't exist."
          action={
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="wrapper py-8 animate-fade-in text-white">
      {/* Profile Header */}
      <div className="card bg-brand-surface/40 border-brand-border/50 p-8 md:p-12 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full group-hover:bg-brand-orange/10 transition-colors"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-8 md:space-y-0 md:space-x-12 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <Avatar name={user.name} src={user.avatar} size="xl" className="ring-4 ring-brand-orange/20 shadow-glow" />
            <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white p-2 rounded-xl shadow-glow">
               <Award size={20} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border ${
                      user.role === 'teacher' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                    }`}
                  >
                    {user.role === 'teacher' ? 'Instructor' : 'Field Agent'}
                  </span>
                  <div className="flex items-center space-x-2 text-brand-text-muted text-xs font-bold uppercase tracking-widest">
                    <Calendar size={14} className="text-brand-orange" />
                    <span>Active Since {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <Link to="/profile/edit" className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all text-sm font-black uppercase tracking-widest group">
                  <Edit size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Modify Credentials</span>
                </Link>
              )}
            </div>

            {user.bio && (
              <p className="text-brand-text-secondary text-lg leading-relaxed mb-6 max-w-2xl italic">
                "{user.bio}"
              </p>
            )}

            {/* Skills */}
            {user.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {user.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Portfolio link */}
            {user.portfolio && (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-brand-orange hover:text-orange-400 transition-colors font-bold text-sm"
              >
                <div className="p-2 rounded-lg bg-brand-orange/10">
                   <ExternalLink size={14} />
                </div>
                <span>Sync External Portfolio</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card bg-brand-card/50 border-brand-border/50 p-6 flex flex-col items-center group transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-4 group-hover:shadow-glow transition-all">
             <Award size={24} />
          </div>
          <p className="text-4xl font-black text-white mb-1">
            {formatNumber(user.totalPoints)}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
            Total XP
          </p>
        </div>

        <div className="card bg-brand-card/50 border-brand-border/50 p-6 flex flex-col items-center group transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all">
             <CheckCircle size={24} />
          </div>
          <p className="text-4xl font-black text-white mb-1">
            {formatNumber(user.tasksCompleted)}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
            Missions Clear
          </p>
        </div>

        <div className="card bg-brand-card/50 border-brand-border/50 p-6 flex flex-col items-center group transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all">
             <FileText size={24} />
          </div>
          <p className="text-4xl font-black text-white mb-1">
            {formatNumber(user.tasksPosted)}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
            Orders Issued
          </p>
        </div>

        <div className="card bg-brand-card/50 border-brand-border/50 p-6 flex flex-col items-center group transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all">
             <Star size={24} />
          </div>
          <p className="text-4xl font-black text-white mb-1">
            {user.averageRating?.toFixed(1) || '0.0'}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">
            Avg Performance
          </p>
        </div>
      </div>

      {/* Recent Ratings */}
      {user.ratings?.length > 0 && (
        <div className="card bg-brand-surface/20 border-brand-border/50 p-8 mb-12">
          <h2 className="text-xl font-black text-white mb-8 flex items-center space-x-3">
             <div className="h-2 w-2 bg-brand-orange rounded-full"></div>
             <span className="uppercase tracking-[0.2em] text-sm">Operation Feedback</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.ratings.slice(0, 4).map((rating, index) => (
              <div
                key={index}
                className="bg-brand-dark/50 border border-brand-border/50 p-6 rounded-2xl relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <StarRating rating={rating.rating} readonly size="small" />
                    <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest whitespace-nowrap ml-4">
                      {formatDate(rating.createdAt)}
                    </p>
                  </div>
                  {rating.review && (
                    <p className="text-brand-text-secondary text-sm leading-relaxed italic border-l-2 border-brand-orange/30 pl-4 py-1">
                      "{rating.review}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-black text-white flex items-center space-x-3">
              <div className="h-2 w-2 bg-brand-orange rounded-full"></div>
              <span className="uppercase tracking-[0.2em] text-sm text-gradient">Field Operations ({tasks.length})</span>
           </h2>
        </div>
        
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <div className="card bg-brand-surface/20 border-dashed border-brand-border border-2 p-12 text-center">
            <EmptyState
              title="No Active Records"
              description={
                isOwnProfile
                  ? 'Your mission history is currently blank. Start your first operation today.'
                  : 'This agent has no recorded mission successes yet.'
              }
              action={
                isOwnProfile && (
                  <Link to="/browse" className="btn-primary px-8 py-3 shadow-glow mt-6 inline-block">
                    Search Missions
                  </Link>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
