import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMentors } from '../services/mentorService';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getMentors();
        setMentors(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch mentors');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  if (loading) return <div className="text-center mt-20"><Loading /></div>;
  if (error) return <div className="text-red-500 text-center mt-20 font-medium">{error}</div>;

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mentoring Hub</h1>
            <p className="text-brand-text-secondary">Find a mentor to guide you or become one yourself.</p>
          </div>
          <Link
            to="/mentors/apply"
            className="btn-primary"
          >
            Apply as Mentor
          </Link>
        </div>

        {mentors.length === 0 ? (
          <div className="text-center py-20 bg-brand-surface/30 rounded-2xl border border-brand-border">
            <h3 className="text-xl font-medium text-white mb-2">No mentors found</h3>
            <p className="text-brand-text-secondary">Be the first to join the mentorship program!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor._id} className="card hover:border-brand-orange/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Avatar src={mentor.userId.avatar} alt={mentor.userId.name} size="lg" className="ring-2 ring-brand-border group-hover:ring-brand-orange/50 transition-all" />
                    {mentor.isActive && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-brand-card"></span>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors">{mentor.userId.name}</h2>
                    <div className="flex items-center text-sm text-brand-text-secondary mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{mentor.rating.toFixed(1)} <span className="mx-1">•</span> {mentor.totalSessions} sessions</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-brand-text-secondary text-sm mb-6 line-clamp-3 leading-relaxed">
                  {mentor.bio || "No bio available."}
                </p>
                
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-3">Verified Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.filter(s => s.isVerified).slice(0, 3).map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-surface text-brand-text-primary border border-brand-border/50">
                        {skill.name}
                        <CheckBadgeIcon className="h-3 w-3 ml-1.5 text-mits-green" />
                      </span>
                    ))}
                    {mentor.skills.filter(s => s.isVerified).length === 0 && (
                      <span className="text-xs text-brand-text-muted italic">No verified skills yet</span>
                    )}
                    {mentor.skills.filter(s => s.isVerified).length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-surface text-brand-text-muted border border-brand-border/50">
                        +{mentor.skills.filter(s => s.isVerified).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/mentors/${mentor.userId._id}`}
                  className="w-full btn bg-brand-surface hover:bg-brand-surface/80 text-white border border-brand-border hover:border-brand-orange/30 group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-300"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
