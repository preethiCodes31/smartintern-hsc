import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  MessageSquareCode, 
  BrainCircuit, 
  User, 
  CheckCircle2, 
  Award,
  ChevronDown
} from 'lucide-react';
import { StudentProfile } from '../types';
import { SAMPLE_STUDENT_PROFILES } from '../data/mockInternships';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStudent: StudentProfile;
  setCurrentStudent: (student: StudentProfile) => void;
  onOpenProfileModal: () => void;
  totalXp: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentStudent,
  setCurrentStudent,
  onOpenProfileModal,
  totalXp,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getRank = (xp: number) => {
    if (xp >= 1500) return { title: 'Offer Magnet', color: 'from-amber-400 to-amber-600', level: 'Lvl 4' };
    if (xp >= 800) return { title: 'Interview Ready', color: 'from-indigo-400 to-purple-600', level: 'Lvl 3' };
    if (xp >= 300) return { title: 'Skill Builder', color: 'from-emerald-400 to-teal-600', level: 'Lvl 2' };
    return { title: 'Intern Apprentice', color: 'from-blue-400 to-cyan-600', level: 'Lvl 1' };
  };

  const rank = getRank(totalXp);

  const navItems = [
    { id: 'matcher', label: 'AI Matcher', icon: Target },
    { id: 'skill-gap', label: 'Skill Gap & Roadmap', icon: TrendingUp },
    { id: 'scam-shield', label: 'Scam Shield', icon: ShieldAlert },
    { id: 'interview', label: 'Mock Interviewer', icon: MessageSquareCode },
    { id: 'quiz', label: 'Skill Quiz Arena', icon: BrainCircuit },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('matcher')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SmartIntern
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI ORCHESTRATION
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Full-Stack Career & Internship Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Gamification Badge */}
          <div className="flex items-center gap-3">
            {/* XP Badge */}
            <div 
              onClick={() => setActiveTab('quiz')}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
              title="Click to open Quiz Arena"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium leading-none">{rank.level} • {rank.title}</div>
                <div className="text-xs font-bold text-amber-300 leading-tight">{totalXp} XP</div>
              </div>
            </div>

            {/* Student Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                  {currentStudent.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">{currentStudent.name}</div>
                  <div className="text-[10px] text-slate-400 leading-none">{currentStudent.major}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                    Switch Test Persona
                  </div>
                  {SAMPLE_STUDENT_PROFILES.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setCurrentStudent(student)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/70 transition ${
                        currentStudent.id === student.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{student.name}</div>
                        <div className="text-[10px] text-slate-500">{student.university} • {student.skills.slice(0, 3).map(s => s.name).join(', ')}</div>
                      </div>
                      {currentStudent.id === student.id && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-800/80 mt-1 pt-1">
                    <button
                      onClick={onOpenProfileModal}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:bg-slate-800/70 flex items-center gap-2 font-medium"
                    >
                      <User className="w-3.5 h-3.5" />
                      Edit Current Profile Skills
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Nav Tabs */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
