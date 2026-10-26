import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { StudentProfile, StudentSkill, SkillLevel } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onSave: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [profile, setProfile] = useState<StudentProfile>(student);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate');

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (profile.skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      return;
    }

    setProfile({
      ...profile,
      skills: [...profile.skills, { name: newSkillName.trim(), level: newSkillLevel }],
    });
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s.name !== skillName),
    });
  };

  const handleUpdateSkillLevel = (skillName: string, level: SkillLevel) => {
    setProfile({
      ...profile,
      skills: profile.skills.map((s) => (s.name === skillName ? { ...s, level } : s)),
    });
  };

  const handleSave = () => {
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Student Career Profile</h2>
              <p className="text-xs text-slate-400">Configure your verified skills, academic details, and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">University</label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Major / Degree</label>
              <input
                type="text"
                value={profile.major}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
              <input
                type="number"
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value, 10) || 2026 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={profile.preferredLocation}
                onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
              <select
                value={profile.remotePreference}
                onChange={(e) => setProfile({ ...profile, remotePreference: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="any">Any (Remote, Hybrid, In-Person)</option>
                <option value="remote_only">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="in_person">In-Person Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Monthly Stipend ($)</label>
              <input
                type="number"
                value={profile.minStipendMonthly}
                onChange={(e) => setProfile({ ...profile, minStipendMonthly: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Bio / Summary</label>
            <textarea
              rows={2}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Skills Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Technical Skills ({profile.skills.length})</label>
              <span className="text-[11px] text-slate-500">Click level to toggle proficiency</span>
            </div>

            {/* Add Skill Bar */}
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add skill (e.g., Docker, GraphQL, Redis)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {/* Skill Chips */}
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {profile.skills.map((skill) => {
                const badgeColor =
                  skill.level === 'advanced'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : skill.level === 'intermediate'
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

                return (
                  <div
                    key={skill.name}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-medium ${badgeColor}`}
                  >
                    <span>{skill.name}</span>
                    <button
                      onClick={() => {
                        const nextLevel: SkillLevel =
                          skill.level === 'beginner' ? 'intermediate' : skill.level === 'intermediate' ? 'advanced' : 'beginner';
                        handleUpdateSkillLevel(skill.name, nextLevel);
                      }}
                      className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-black/30 hover:bg-black/50 transition cursor-pointer"
                      title="Click to toggle level"
                    >
                      {skill.level.slice(0, 3)}
                    </button>
                    <button
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-slate-400 hover:text-rose-400 ml-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Check className="w-4 h-4" />
            Save Profile & Recalculate
          </button>
        </div>

      </div>
    </div>
  );
};
