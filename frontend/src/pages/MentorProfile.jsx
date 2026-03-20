import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMentorById, requestSession, updateMentorProfile } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import { SKILLS } from '../utils/constants';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import { StarIcon, CheckBadgeIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import {
  Pencil,
  Save,
  XCircle,
  Plus,
  X,
  ChevronDown,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Globe,
  Code2,
  ExternalLink,
} from 'lucide-react';

const LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
];

const levelBadge = (level) => {
  const l = LEVELS.find(lv => lv.value === level) || LEVELS[0];
  return <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${l.color}`}>{l.label}</span>;
};

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
];

const CODING_PLATFORMS = [
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'hackerrank', label: 'HackerRank' },
  { key: 'codeforces', label: 'Codeforces' },
  { key: 'codechef', label: 'CodeChef' },
  { key: 'gfg', label: 'GeeksForGeeks' },
];

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
    creditsUsed: 10,
  });

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(null);
  const [skillSearch, setSkillSearch] = useState('');

  const isOwner = user && mentor && user._id === mentor.userId._id;

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

  /* ─── Edit helpers ─── */
  const startEditing = () => {
    setEditData({
      bio: mentor.bio || '',
      skills: mentor.skills.map(s => ({ name: s.name, level: s.level || 'beginner' })),
      socialLinks: { linkedin: '', github: '', twitter: '', instagram: '', ...(mentor.socialLinks || {}) },
      codingPlatforms: { leetcode: '', hackerrank: '', codeforces: '', codechef: '', gfg: '', ...(mentor.codingPlatforms || {}) },
      isActive: mentor.isActive,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditData(null);
    setSkillDropdownOpen(null);
  };

  const handleSkillSelect = (index, skillName) => {
    const newSkills = [...editData.skills];
    newSkills[index].name = skillName;
    setEditData({ ...editData, skills: newSkills });
    setSkillDropdownOpen(null);
    setSkillSearch('');
  };

  const handleLevelChange = (index, level) => {
    const newSkills = [...editData.skills];
    newSkills[index].level = level;
    setEditData({ ...editData, skills: newSkills });
  };

  const addSkillField = () => {
    setEditData({ ...editData, skills: [...editData.skills, { name: '', level: 'beginner' }] });
  };

  const removeSkillField = (index) => {
    setEditData({ ...editData, skills: editData.skills.filter((_, i) => i !== index) });
  };

  const selectedSkillNames = editData ? editData.skills.map(s => s.name) : [];
  const getFilteredSkills = () =>
    SKILLS.filter(s => !selectedSkillNames.includes(s) && s.toLowerCase().includes(skillSearch.toLowerCase()));

  const handleSave = async () => {
    const validSkills = editData.skills.filter(s => s.name.trim() !== '');
    if (validSkills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMentorProfile({
        bio: editData.bio,
        skills: validSkills,
        socialLinks: editData.socialLinks,
        codingPlatforms: editData.codingPlatforms,
        isActive: editData.isActive,
      });
      setMentor(updated);
      setEditing(false);
      setEditData(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Session request ─── */
  const handleRequestSession = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You need to be logged in to request a session');
      navigate('/login');
      return;
    }
    if (user._id === mentor.userId._id) {
      toast.error('You cannot request a session with yourself');
      return;
    }
    if (!sessionData.skill || !sessionData.sessionDate || !sessionData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setRequesting(true);
    try {
      await requestSession({ mentorId: mentor.userId._id, ...sessionData });
      toast.success('Session requested successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request session');
    } finally {
      setRequesting(false);
    }
  };

  /* ─── Render helpers ─── */
  const socialEntries = mentor?.socialLinks
    ? Object.entries(mentor.socialLinks).filter(([, v]) => v)
    : [];
  const codingEntries = mentor?.codingPlatforms
    ? Object.entries(mentor.codingPlatforms).filter(([, v]) => v)
    : [];
  const hasPlatforms = socialEntries.length > 0 || codingEntries.length > 0;

  if (loading) return <div className="text-center mt-20"><Loading /></div>;
  if (error) return <div className="text-red-500 text-center mt-20 font-medium bg-red-500/10 max-w-xl mx-auto p-4 rounded-lg border border-red-500/20">{error}</div>;
  if (!mentor) return <div className="text-center mt-20 text-brand-text-secondary bg-brand-surface p-8 max-w-md mx-auto rounded-lg border border-brand-border">Mentor not found</div>;

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fade-in">

        {/* ═══════ PROFILE CARD ═══════ */}
        <div className="card mb-8">
          {/* Header row */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar src={mentor.userId.avatar} alt={mentor.userId.name} size="xl" className="ring-4 ring-brand-surface" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{mentor.userId.name}</h1>
              <p className="text-brand-text-secondary mb-4">Mentor Profile</p>
              <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-brand-text-secondary">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400 mr-1.5" />
                  <span className="font-semibold text-white">{(mentor.rating ?? 0).toFixed(1)}</span>
                  <span className="ml-1">Rating</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-white">{mentor.totalSessions ?? 0}</span>
                  <span className="ml-1">Sessions Completed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {editing ? (
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-brand-text-muted">Active</span>
                  <button
                    type="button"
                    onClick={() => setEditData({ ...editData, isActive: !editData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editData.isActive ? 'bg-mits-green' : 'bg-brand-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
              ) : (
                mentor.isActive && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-mits-green/10 text-mits-green border border-mits-green/20">
                    active now
                  </span>
                )
              )}

              {isOwner && !editing && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/20 transition-colors"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              )}
              {editing && (
                <div className="flex gap-2">
                  <button onClick={cancelEditing} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-brand-text-secondary bg-brand-surface border border-brand-border hover:text-white transition-colors">
                    <XCircle size={14} />
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5">
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── About ─── */}
          <div className="mt-8 border-t border-brand-border pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-4">About</h3>
              </div>
              <div className="md:col-span-2">
                {editing ? (
                  <div>
                    <textarea
                      rows={4}
                      className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-brand-text-muted text-right">{editData.bio.length}/500</p>
                  </div>
                ) : (
                  <p className="text-brand-text-secondary leading-relaxed">{mentor.bio || 'No bio provided.'}</p>
                )}
              </div>
            </div>

            {/* ─── Skills ─── */}
            <div className="mt-8 pt-8 border-t border-brand-border grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-4">Skills</h3>
              </div>
              <div className="md:col-span-2">
                {editing ? (
                  <div className="space-y-3">
                    {editData.skills.map((skill, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-brand-surface/50 border border-brand-border">
                        {/* Skill dropdown */}
                        <div className="relative flex-1">
                          <button
                            type="button"
                            onClick={() => { setSkillDropdownOpen(skillDropdownOpen === index ? null : index); setSkillSearch(''); }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-left text-sm hover:border-brand-orange/40 focus:outline-none focus:ring-1 focus:ring-brand-orange transition-colors"
                          >
                            <span className={skill.name ? 'text-white' : 'text-brand-text-muted'}>{skill.name || 'Select a skill...'}</span>
                            <ChevronDown size={14} className="text-brand-text-muted ml-2" />
                          </button>
                          {skillDropdownOpen === index && (
                            <div className="absolute z-20 mt-1 w-full max-h-52 bg-brand-card border border-brand-border rounded-xl shadow-xl overflow-hidden">
                              <div className="p-2 border-b border-brand-border">
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 rounded-lg bg-brand-surface border border-brand-border text-sm text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-orange/50"
                                  placeholder="Search skills..."
                                  value={skillSearch}
                                  onChange={(e) => setSkillSearch(e.target.value)}
                                  autoFocus
                                />
                              </div>
                              <div className="overflow-y-auto max-h-40">
                                {getFilteredSkills().length === 0 ? (
                                  <div className="p-3 text-sm text-brand-text-muted text-center">No skills found</div>
                                ) : (
                                  getFilteredSkills().map((s) => (
                                    <button key={s} type="button" onClick={() => handleSkillSelect(index, s)} className="w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:text-white hover:bg-brand-surface transition-colors">
                                      {s}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Level */}
                        <div className="flex gap-1">
                          {LEVELS.map((lvl) => (
                            <button
                              key={lvl.value}
                              type="button"
                              onClick={() => handleLevelChange(index, lvl.value)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                                skill.level === lvl.value ? lvl.color : 'text-brand-text-muted bg-transparent border-brand-border hover:border-brand-text-muted'
                              }`}
                            >
                              {lvl.label}
                            </button>
                          ))}
                        </div>
                        {editData.skills.length > 1 && (
                          <button type="button" onClick={() => removeSkillField(index)} className="self-center p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addSkillField} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/20 transition-colors">
                      <Plus size={14} /> Add skill
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {mentor.skills.map((skill, index) => (
                      <div key={index} className={`flex items-center px-3 py-1.5 rounded-lg border ${skill.isVerified ? 'bg-brand-surface border-brand-orange/30' : 'bg-brand-surface border-brand-border'}`}>
                        <span className="text-sm text-white">{skill.name}</span>
                        {skill.level && levelBadge(skill.level)}
                        {skill.isVerified && <CheckBadgeIcon className="h-4 w-4 ml-2 text-mits-green" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Social & Coding Platforms ─── */}
            {editing ? (
              <>
                {/* Social Links edit */}
                <div className="mt-8 pt-8 border-t border-brand-border grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Globe size={14} className="text-brand-orange" /> Social Links
                    </h3>
                    <p className="text-xs text-brand-text-muted">At least one recommended</p>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-brand-text-muted mb-1.5">{label}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon size={14} className="text-brand-text-muted" />
                          </div>
                          <input
                            type="url"
                            className="input pl-9 w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange text-sm"
                            placeholder={`https://${key}.com/...`}
                            value={editData.socialLinks[key] || ''}
                            onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, [key]: e.target.value } })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coding Platforms edit */}
                <div className="mt-8 pt-8 border-t border-brand-border grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Code2 size={14} className="text-brand-orange" /> Coding Platforms
                    </h3>
                    <p className="text-xs text-brand-text-muted">At least one recommended</p>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CODING_PLATFORMS.map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-brand-text-muted mb-1.5">{label}</label>
                        <input
                          type="url"
                          className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange text-sm"
                          placeholder={`https://${key}.com/...`}
                          value={editData.codingPlatforms[key] || ''}
                          onChange={(e) => setEditData({ ...editData, codingPlatforms: { ...editData.codingPlatforms, [key]: e.target.value } })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : hasPlatforms ? (
              <div className="mt-8 pt-8 border-t border-brand-border grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-4">Profiles</h3>
                </div>
                <div className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {socialEntries.map(([key, url]) => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
                      if (!platform) return null;
                      const Icon = platform.icon;
                      return (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-sm text-brand-text-secondary hover:text-white hover:border-brand-orange/30 transition-colors">
                          <Icon size={14} /> {platform.label} <ExternalLink size={10} className="text-brand-text-muted" />
                        </a>
                      );
                    })}
                    {codingEntries.map(([key, url]) => {
                      const platform = CODING_PLATFORMS.find(p => p.key === key);
                      if (!platform) return null;
                      return (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-sm text-brand-text-secondary hover:text-white hover:border-brand-orange/30 transition-colors">
                          <Code2 size={14} /> {platform.label} <ExternalLink size={10} className="text-brand-text-muted" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ═══════ SESSION REQUEST (only for non-owners) ═══════ */}
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
                  <label htmlFor="sessionDate" className="block text-sm font-medium text-brand-text-secondary mb-2">Preferred Date &amp; Time</label>
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
