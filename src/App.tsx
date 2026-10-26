import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InternshipMatcherTab } from './components/InternshipMatcherTab';
import { SkillGapTab } from './components/SkillGapTab';
import { ScamShieldTab } from './components/ScamShieldTab';
import { MockInterviewTab } from './components/MockInterviewTab';
import { SkillQuizTab } from './components/SkillQuizTab';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SAMPLE_STUDENT_PROFILES } from './data/mockInternships';
import { Internship, StudentProfile } from './types';
import { ShieldCheck, Sparkles, Target, Award, Github } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('matcher');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(SAMPLE_STUDENT_PROFILES[0]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [totalXp, setTotalXp] = useState<number>(450);

  // Cross-module states
  const [selectedInternshipForGap, setSelectedInternshipForGap] = useState<Internship | null>(null);
  const [targetRoleForInterview, setTargetRoleForInterview] = useState<string>('Frontend Software Engineer Intern');
  const [targetCompanyForInterview, setTargetCompanyForInterview] = useState<string>('Stripe');
  const [auditInternship, setAuditInternship] = useState<Internship | null>(null);
  const [quizSkill, setQuizSkill] = useState<string>('React Hooks & Lifecycle');
  const [quizRole, setQuizRole] = useState<string>('Frontend Software Engineer Intern');

  const handleAddXp = (amount: number) => {
    setTotalXp((prev) => prev + amount);
  };

  const handleSelectInternshipForGapAnalysis = (internship: Internship) => {
    setSelectedInternshipForGap(internship);
    setActiveTab('skill-gap');
  };

  const handleSelectRoleForInterview = (roleTitle: string, company: string) => {
    setTargetRoleForInterview(roleTitle);
    setTargetCompanyForInterview(company);
    setActiveTab('interview');
  };

  const handleAuditPosting = (internship: Internship) => {
    setAuditInternship(internship);
    setActiveTab('scam-shield');
  };

  const handleLaunchQuizForSkill = (skillName: string, role: string) => {
    setQuizSkill(skillName);
    setQuizRole(role);
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStudent={currentStudent}
        setCurrentStudent={setCurrentStudent}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        totalXp={totalXp}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'matcher' && (
          <InternshipMatcherTab
            student={currentStudent}
            onSelectInternshipForGapAnalysis={handleSelectInternshipForGapAnalysis}
            onSelectRoleForInterview={handleSelectRoleForInterview}
            onAuditPosting={handleAuditPosting}
          />
        )}

        {activeTab === 'skill-gap' && (
          <SkillGapTab
            student={currentStudent}
            selectedInternship={selectedInternshipForGap}
            onSelectInternship={(internship) => setSelectedInternshipForGap(internship)}
            onLaunchQuizForSkill={handleLaunchQuizForSkill}
            onLaunchInterview={handleSelectRoleForInterview}
          />
        )}

        {activeTab === 'scam-shield' && (
          <ScamShieldTab preloadedInternship={auditInternship} />
        )}

        {activeTab === 'interview' && (
          <MockInterviewTab
            student={currentStudent}
            initialRole={targetRoleForInterview}
            initialCompany={targetCompanyForInterview}
            onLaunchQuizForSkill={handleLaunchQuizForSkill}
          />
        )}

        {activeTab === 'quiz' && (
          <SkillQuizTab
            student={currentStudent}
            initialSkill={quizSkill}
            initialRole={quizRole}
            totalXp={totalXp}
            onAddXp={handleAddXp}
          />
        )}
      </main>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={currentStudent}
        onSave={(updated) => setCurrentStudent(updated)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              SI
            </div>
            <span className="font-semibold text-slate-300">SmartIntern AI Platform</span>
            <span>—</span>
            <span>Empowering undergraduate engineers entering tech</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Trust Architecture
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gemini 3.8 Flash Powered
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
