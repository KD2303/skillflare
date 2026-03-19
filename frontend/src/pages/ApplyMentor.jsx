import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyAsMentor } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import { SKILLS } from '../utils/constants';
import { toast } from 'react-hot-toast';
import {
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Code2,
  Plus,
  X,
  ChevronDown,
  GraduationCap,
  Globe,
  Award,
} from 'lucide-react';

const LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
];

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/yourusername' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourhandle' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourhandle' },
];

const CODING_PLATFORMS = [
  { key: 'leetcode', label: 'LeetCode', placeholder: 'https://leetcode.com/yourprofile' },
  { key: 'hackerrank', label: 'HackerRank', placeholder: 'https://hackerrank.com/yourprofile' },
  { key: 'codeforces', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/yourhandle' },
  { key: 'codechef', label: 'CodeChef', placeholder: 'https://codechef.com/users/yourhandle' },
  { key: 'gfg', label: 'GeeksForGeeks', placeholder: 'https://auth.geeksforgeeks.org/user/yourprofile' },
];

const ApplyMentor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: '',
    skills: [{ name: '', level: 'beginner' }],
    socialLinks: { linkedin: '', github: '', twitter: '', instagram: '' },
    codingPlatforms: { leetcode: '', hackerrank: '', codeforces: '', codechef: '', gfg: '' },
  });
  const [loading, setLoading] = useState(false);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(null);
  const [skillSearch, setSkillSearch] = useState('');

  /* ─── Skill helpers ─── */
  const handleSkillSelect = (index, skillName) => {
    const newSkills = [...formData.skills];
    newSkills[index].name = skillName;
    setFormData({ ...formData, skills: newSkills });
    setSkillDropdownOpen(null);
    setSkillSearch('');
  };

  const handleLevelChange = (index, level) => {
    const newSkills = [...formData.skills];
    newSkills[index].level = level;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkillField = () => {
    setFormData({ ...formData, skills: [...formData.skills, { name: '', level: 'beginner' }] });
  };

  const removeSkillField = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const selectedSkillNames = formData.skills.map(s => s.name);
  const getFilteredSkills = () => {
    return SKILLS.filter(
      s => !selectedSkillNames.includes(s) && s.toLowerCase().includes(skillSearch.toLowerCase())
    );
  };

  /* ─── Platform helpers ─── */
  const handleSocialChange = (key, value) => {
    setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [key]: value } });
  };

  const handleCodingChange = (key, value) => {
    setFormData({ ...formData, codingPlatforms: { ...formData.codingPlatforms, [key]: value } });
  };

  /* ─── Validation ─── */
  const hasSocialLink = Object.values(formData.socialLinks).some(v => v.trim() !== '');
  const hasCodingPlatform = Object.values(formData.codingPlatforms).some(v => v.trim() !== '');

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validSkills = formData.skills.filter(s => s.name.trim() !== '');
    if (validSkills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    if (!hasSocialLink) {
      toast.error('Please add at least one social media link');
      return;
    }
    if (!hasCodingPlatform) {
      toast.error('Please add at least one coding platform link');
      return;
    }

    setLoading(true);
    try {
      await applyAsMentor({ ...formData, skills: validSkills });
      toast.success('Mentor application submitted successfully!');
      navigate('/mentors');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply as mentor');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-24 text-white">Please log in to apply as a mentor.</div>;
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="card">
          <div className="px-4 py-5 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-brand-orange/10 text-brand-orange">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-2xl font-bold leading-6 text-white">Apply to be a Mentor</h3>
            </div>
            <p className="text-sm text-brand-text-secondary ml-[52px]">Share your expertise and help others grow.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-10">
              {/* ═══ Bio ═══ */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange"
                  placeholder="Tell us about your experience and what you can teach..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  maxLength={500}
                />
                <p className="mt-1.5 text-xs text-brand-text-muted text-right">{formData.bio.length}/500</p>
              </div>

              {/* ═══ Skills ═══ */}
              <div>
                <label className="text-sm font-medium text-brand-text-secondary mb-3 flex items-center gap-2">
                  <Award size={16} className="text-brand-orange" />
                  Skills &amp; Proficiency
                </label>
                <div className="space-y-3 mt-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xl bg-brand-surface/50 border border-brand-border">
                      {/* Skill dropdown */}
                      <div className="relative flex-1">
                        <button
                          type="button"
                          onClick={() => { setSkillDropdownOpen(skillDropdownOpen === index ? null : index); setSkillSearch(''); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-left text-sm transition-colors hover:border-brand-orange/40 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                        >
                          <span className={skill.name ? 'text-white' : 'text-brand-text-muted'}>
                            {skill.name || 'Select a skill...'}
                          </span>
                          <ChevronDown size={16} className="text-brand-text-muted ml-2 flex-shrink-0" />
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
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleSkillSelect(index, s)}
                                    className="w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:text-white hover:bg-brand-surface transition-colors"
                                  >
                                    {s}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Level selector */}
                      <div className="flex gap-1.5">
                        {LEVELS.map((lvl) => (
                          <button
                            key={lvl.value}
                            type="button"
                            onClick={() => handleLevelChange(index, lvl.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                              skill.level === lvl.value
                                ? lvl.color
                                : 'text-brand-text-muted bg-transparent border-brand-border hover:border-brand-text-muted'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>

                      {/* Remove */}
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSkillField(index)}
                          className="self-center p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          aria-label="Remove skill"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSkillField}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/20 transition-colors"
                >
                  <Plus size={16} />
                  Add another skill
                </button>
              </div>

              {/* ═══ Social Media Links ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={16} className="text-brand-orange" />
                  <label className="text-sm font-medium text-brand-text-secondary">Social Media Links</label>
                </div>
                <p className="text-xs text-brand-text-muted mb-4 ml-6">At least one social link is required <span className="text-red-400">*</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key} className="relative">
                      <label className="block text-xs font-medium text-brand-text-muted mb-1.5">{label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon size={16} className="text-brand-text-muted" />
                        </div>
                        <input
                          type="url"
                          className="input pl-10 w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange text-sm"
                          placeholder={placeholder}
                          value={formData.socialLinks[key]}
                          onChange={(e) => handleSocialChange(key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {!hasSocialLink && (
                  <p className="mt-2 text-xs text-red-400 ml-6">Please provide at least one social media link.</p>
                )}
              </div>

              {/* ═══ Coding Platform Links ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Code2 size={16} className="text-brand-orange" />
                  <label className="text-sm font-medium text-brand-text-secondary">Coding Platform Links</label>
                </div>
                <p className="text-xs text-brand-text-muted mb-4 ml-6">At least one coding platform is required <span className="text-red-400">*</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CODING_PLATFORMS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-brand-text-muted mb-1.5">{label}</label>
                      <input
                        type="url"
                        className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange text-sm"
                        placeholder={placeholder}
                        value={formData.codingPlatforms[key]}
                        onChange={(e) => handleCodingChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                {!hasCodingPlatform && (
                  <p className="mt-2 text-xs text-red-400 ml-6">Please provide at least one coding platform link.</p>
                )}
              </div>

              {/* ═══ Submit ═══ */}
              <div className="pt-6 border-t border-brand-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/mentors')}
                  className="btn bg-transparent border border-brand-border text-brand-text-secondary hover:text-white hover:bg-brand-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary min-w-[140px]"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyMentor;
