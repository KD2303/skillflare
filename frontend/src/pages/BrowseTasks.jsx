import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { taskService } from '../services/taskService';
import { TaskCard, PageLoading, EmptyState } from '../components';
import { SKILLS } from '../utils/constants';

const BrowseTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    posterRole: '',
    skill: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    loadTasks();
  }, [filters, pagination.page]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      };
      const response = await taskService.getTasks(params);
      setTasks(response.tasks);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.totalPages,
        total: response.total,
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      posterRole: '',
      skill: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="wrapper py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Browse <span className="text-gradient">Tasks</span>
          </h1>
          <p className="text-brand-text-secondary max-w-lg">
            Explore and contribute to various project tasks across the campus. Filter by skill, role, or status to find your next challenge.
          </p>
        </div>
        <div className="text-brand-text-muted text-sm font-medium">
          Showing {tasks.length} of {pagination.total} available tasks
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-text-muted group-focus-within:text-brand-orange transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, description or skills..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-12 h-12"
            />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary h-12 px-6 flex items-center space-x-3 ${
              showFilters ? 'border-brand-orange/50 bg-brand-orange/5' : ''
            }`}
          >
            <Filter size={18} className={hasActiveFilters ? 'text-brand-orange' : ''} />
            <span className="font-semibold text-sm">Filters</span>
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white shadow-glow">
                {Object.values(filters).filter((v) => v !== '').length}
              </span>
            )}
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="card border-brand-orange/10 bg-brand-card/30 p-6 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Status filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted ml-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input h-11 bg-brand-dark/50"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Poster role filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted ml-1">Posted By</label>
                <select
                  value={filters.posterRole}
                  onChange={(e) => handleFilterChange('posterRole', e.target.value)}
                  className="input h-11 bg-brand-dark/50"
                >
                  <option value="">Everyone</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                </select>
              </div>

              {/* Skill filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted ml-1">Necessary Skill</label>
                <select
                  value={filters.skill}
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                  className="input h-11 bg-brand-dark/50"
                >
                  <option value="">All Skills</option>
                  {SKILLS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-6 flex justify-end pt-4 border-t border-brand-border/50">
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-orange flex items-center space-x-2 transition-colors"
                >
                  <X size={14} />
                  <span>Clear all filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card h-64 animate-pulse bg-brand-card/20 border-brand-border/20"></div>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-6">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="btn-secondary px-6 h-11 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1 font-medium">
                <span className="text-brand-orange">{pagination.page}</span>
                <span className="text-brand-text-muted">/</span>
                <span className="text-brand-text-primary">{pagination.totalPages}</span>
              </div>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary px-6 h-11 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20">
          <EmptyState
            title="No tasks found"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters or search terms to find more results.'
                : 'Be the first one to post a task and kickstart a new project!'
            }
            action={
              <Link to="/post-task" className="btn-primary">
                Post a Task
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
};

export default BrowseTasks;
