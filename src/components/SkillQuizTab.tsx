import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  HelpCircle,
  Lightbulb,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { QuizQuestion, SkillQuiz, StudentProfile } from '../types';

interface SkillQuizTabProps {
  student: StudentProfile;
  initialSkill?: string;
  initialRole?: string;
  totalXp: number;
  onAddXp: (xp: number) => void;
}

export const SkillQuizTab: React.FC<SkillQuizTabProps> = ({
  student,
  initialSkill = 'React Hooks & State Lifecycles',
  initialRole = 'Frontend Engineer Intern',
  totalXp,
  onAddXp,
}) => {
  const [targetSkill, setTargetSkill] = useState(initialSkill);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [quiz, setQuiz] = useState<SkillQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);

  // Active quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXpInSession, setEarnedXpInSession] = useState(0);

  const POPULAR_SKILL_TOPICS = [
    { name: 'React Hooks & Lifecycle', role: 'Frontend Engineer Intern' },
    { name: 'SQL Joins & Indexing', role: 'Backend & Database Intern' },
    { name: 'Docker & Container Basics', role: 'DevOps & Cloud Intern' },
    { name: 'REST APIs & Status Codes', role: 'Full Stack Engineer Intern' },
    { name: 'Git Branching & Rebase', role: 'Software Engineer Intern' },
    { name: 'Python Async & Generators', role: 'Backend Systems Intern' },
  ];

  const generateQuiz = async (skillToUse?: string, roleToUse?: string) => {
    const s = skillToUse || targetSkill;
    const r = roleToUse || targetRole;
    setIsLoadingQuiz(true);
    setQuizFinished(false);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setEarnedXpInSession(0);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: s,
          targetRole: r,
        }),
      });

      const data = await res.json();
      if (data.success && data.quiz) {
        setQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (hasAnswered || !quiz) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const q = quiz.questions[currentQIndex];
    const isCorrect = idx === q.correctAnswerIndex;

    if (isCorrect) {
      const gained = q.xpPoints || 100;
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setEarnedXpInSession((prev) => prev + gained);
      onAddXp(gained);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const currentQuestion: QuizQuestion | undefined = quiz?.questions[currentQIndex];

  return (
    <div className="space-y-6">
      
      {/* Gamification Level & XP Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Gamified Skill-Building Arena
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Skill Gap Micro-Quizzes
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Reinforce weak areas and missing technical competencies identified in your skill gap analysis through high-yield interactive questions.
          </p>
        </div>

        {/* Gamification Stats HUD */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total XP</div>
            <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              {totalXp} XP
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Current Streak</div>
            <div className="text-lg font-black text-rose-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-current" />
              {streak}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Switcher Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Select Focus Skill Gap or Enter Custom:
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              placeholder="e.g. React useEffect, Docker, SQL Joins..."
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-60"
            />
            <button
              onClick={() => generateQuiz()}
              disabled={isLoadingQuiz || !targetSkill.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLoadingQuiz ? 'Generating...' : 'Start Quiz'}
            </button>
          </div>
        </div>

        {/* Popular Topic Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
          {POPULAR_SKILL_TOPICS.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setTargetSkill(item.name);
                setTargetRole(item.role);
                generateQuiz(item.name, item.role);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                targetSkill === item.name
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoadingQuiz ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Synthesizing High-Yield Micro-Quiz...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Generating 5 intern-level multiple choice questions with code snippets, traps, and practical takeaways for &ldquo;{targetSkill}&rdquo;.
          </p>
        </div>
      ) : quiz && !quizFinished && currentQuestion ? (
        /* Active Question Card */
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          
          {/* Progress & Metadata */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {quiz.topicTitle}
              </div>
              <div className="text-xs font-semibold text-slate-400">
                Question {currentQIndex + 1} of {quiz.questions.length}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                +{currentQuestion.xpPoints} XP
              </span>
              <span className="text-xs font-bold text-slate-400 capitalize">
                {currentQuestion.difficulty}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text & Code Snippet */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>

            {currentQuestion.codeSnippet && currentQuestion.codeSnippet.trim() !== '' && (
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-indigo-200 overflow-x-auto font-mono">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* 4 Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              let optionStyle = 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200';
              
              if (hasAnswered) {
                if (idx === currentQuestion.correctAnswerIndex) {
                  optionStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-bold';
                } else if (idx === selectedOption) {
                  optionStyle = 'bg-rose-950/40 border-rose-500/60 text-rose-200 font-bold';
                } else {
                  optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle} ${
                    !hasAnswered ? 'cursor-pointer hover:bg-slate-950' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {hasAnswered && (
                    <div>
                      {idx === currentQuestion.correctAnswerIndex ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : idx === selectedOption ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Actionable Takeaway upon answering */}
          {hasAnswered && (
            <div className="space-y-3 pt-2 animate-in fade-in duration-200">
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                  selectedOption === currentQuestion.correctAnswerIndex
                    ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {selectedOption === currentQuestion.correctAnswerIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Correct! +{currentQuestion.xpPoints} XP
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Incorrect
                    </>
                  )}
                </div>
                <p className="text-slate-300 text-[11px]">
                  {currentQuestion.explanation}
                </p>

                {currentQuestion.practicalTakeaway && (
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-indigo-300">
                    💡 <span className="font-bold">Interview Pro-Tip:</span> {currentQuestion.practicalTakeaway}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  {currentQIndex < quiz.questions.length - 1 ? 'Next Question' : 'View Quiz Results'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : quizFinished && quiz ? (
        /* Quiz Finished Victory Screen */
        <div className="max-w-md mx-auto text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 font-black">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Sprint Milestone Achieved
            </span>
            <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400">
              You scored <span className="text-white font-bold">{score} / {quiz.questions.length}</span> on {quiz.skillName}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Earned XP</div>
              <div className="text-xl font-black text-amber-400">+{earnedXpInSession} XP</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
              <div className="text-xl font-black text-emerald-400">
                {Math.round((score / quiz.questions.length) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => generateQuiz()}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
            <button
              onClick={() => {
                const nextTopic = POPULAR_SKILL_TOPICS.find((t) => t.name !== targetSkill) || POPULAR_SKILL_TOPICS[0];
                setTargetSkill(nextTopic.name);
                setTargetRole(nextTopic.role);
                generateQuiz(nextTopic.name, nextTopic.role);
              }}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Next Skill Topic
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Intro State */
        <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 max-w-xl mx-auto space-y-4">
          <BrainCircuit className="w-12 h-12 text-indigo-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Select a Topic to Start Learning</h3>
            <p className="text-xs text-slate-400">
              Pick a technical topic from above or enter any specific skill gap to generate a tailored 5-question micro-quiz.
            </p>
          </div>
          <button
            onClick={() => generateQuiz()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            Start Quiz on {targetSkill}
          </button>
        </div>
      )}

    </div>
  );
};
