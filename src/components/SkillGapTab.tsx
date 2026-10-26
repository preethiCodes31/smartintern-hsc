import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  BookOpen, 
  CheckSquare, 
  Square, 
  BrainCircuit, 
  MessageSquareCode, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Internship, SkillGapAnalysis, StudentProfile } from '../types';
import { MOCK_INTERNSHIPS } from '../data/mockInternships';

interface SkillGapTabProps {
  student: StudentProfile;
  selectedInternship: Internship | null;
  onSelectInternship: (internship: Internship) => void;
  onLaunchQuizForSkill: (skillName: string, role: string) => void;
  onLaunchInterview: (role: string, company: string) => void;
}

export const SkillGapTab: React.FC<SkillGapTabProps> = ({
  student,
  selectedInternship,
  onSelectInternship,
  onLaunchQuizForSkill,
  onLaunchInterview,
}) => {
  const currentInternship = selectedInternship || MOCK_INTERNSHIPS[0];
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  const runAnalysis = async (targetJob: Internship) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/skill-gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: student,
          internship: targetJob,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to run skill gap analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentInternship) {
      runAnalysis(currentInternship);
    }
  }, [currentInternship.id, student.skills]);

  const toggleModule = (key: string) => {
    setCompletedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getReadinessColor = (pct: number) => {
    if (pct >= 80) return { stroke: 'stroke-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    if (pct >= 60) return { stroke: 'stroke-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
    return { stroke: 'stroke-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
  };

  const readinessMeta = getReadinessColor(analysis?.readinessPercentage || 70);

  return (
    <div className="space-y-6">
      
      {/* Target Selector Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Job Analysis</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              {currentInternship.title}
              <span className="text-xs font-semibold text-indigo-400">@ {currentInternship.company}</span>
            </div>
          </div>
        </div>

        {/* Target Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={currentInternship.id}
            onChange={(e) => {
              const found = MOCK_INTERNSHIPS.find((i) => i.id === e.target.value);
              if (found) onSelectInternship(found);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {MOCK_INTERNSHIPS.filter(i => !i.isBenchmarkScam).map((job) => (
              <option key={job.id} value={job.id}>
                {job.company} — {job.title.slice(0, 35)}...
              </option>
            ))}
          </select>
          <button
            onClick={() => runAnalysis(currentInternship)}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Synthesizing Predictive Skill Gap Matrix...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Comparing candidate profile competencies against {currentInternship.company}&apos;s required engineering skills and engineering milestones.
          </p>
        </div>
      ) : analysis ? (
        <>
          {/* Top Readiness & Verdict Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Circular Readiness Gauge */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-5">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (analysis.readinessPercentage || 75)) / 100}
                    strokeLinecap="round"
                    className={`${readinessMeta.stroke} transition-all duration-1000 ease-out`}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-2xl font-black ${readinessMeta.text}`}>
                    {analysis.readinessPercentage}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Readiness</span>
                </div>
              </div>

              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${readinessMeta.badge}`}>
                  Interview Fit
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">Candidate Preparedness</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Based on target tech requirements for {currentInternship.category}.
                </p>
              </div>
            </div>

            {/* Mentor Verdict Summary */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Lead Mentor Assessment
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{analysis.interviewReadinessVerdict}&rdquo;
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold">{analysis.strongSkills.length} Solid Skills</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{analysis.partiallyMetSkills.length} To Polish</span>
                  <span>•</span>
                  <span className="text-rose-400 font-semibold">{analysis.missingSkills.length} Critical Gaps</span>
                </div>
                <button
                  onClick={() => onLaunchInterview(currentInternship.title, currentInternship.company)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                >
                  <MessageSquareCode className="w-3.5 h-3.5" />
                  Test with Mock Interview
                </button>
              </div>
            </div>

          </div>

          {/* Three-Column Gap Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Strong Matching Skills */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950/60 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Strong Matches</h3>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {analysis.strongSkills.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">You meet or exceed the bar for these technologies.</p>
              
              <div className="space-y-2 flex-1">
                {analysis.strongSkills.map((sk) => (
                  <div key={sk} className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300">{sk}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Ready</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Partially Met Skills */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-950/60 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Partially Met</h3>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  {analysis.partiallyMetSkills.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">Basics understood; needs production-depth practice.</p>

              <div className="space-y-2.5 flex-1">
                {analysis.partiallyMetSkills.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{p.skill}</span>
                      <button
                        onClick={() => onLaunchQuizForSkill(p.skill, currentInternship.title)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <BrainCircuit className="w-3 h-3" />
                        Quiz
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      <span className="text-slate-300 font-medium">Gap:</span> {p.gapDescription}
                    </div>
                    <div className="text-[11px] text-indigo-300 bg-indigo-500/10 p-1.5 rounded-lg leading-tight border border-indigo-500/20">
                      💡 <span className="font-semibold">Quick Polish:</span> {p.quickFixTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Missing Skills */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-rose-950/60 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Missing Critical Skills</h3>
                </div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  {analysis.missingSkills.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">High-impact topics required for technical rounds.</p>

              <div className="space-y-2.5 flex-1">
                {analysis.missingSkills.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300">{m.skill}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        {m.importance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {m.learningRecommendation}
                    </p>
                    {m.keyConceptsToMaster && m.keyConceptsToMaster.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.keyConceptsToMaster.map((c) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => onLaunchQuizForSkill(m.skill, currentInternship.title)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold border border-indigo-500/30 transition mt-1"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Take Micro-Quiz on {m.skill}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 4-Week Sprint Learning Roadmap */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">4-Week Accelerated Sprint Roadmap</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actionable weekly engineering milestones to close all gaps prior to your technical interview rounds.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {Object.values(completedModules).filter(Boolean).length} modules completed
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysis.roadmap.map((week) => (
                <div
                  key={week.week}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Week {week.week}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ~{week.estimatedHours} hrs
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight">
                      {week.theme}
                    </h4>

                    {/* Module Checkboxes */}
                    <div className="space-y-1.5 pt-1">
                      {week.moduleTopics.map((topic, tIdx) => {
                        const moduleKey = `w${week.week}-m${tIdx}`;
                        const isDone = !!completedModules[moduleKey];

                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleModule(moduleKey)}
                            className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-900/80 cursor-pointer text-[11px] transition"
                          >
                            {isDone ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                            )}
                            <span className={isDone ? 'line-through text-slate-500' : 'text-slate-300'}>
                              {topic}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hands-on project */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      Practical Project
                    </div>
                    <p className="text-[11px] text-indigo-200 leading-snug">
                      {week.handsOnProject}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      ) : null}

    </div>
  );
};
