import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  User,
  Bot,
  Play
} from 'lucide-react';
import { InterviewEvaluation, InterviewMessage, StudentProfile } from '../types';

interface MockInterviewTabProps {
  student: StudentProfile;
  initialRole?: string;
  initialCompany?: string;
  onLaunchQuizForSkill: (skill: string, role: string) => void;
}

export const MockInterviewTab: React.FC<MockInterviewTabProps> = ({
  student,
  initialRole = 'Frontend Software Engineer Intern',
  initialCompany = 'High-Growth Tech Startup',
  onLaunchQuizForSkill,
}) => {
  const [roleTitle, setRoleTitle] = useState(initialRole);
  const [companyType, setCompanyType] = useState(initialCompany);
  const [difficulty, setDifficulty] = useState('Standard College Intern');
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoadingTurn, setIsLoadingTurn] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studentInput, setStudentInput] = useState('');
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync initial props
  useEffect(() => {
    if (initialRole) setRoleTitle(initialRole);
    if (initialCompany) setCompanyType(initialCompany);
  }, [initialRole, initialCompany]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio speech synthesis helper
  const speakText = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    setIsLoadingTurn(true);
    setEvaluation(null);
    setIsCompleted(false);
    setMessages([]);
    setCurrentQuestionNum(1);

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: roleTitle,
          companyType,
          difficulty,
          studentProfile: student,
        }),
      });

      const data = await res.json();
      if (data.success && data.initialMessage) {
        const welcomeMsg: InterviewMessage = {
          id: `msg-${Date.now()}`,
          role: 'interviewer',
          text: data.initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          questionNumber: 1,
        };
        setMessages([welcomeMsg]);
        setCurrentQuestionNum(data.questionNumber || 1);
        setTotalQuestions(data.totalQuestions || 4);
        setSessionActive(true);
        speakText(data.initialMessage);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsLoadingTurn(false);
    }
  };

  const handleSendAnswer = async (requestHint = false) => {
    if (!studentInput.trim() && !requestHint) return;

    const currentAnswer = requestHint ? 'Could you please give me a gentle hint or guide my thinking on this?' : studentInput;
    const userMsg: InterviewMessage = {
      id: `msg-${Date.now()}`,
      role: 'student',
      text: currentAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setStudentInput('');
    setIsLoadingTurn(true);

    try {
      const res = await fetch('/api/interview/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: roleTitle,
          questionNumber: currentQuestionNum,
          totalQuestions,
          conversationHistory: newHistory,
          latestStudentAnswer: currentAnswer,
          requestHint,
        }),
      });

      const data = await res.json();
      if (data.success && data.interviewerResponse) {
        const botMsg: InterviewMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'interviewer',
          text: data.interviewerResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          questionNumber: data.questionNumber,
        };
        setMessages([...newHistory, botMsg]);
        setCurrentQuestionNum(data.questionNumber);
        speakText(data.interviewerResponse);

        if (data.isComplete) {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.error('Failed to process interview turn:', err);
    } finally {
      setIsLoadingTurn(false);
    }
  };

  const handleCompleteAndEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: roleTitle,
          conversationHistory: messages,
          studentProfile: student,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Session Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Generative Technical Interviewer
            </span>
            <span className="text-xs text-slate-400">
              Interviewer: Alex (Staff Engineer)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Technical Mock Interview Arena
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Simulates genuine technical and system rounds. Asks one realistic intern question at a time, probing foundational CS, debugging, and edge cases.
          </p>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              audioEnabled
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Read questions aloud using Web Speech"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            Voice Readout: {audioEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {!sessionActive ? (
        /* Setup Screen */
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/25">
              <MessageSquareCode className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Configure Your Technical Round</h2>
            <p className="text-xs text-slate-400">
              Select the role and target company environment to customize question difficulty and domains.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Intern Role</label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Frontend Software Engineer Intern">Frontend Software Engineer Intern (React, TypeScript)</option>
                <option value="Full Stack Engineering Intern">Full Stack Engineering Intern (Node, React, SQL)</option>
                <option value="Backend Systems Engineer Intern">Backend Systems Engineer Intern (Python, Go, APIs)</option>
                <option value="AI & Machine Learning Intern">AI & Machine Learning Intern (PyTorch, Models, Data)</option>
                <option value="Cloud Infrastructure & DevOps Intern">Cloud Infrastructure & DevOps Intern (Docker, Linux)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Culture Style</label>
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="High-Growth Tech Startup (Stripe/Linear style)">High-Growth Tech Startup</option>
                  <option value="Enterprise Tier 1 Tech (Google/Meta style)">Enterprise Tier 1 Tech</option>
                  <option value="Fintech Infrastructure">Fintech Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interview Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Standard College Intern">Standard Intern (Fundamentals)</option>
                  <option value="Challenging Deep-Dive">Challenging (Architecture & Edge Cases)</option>
                  <option value="Junior Conversational">Junior Conversational (Friendly)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                What to Expect:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                <li>4 focused intern-level questions covering core logic, data flow, and problem solving.</li>
                <li>You can ask for hints anytime if you hit a wall.</li>
                <li>Comprehensive transcript scoring and model answers provided upon completion.</li>
              </ul>
            </div>

            <button
              onClick={startInterview}
              disabled={isLoadingTurn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {isLoadingTurn ? 'Initializing Senior Interviewer...' : 'Begin Technical Mock Interview'}
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview & Evaluation Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chat Transcript Area (7 or 12 cols depending on evaluation) */}
          <div className={`${evaluation ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col h-[650px] bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden`}>
            
            {/* Top Chat Bar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    AL
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Alex • Senior Interviewer</div>
                  <div className="text-[10px] text-slate-400">{roleTitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  Question {currentQuestionNum} / {totalQuestions}
                </span>
                <button
                  onClick={() => setSessionActive(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                  title="Reset session"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'interviewer' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.role === 'student'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                      <span>{msg.role === 'student' ? student.name : 'Alex (Interviewer)'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  {msg.role === 'student' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-500/30">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoadingTurn && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 w-fit">
                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Alex is evaluating your answer and formulating follow-up...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Controls */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Provide code or conceptual explanation</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendAnswer(true)}
                    disabled={isLoadingTurn || isCompleted}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Lightbulb className="w-3 h-3" />
                    Request Hint
                  </button>
                  <button
                    onClick={handleCompleteAndEvaluate}
                    disabled={isEvaluating || messages.length < 2}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isEvaluating ? 'Evaluating Rubric...' : 'Wrap Up & Evaluate'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAnswer();
                    }
                  }}
                  placeholder={
                    isCompleted
                      ? 'Interview round concluded. Click "Wrap Up & Evaluate" to review your rubric.'
                      : 'Type your answer or code snippet... (Press Enter to send)'
                  }
                  disabled={isLoadingTurn || isCompleted}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSendAnswer(false)}
                  disabled={isLoadingTurn || !studentInput.trim() || isCompleted}
                  className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Evaluation Rubric Report (7 cols) */}
          {evaluation && (
            <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 h-[650px] overflow-y-auto">
              
              {/* Header Rubric Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Engineering Bar Raiser Report</div>
                  <h2 className="text-xl font-black text-white mt-0.5">Comprehensive Candidate Rubric</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Overall Rating</div>
                    <div className="text-lg font-black text-indigo-400">{evaluation.overallRating} / 10</div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {evaluation.readinessStatus}
                  </span>
                </div>
              </div>

              {/* Three Metric Bars */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Technical Depth</div>
                  <div className="text-base font-extrabold text-white">{evaluation.technicalProficiencyScore}%</div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${evaluation.technicalProficiencyScore}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Communication</div>
                  <div className="text-base font-extrabold text-white">{evaluation.communicationScore}%</div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${evaluation.communicationScore}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Problem Solving</div>
                  <div className="text-base font-extrabold text-white">{evaluation.problemSolvingScore}%</div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: `${evaluation.problemSolvingScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Coaching Mentorship Summary */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Staff Engineer Mentorship Feedback
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {evaluation.coachingSummary}
                </p>
              </div>

              {/* Strengths & Priority Fixes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Strengths Demonstrated
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {evaluation.keyStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    High-Priority Polish Areas
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {evaluation.topImprovementAreas.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question by Question Model Answers */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Question-by-Question Deep Dive & Model Answers
                </h4>

                {evaluation.questionRubrics.map((qr) => (
                  <div key={qr.questionNumber} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">Question #{qr.questionNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        Score: {qr.ratingScore} / 10
                      </span>
                    </div>

                    <div className="text-xs font-medium text-white">{qr.questionText}</div>
                    
                    <div className="p-2 bg-slate-900 rounded-lg text-[11px] text-slate-300">
                      <span className="font-bold text-slate-400">Your Answer: </span>
                      &ldquo;{qr.studentAnswer}&rdquo;
                    </div>

                    <div className="text-[11px] text-slate-300 leading-snug">
                      <span className="font-bold text-indigo-300">Critique: </span>
                      {qr.feedback}
                    </div>

                    <div className="p-2.5 bg-indigo-950/30 rounded-lg border border-indigo-900/40 text-[11px] text-indigo-200">
                      <div className="font-bold text-indigo-300 mb-1">Model 5% Intern Ideal Answer:</div>
                      <p className="whitespace-pre-wrap">{qr.modelAnswerOutline}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
