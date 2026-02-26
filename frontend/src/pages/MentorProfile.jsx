import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMentorById, requestSession } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import { StarIcon, CheckBadgeIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [sessionData, setSessionData] = useState({
    skill: '',
    message: '',
    sessionDate: '',
    creditsUsed: 10, // Default credits
  });

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await getMentorById(id);
        setMentor(data);
        if (data.skills.length > 0) {
          setSessionData(prev => ({ ...prev, skill: data.skills[0].name }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch mentor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [id]);

  const handleRequestSession = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setRequesting(true);
    try {
      await requestSession({
        mentorId: mentor.userId._id,
        ...sessionData,
      });
      alert('Session requested successfully!');
      navigate('/mentors/my-requests');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request session');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="text-center mt-20"><Loading /></div>;
  if (error) return <div className="text-red-500 text-center mt-20 font-medium">{error}</div>;
  if (!mentor) return <div className="text-center mt-20 text-white">Mentor not found</div>;

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar src={mentor.userId.avatar} alt={mentor.userId.name} size="xl" className="ring-4 ring-brand-surface" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{mentor.userId.name}</h1>
              <p className="text-brand-text-secondary mb-4">Mentor Profile</p>
              
              <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-brand-text-secondary">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400 mr-1.5" />
                  <span className="font-semibold text-white">{mentor.rating.toFixed(1)}</span>
                  <span className="ml-1">Rating</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-white">{mentor.totalSessions}</span>
                  <span className="ml-1">Sessions Completed</span>
                </div>
              </div>
            </div>
            {mentor.isActive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                active now
              </span>
            )}
          </div>

          <div className="mt-8 border-t border-brand-border pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-4">About</h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-brand-text-secondary leading-relaxed">{mentor.bio}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-brand-border grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-4">Skills</h3>
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-3">
                  {mentor.skills.map((skill, index) => (
                    <div key={index} className={`flex items-center px-3 py-1.5 rounded-lg border ${skill.isVerified ? 'bg-brand-surface border-brand-orange/30' : 'bg-brand-surface border-brand-border'}`}>
                      <span className="text-sm text-white">{skill.name}</span>
                      {skill.isVerified && (
                        <CheckBadgeIcon className="h-4 w-4 ml-2 text-mits-green" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {user && user._id !== mentor.userId._id && (
          <div className="card">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Request a Session</h3>
                <p className="text-brand-text-secondary mt-1">Book a mentoring session with {mentor.userId.name}</p>
              </div>
              <div className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-lg bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                <span className="font-bold mr-1">{sessionData.creditsUsed}</span> Credits required
              </div>
            </div>
            
            <form onSubmit={handleRequestSession} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="skill" className="block text-sm font-medium text-brand-text-secondary mb-2">Select Skill</label>
                  <select
                    id="skill"
                    name="skill"
                    className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange"
                    value={sessionData.skill}
                    onChange={(e) => setSessionData({ ...sessionData, skill: e.target.value })}
                    required
                  >
                    {mentor.skills.map((skill, index) => (
                      <option key={index} value={skill.name} className="bg-brand-surface text-white">{skill.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sessionDate" className="block text-sm font-medium text-brand-text-secondary mb-2">Preferred Date & Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-brand-text-muted" aria-hidden="true" />
                    </div>
                    <input
                      type="datetime-local"
                      name="sessionDate"
                      id="sessionDate"
                      className="input pl-10 w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange [color-scheme:dark]"
                      value={sessionData.sessionDate}
                      onChange={(e) => setSessionData({ ...sessionData, sessionDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-text-secondary mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange"
                  placeholder="What do you want to learn? Share any specific topics or questions."
                  value={sessionData.message}
                  onChange={(e) => setSessionData({ ...sessionData, message: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={requesting}
                  className="btn-primary"
                >
                  {requesting ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorProfile;
