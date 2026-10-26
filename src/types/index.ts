export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface StudentSkill {
  name: string;
  level: SkillLevel;
  category?: 'frontend' | 'backend' | 'database' | 'devops' | 'ai_ml' | 'core_cs';
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  graduationYear: number;
  bio: string;
  skills: StudentSkill[];
  preferredRoles: string[];
  preferredLocation: string;
  remotePreference: 'remote_only' | 'hybrid' | 'in_person' | 'any';
  minStipendMonthly: number;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  companyDomain?: string;
  location: string;
  isRemote: boolean;
  stipendMonthly: number;
  currency: string;
  durationMonths: number;
  postedDaysAgo: number;
  deadlineDate: string;
  category: 'Software Engineering' | 'Frontend' | 'Backend' | 'Full Stack' | 'AI & ML' | 'DevOps & Cloud' | 'Data Science';
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  trustScore: number; // 0 - 100
  trustSignals: {
    verifiedCompany: boolean;
    businessEmail: boolean;
    transparentSalary: boolean;
    clearDeliverables: boolean;
    reputableDomain: boolean;
  };
  contactEmail?: string;
  applyUrl?: string;
  isBenchmarkScam?: boolean; // For demonstration/testing scam detector
}

export interface MatchScoreBreakdown {
  overallScore: number; // 0 - 100
  skillSimilarityScore: number; // 0 - 100
  recencyScore: number; // 0 - 100
  trustScore: number; // 0 - 100
  locationFitScore: number; // 0 - 100
}

export interface MatchResult {
  internship: Internship;
  scores: MatchScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  partiallyMetSkills: string[];
  keyHighlights: string[];
  matchReasoning: string;
}

export interface SkillGapRoadmapWeek {
  week: number;
  theme: string;
  moduleTopics: string[];
  handsOnProject: string;
  estimatedHours: number;
  recommendedResources: { title: string; url?: string; type: 'doc' | 'tutorial' | 'project' }[];
}

export interface SkillGapAnalysis {
  internshipId?: string;
  targetRole: string;
  companyName?: string;
  readinessPercentage: number;
  strongSkills: string[];
  partiallyMetSkills: {
    skill: string;
    studentProficiency: string;
    targetRequirement: string;
    gapDescription: string;
    quickFixTip: string;
  }[];
  missingSkills: {
    skill: string;
    importance: 'critical' | 'high' | 'recommended';
    learningRecommendation: string;
    keyConceptsToMaster: string[];
  }[];
  roadmap: SkillGapRoadmapWeek[];
  interviewReadinessVerdict: string;
}

export interface RuleBasedTrigger {
  id: string;
  severity: 'high' | 'medium' | 'low';
  name: string;
  description: string;
  triggeredClause?: string;
}

export interface FakeInternshipAnalysis {
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
  riskScore: number; // 0 (100% safe) to 100 (extreme danger)
  ruleTriggers: RuleBasedTrigger[];
  aiAssessment: {
    verdictSummary: string;
    detailedReasoning: string;
    flaggedQuotes: string[];
    redFlagsIdentified: string[];
    legitimacyIndicators: string[];
    studentProtectionChecklist: string[];
    actionAdvice: string;
  };
}

export interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'student';
  text: string;
  timestamp: string;
  questionNumber?: number;
}

export interface InterviewTurnResponse {
  interviewerResponse: string;
  questionNumber: number;
  totalQuestions: number;
  isComplete: boolean;
  interviewerNudge?: string;
}

export interface QuestionEvaluation {
  questionNumber: number;
  questionText: string;
  studentAnswer: string;
  ratingScore: number; // 1-10
  feedback: string;
  keyStrengths: string[];
  missingPoints: string[];
  modelAnswerOutline: string;
}

export interface InterviewEvaluation {
  overallRating: number; // 1-10
  readinessStatus: 'Ready for Tech Rounds' | 'Strong Foundation with Minor Gaps' | 'Needs Focused Practice';
  technicalProficiencyScore: number; // 0-100
  communicationScore: number; // 0-100
  problemSolvingScore: number; // 0-100
  keyStrengths: string[];
  topImprovementAreas: string[];
  questionRubrics: QuestionEvaluation[];
  coachingSummary: string;
  suggestedLearningActions: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  practicalTakeaway: string;
  xpPoints: number;
  difficulty: 'beginner' | 'intermediate';
}

export interface SkillQuiz {
  id: string;
  skillName: string;
  topicTitle: string;
  targetRole: string;
  questions: QuizQuestion[];
  totalXp: number;
}
