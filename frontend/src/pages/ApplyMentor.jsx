import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyAsMentor } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';

const ApplyMentor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: '',
    skills: [{ name: '' }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index].name = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkillField = () => {
    setFormData({ ...formData, skills: [...formData.skills, { name: '' }] });
  };

  const removeSkillField = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty skills
      const validSkills = formData.skills.filter(s => s.name.trim() !== '');
      await applyAsMentor({ ...formData, skills: validSkills });
      navigate('/mentors');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply as mentor');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-24 text-white">Please log in to apply as a mentor.</div>;
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-2xl font-bold leading-6 text-white">Apply to be a Mentor</h3>
            <div className="mt-2 text-sm text-brand-text-secondary">
              <p>Share your expertise and help others grow. Fill out the form below to get started.</p>
            </div>
            {error && <div className="mt-4 text-red-500 text-sm font-medium">{error}</div>}
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange"
                    placeholder="Tell us about your experience and what you can teach..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-brand-text-muted">Brief description for your profile.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-3">Skills</label>
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        className="input w-full bg-brand-surface text-white border-brand-border focus:ring-brand-orange"
                        placeholder="e.g., React, Node.js, Python"
                        value={skill.name}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        required
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSkillField(index)}
                          className="flex-shrink-0 p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          aria-label="Remove skill"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSkillField}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add another skill
                </button>
              </div>

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
                  className="btn-primary min-w-[120px]"
                >
                  {loading ? 'Submitting...' : 'Apply Application'}
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
