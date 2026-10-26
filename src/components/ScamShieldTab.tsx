import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileSearch, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  ExternalLink,
  Info,
  Check,
  RefreshCw,
  Copy
} from 'lucide-react';
import { FakeInternshipAnalysis, Internship } from '../types';

interface ScamShieldTabProps {
  preloadedInternship?: Internship | null;
}

export const ScamShieldTab: React.FC<ScamShieldTabProps> = ({ preloadedInternship }) => {
  const [jobTitle, setJobTitle] = useState(preloadedInternship?.title || '');
  const [companyName, setCompanyName] = useState(preloadedInternship?.company || '');
  const [stipend, setStipend] = useState(preloadedInternship ? String(preloadedInternship.stipendMonthly) : '6500');
  const [contactEmail, setContactEmail] = useState(preloadedInternship?.contactEmail || '');
  const [applyUrl, setApplyUrl] = useState(preloadedInternship?.applyUrl || '');
  const [description, setDescription] = useState(preloadedInternship?.description || '');

  const [analysis, setAnalysis] = useState<FakeInternshipAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Quick Preset Samples
  const loadPreset = (type: 'legit' | 'check-scam' | 'fee-scam' | 'exploitative') => {
    if (type === 'legit') {
      setJobTitle('Software Engineering Intern (Payments Infrastructure)');
      setCompanyName('Stripe Inc.');
      setStipend('8400');
      setContactEmail('university-recruiting@stripe.com');
      setApplyUrl('https://stripe.com/jobs/internship');
      setDescription('Join Stripe infrastructure team to build resilient distributed payment gateways and API clients in TypeScript and Go. 12-week paid summer internship with full mentorship and corporate benefits.');
    } else if (type === 'check-scam') {
      setJobTitle('Urgent Remote Data Entry & Software Assistant - $75/hr');
      setCompanyName('Global Apex Tech Partners LLC');
      setStipend('12000');
      setContactEmail('hiringmanager.steve2026@gmail.com');
      setApplyUrl('https://apex-freejobs-telegram.xyz');
      setDescription('Immediate start! No technical interview. You will receive an official cashier check of $3,500 to purchase MacBook and software tools from our accredited vendor. Deposit the check and send remaining balance via Zelle or Crypto. Conduct all onboarding via Telegram @GlobalApexHR.');
    } else if (type === 'fee-scam') {
      setJobTitle('Guaranteed Software Engineer Intern Placement (Fortune 500)');
      setCompanyName('FastTrack Tech Academy');
      setStipend('4500');
      setContactEmail('placement-office@yahoo.com');
      setApplyUrl('https://techbootcamp-guaranteed.online');
      setDescription('100% Guaranteed internship placement with top tier tech companies after 2-week training. Candidate must remit a refundable $499 document processing and security kit deposit before signing contract.');
    } else {
      setJobTitle('Full Stack Tech Lead Intern (Unpaid, Equity Opportunity)');
      setCompanyName('Stealth Stealth Inc');
      setStipend('0');
      setContactEmail('founder2026@gmail.com');
      setApplyUrl('https://forms.google.com/xyz');
      setDescription('Looking for a rockstar student intern to build our entire production mobile app, backend API, database, and AWS architecture from scratch. You will work 55-60 hours a week. Unpaid position, but you will receive invaluable exposure and potential 0.05% equity.');
    }
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim() && !jobTitle.trim()) return;

    setIsScanning(true);
    try {
      const res = await fetch('/api/detect-fake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          company: companyName,
          stipend: parseInt(stipend, 10) || 0,
          contactEmail,
          applyUrl,
          description,
          responsibilities: [description],
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskDesign = (level: string) => {
    if (level === 'SAFE') {
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        card: 'border-emerald-500/30 bg-emerald-950/10',
        icon: ShieldCheck,
        iconColor: 'text-emerald-400',
        label: 'VERIFIED / LOW RISK',
      };
    }
    if (level === 'SUSPICIOUS') {
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        card: 'border-amber-500/30 bg-amber-950/10',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
        label: 'SUSPICIOUS / PROCEED WITH CAUTION',
      };
    }
    return {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      card: 'border-rose-500/40 bg-rose-950/20',
      icon: AlertOctagon,
      iconColor: 'text-rose-400',
      label: 'HIGH RISK / SCAM DETECTED',
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                AI Fraud & Exploitation Defense
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Scam Shield & Posting Auditor
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Protects college students from fake internship postings, check-overpayment traps, upfront fee scams, and predatory uncompensated labor.
              Evaluates postings via deterministic rule heuristics combined with Gemini AI risk assessment.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="space-y-1.5 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Load Benchmark Demos</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => loadPreset('legit')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition"
              >
                ✓ Legit Big Tech
              </button>
              <button
                type="button"
                onClick={() => loadPreset('check-scam')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
              >
                ⚠️ Check Scam
              </button>
              <button
                type="button"
                onClick={() => loadPreset('fee-scam')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
              >
                ⚠️ Upfront Fee Scam
              </button>
              <button
                type="button"
                onClick={() => loadPreset('exploitative')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                60hr Unpaid Role
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Audit Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileSearch className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Posting Input Details</h3>
          </div>

          <form onSubmit={handleScan} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineering Intern..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Apex Tech..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stipend ($/mo)</label>
                <input
                  type="text"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. 7500 or 0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recruiter Email</label>
                <input
                  type="text"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. recruiter@company.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Apply URL / Portal</label>
                <input
                  type="text"
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="e.g. company.com/careers"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description & Tasks</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the complete job description, instructions, payment terms, or email text here..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isScanning || !description.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Dual Heuristic & AI Scan...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Scan Posting for Scams & Red Flags
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Report: 7 cols */}
        <div className="lg:col-span-7">
          {isScanning ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Auditing Posting Authenticity...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Checking against 50+ known college employment scams, fake check schemes, unverified messaging platforms, and deceptive stipends.
                </p>
              </div>
            </div>
          ) : analysis ? (
            (() => {
              const design = getRiskDesign(analysis.riskLevel);
              const Icon = design.icon;

              return (
                <div className={`p-6 rounded-2xl border ${design.card} space-y-5 animate-in fade-in duration-300`}>
                  
                  {/* Verdict Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${design.badge} border`}>
                        <Icon className={`w-6 h-6 ${design.iconColor}`} />
                      </div>
                      <div>
                        <div className={`text-[11px] font-black uppercase tracking-wider ${design.iconColor}`}>
                          {design.label}
                        </div>
                        <h2 className="text-xl font-black text-white mt-0.5">
                          Risk Score: {analysis.riskScore}/100
                        </h2>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${design.badge}`}>
                        {analysis.aiAssessment.actionAdvice}
                      </span>
                    </div>
                  </div>

                  {/* Executive Verdict Summary */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    <span className="font-bold text-white">Executive Verdict: </span>
                    {analysis.aiAssessment.verdictSummary}
                  </div>

                  {/* Rule-Based Triggers Triggered */}
                  {analysis.ruleTriggers && analysis.ruleTriggers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        Triggered Heuristic Flags ({analysis.ruleTriggers.length})
                      </h4>
                      <div className="space-y-1.5">
                        {analysis.ruleTriggers.map((rule) => (
                          <div
                            key={rule.id}
                            className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/60 text-xs text-rose-200 space-y-0.5"
                          >
                            <div className="font-bold flex items-center justify-between">
                              <span>{rule.name}</span>
                              <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                                {rule.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-rose-300/80">{rule.description}</p>
                            {rule.triggeredClause && (
                              <div className="text-[10px] text-rose-400/90 font-mono bg-black/40 px-1.5 py-0.5 rounded mt-1">
                                Trigger: {rule.triggeredClause}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flagged Suspicious Quotes */}
                  {analysis.aiAssessment.flaggedQuotes && analysis.aiAssessment.flaggedQuotes.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Flagged Suspicious Phrases in Text
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.aiAssessment.flaggedQuotes.map((q, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono"
                          >
                            &ldquo;{q}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Red Flags vs Legitimacy Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Red flags */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="font-bold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Identified Red Flags
                      </div>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {analysis.aiAssessment.redFlagsIdentified?.map((rf, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{rf}</span>
                          </li>
                        ))}
                        {(!analysis.aiAssessment.redFlagsIdentified || analysis.aiAssessment.redFlagsIdentified.length === 0) && (
                          <li className="text-slate-500 italic">No prominent red flags detected.</li>
                        )}
                      </ul>
                    </div>

                    {/* Legitimacy signals */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Legitimacy Indicators
                      </div>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {analysis.aiAssessment.legitimacyIndicators?.map((lg, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{lg}</span>
                          </li>
                        ))}
                        {(!analysis.aiAssessment.legitimacyIndicators || analysis.aiAssessment.legitimacyIndicators.length === 0) && (
                          <li className="text-slate-500 italic">No strong legitimacy indicators confirmed.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Student Protection Checklist */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Student Safety & Protection Checklist
                    </div>
                    <div className="space-y-1.5">
                      {analysis.aiAssessment.studentProtectionChecklist?.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-600" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Scam Shield Ready</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click one of the benchmark demos above or enter job posting details on the left, then click &ldquo;Scan Posting&rdquo; to test the dual-engine detector.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
