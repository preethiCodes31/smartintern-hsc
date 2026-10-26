import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  MessageSquareCode, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Internship, MatchResult, StudentProfile } from '../types';

interface InternshipMatcherTabProps {
  student: StudentProfile;
  onSelectInternshipForGapAnalysis: (internship: Internship) => void;
  onSelectRoleForInterview: (roleTitle: string, company: string) => void;
  onAuditPosting: (internship: Internship) => void;
}

export const InternshipMatcherTab: React.FC<InternshipMatcherTabProps> = ({
  student,
  onSelectInternshipForGapAnalysis,
  onSelectRoleForInterview,
  onAuditPosting,
}) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [remoteOnlyFilter, setRemoteOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'overall' | 'skill' | 'trust' | 'stipend' | 'recency'>('overall');
  const [selectedDetails, setSelectedDetails] = useState<Internship | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/match-internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentProfile: student }),
      });
      const data = await res.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [student]);

  // Filter & Sort
  const filteredMatches = matches
    .filter((m) => {
      const matchSearch =
        m.internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.internship.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || m.internship.category === categoryFilter;
      const matchRemote = !remoteOnlyFilter || m.internship.isRemote;

      return matchSearch && matchCategory && matchRemote;
    })
    .sort((a, b) => {
      if (sortBy === 'overall') return b.scores.overallScore - a.scores.overallScore;
      if (sortBy === 'skill') return b.scores.skillSimilarityScore - a.scores.skillSimilarityScore;
      if (sortBy === 'trust') return b.scores.trustScore - a.scores.trustScore;
      if (sortBy === 'stipend') return b.internship.stipendMonthly - a.internship.stipendMonthly;
      if (sortBy === 'recency') return b.scores.recencyScore - a.scores.recencyScore;
      return 0;
    });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      
      {/* Student Overview Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Targeting Internships
              </span>
              <span className="text-xs text-slate-400">
                {student.university} • Class of {student.graduationYear}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Welcome, {student.name}
              <span className="text-sm font-normal text-slate-400">({student.major})</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Evaluating your {student.skills.length} verified technical skills against real internship postings.
              Matches are scored using our 4-factor formula: <span className="text-indigo-300 font-medium">45% Skill Fit + 25% Trust + 15% Recency + 15% Location</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Min Target</div>
              <div className="text-sm font-bold text-white">${student.minStipendMonthly.toLocaleString()}/mo</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Work Mode</div>
              <div className="text-sm font-bold text-indigo-300 capitalize">{student.remotePreference.replace('_', ' ')}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Verified Skills</div>
              <div className="text-sm font-bold text-emerald-400">{student.skills.length} Stack Tools</div>
            </div>
          </div>
        </div>

        {/* Skill Badges Quick View */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Your Skills:</span>
          {student.skills.slice(0, 8).map((sk) => (
            <span
              key={sk.name}
              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                sk.level === 'advanced'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : sk.level === 'intermediate'
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}
            >
              {sk.name} <span className="opacity-60 text-[9px] uppercase font-bold">({sk.level.slice(0, 3)})</span>
            </span>
          ))}
          {student.skills.length > 8 && (
            <span className="text-[10px] text-slate-400 font-medium">+{student.skills.length - 8} more</span>
          )}
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role, company (e.g. Stripe, Supabase), or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Disciplines</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
            <option value="AI & ML">AI & ML</option>
            <option value="DevOps & Cloud">DevOps & Cloud</option>
          </select>

          {/* Remote Toggle */}
          <button
            onClick={() => setRemoteOnlyFilter(!remoteOnlyFilter)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              remoteOnlyFilter
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Remote Only
          </button>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-medium pr-1 py-1"
            >
              <option value="overall">Sort: Highest Match Score</option>
              <option value="skill">Sort: Skill Overlap</option>
              <option value="trust">Sort: Trust Rating</option>
              <option value="stipend">Sort: Highest Stipend</option>
              <option value="recency">Sort: Recently Posted</option>
            </select>
          </div>
        </div>

      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Computing multi-factor vector similarity & trust rankings...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No internships match this filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or category filter.</p>
        </div>
      ) : (
        /* Match Results List */
        <div className="grid grid-cols-1 gap-4">
          {filteredMatches.map((m) => {
            const isScamBenchmark = m.internship.isBenchmarkScam;
            const scoreColor = getScoreBadgeColor(m.scores.overallScore);

            return (
              <div
                key={m.internship.id}
                className={`group relative rounded-2xl p-5 border transition-all duration-200 ${
                  isScamBenchmark
                    ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/80'
                    : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Benchmark scam indicator */}
                {isScamBenchmark && (
                  <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      Synthetic Benchmark Test Case (Demonstrates Scam Shield Detector)
                    </span>
                    <button
                      onClick={() => onAuditPosting(m.internship)}
                      className="underline hover:text-white font-bold ml-2"
                    >
                      Audit with Scam Shield &rarr;
                    </button>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Role Info & Badges */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">{m.internship.company}</span>
                      
                      {m.internship.trustScore >= 80 ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Employer ({m.internship.trustScore}%)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          Low Trust ({m.internship.trustScore}%)
                        </span>
                      )}

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {m.internship.category}
                      </span>
                    </div>

                    <h3 
                      onClick={() => setSelectedDetails(m.internship)}
                      className="text-lg font-bold text-white hover:text-indigo-300 transition cursor-pointer flex items-center gap-2"
                    >
                      {m.internship.title}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                    </h3>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {m.internship.location} {m.internship.isRemote && '(Remote Option)'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-200">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        ${m.internship.stipendMonthly.toLocaleString()}/month
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Posted {m.internship.postedDaysAgo === 0 ? 'Today' : `${m.internship.postedDaysAgo}d ago`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                      {m.internship.description}
                    </p>
                  </div>

                  {/* Right: Score Ring & Multi-Factor Breakdown */}
                  <div className="shrink-0 flex items-center gap-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-black ${scoreColor}`}>
                        <span className="text-xl leading-none">{m.scores.overallScore}%</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-0.5">Match</span>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div className="w-44 space-y-1.5 text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5 text-[10px]">
                          <span>Skill Fit (45%)</span>
                          <span className="font-bold text-slate-200">{m.scores.skillSimilarityScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.scores.skillSimilarityScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5 text-[10px]">
                          <span>Trust Score (25%)</span>
                          <span className="font-bold text-slate-200">{m.scores.trustScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${m.scores.trustScore >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ width: `${m.scores.trustScore}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Recency: {m.scores.recencyScore}%</span>
                        <span>Location: {m.scores.locationFitScore}%</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Skills Overlap & Highlights */}
                <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Skill Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Stack:</span>
                    {m.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        {sk}
                      </span>
                    ))}
                    {m.missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium flex items-center gap-1"
                      >
                        <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                        {sk} (Gap)
                      </span>
                    ))}
                  </div>

                  {/* Action Shortcuts */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectInternshipForGapAnalysis(m.internship)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-600 text-white transition shadow-sm"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Skill Gap & Sprint
                    </button>
                    <button
                      onClick={() => onSelectRoleForInterview(m.internship.title, m.internship.company)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      <MessageSquareCode className="w-3.5 h-3.5" />
                      Mock Interview
                    </button>
                    <button
                      onClick={() => onAuditPosting(m.internship)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition"
                      title="Verify posting authenticity & detect fraud"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      Safety
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Full Posting Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-indigo-400">{selectedDetails.company}</div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedDetails.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{selectedDetails.location}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">${selectedDetails.stipendMonthly.toLocaleString()}/month</span>
                  <span>•</span>
                  <span>{selectedDetails.durationMonths} months</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs leading-relaxed text-slate-300">
              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">Job Overview</h4>
                <p>{selectedDetails.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">Key Responsibilities</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {selectedDetails.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">Required Skill Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetails.requiredSkills.map((sk) => (
                    <span key={sk} className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDetails.niceToHaveSkills && selectedDetails.niceToHaveSkills.length > 0 && (
                <div>
                  <h4 className="font-bold text-white text-sm mb-1.5">Nice to Have</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetails.niceToHaveSkills.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 rounded bg-slate-800/60 text-slate-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust signals */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  SmartIntern Trust Verification Signals ({selectedDetails.trustScore}/100)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Business Domain: {selectedDetails.companyDomain || 'None'}</div>
                  <div>Direct Recruiter: {selectedDetails.contactEmail || 'Portal only'}</div>
                  <div>Transparent Compensation: {selectedDetails.trustSignals.transparentSalary ? 'Yes' : 'Vague'}</div>
                  <div>Clear Technical Deliverables: {selectedDetails.trustSignals.clearDeliverables ? 'Yes' : 'Unclear'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const item = selectedDetails;
                  setSelectedDetails(null);
                  onAuditPosting(item);
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Audit Scam Risk
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const item = selectedDetails;
                    setSelectedDetails(null);
                    onSelectInternshipForGapAnalysis(item);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Analyze Skill Gap Roadmap
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
