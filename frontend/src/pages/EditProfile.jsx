import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { ArrowLeft, Save, X, Plus, User, Shield, Briefcase, Link } from 'lucide-react';
import { Avatar, Loading } from '../components';
import { SKILLS } from '../utils/constants';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    portfolio: user?.portfolio || '',
    skills: user?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Identity signature required');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.updateProfile(formData);
      updateUser(response.user);
      toast.success('Agent record updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 text-gray-400 hover:text-brand-orange transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Return to Profile</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-brand-card/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-2xl animate-pulse" />
                <Avatar name={formData.name || user?.name} size="xl" className="relative border-4 border-brand-orange/20" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Identity Sync</h2>
              <p className="text-sm text-gray-400">Update your agent parameters for the network.</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/5">
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-orange" />
                    Agent Parameters
                  </h1>
                </div>

                <div className="p-8 space-y-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4" /> Agent Callsign
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange/50 transition-colors"
                      placeholder="Enter legal name or callsign"
                    />
                  </div>

                  {/* Bio field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Background Brief
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange/50 transition-colors resize-none"
                      placeholder="Describe your capabilities and experience..."
                      maxLength={500}
                    />
                    <div className="flex justify-end">
                      <span className={`text-[10px] font-mono ${formData.bio.length > 450 ? 'text-brand-orange' : 'text-gray-500'}`}>
                        {formData.bio.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Portfolio field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Link className="w-4 h-4" /> Network Link (Portfolio)
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange/50 transition-colors"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Skills section */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-400">Specializations</label>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 px-3 py-1.5 rounded-lg text-sm font-medium group animate-fade-in"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-brand-orange/50 hover:text-brand-orange transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange/50 transition-colors appearance-none"
                      >
                        <option value="">Add specialization...</option>
                        {SKILLS.filter((s) => !formData.skills.includes(s)).map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddSkill(newSkill)}
                        disabled={!newSkill}
                        className="bg-brand-dark border border-white/10 hover:border-brand-orange text-white w-12 flex items-center justify-center rounded-xl transition-all disabled:opacity-50"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 text-gray-400 font-medium hover:text-white transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-orange/20 transition-all flex items-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                        Save Agent Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
