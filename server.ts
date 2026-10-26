import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { MOCK_INTERNSHIPS, SAMPLE_STUDENT_PROFILES } from './src/data/mockInternships';
import type { Internship, StudentProfile, RuleBasedTrigger } from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client on server
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON parsing from Gemini text
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

// ---------------------------------------------------------------------------
// 1. GET /api/internships - Catalog retrieval
// ---------------------------------------------------------------------------
app.get('/api/internships', (req, res) => {
  res.json({ success: true, internships: MOCK_INTERNSHIPS });
});

// ---------------------------------------------------------------------------
// 2. POST /api/match-internships - AI & Multi-Factor Matching Algorithm
// ---------------------------------------------------------------------------
app.post('/api/match-internships', async (req, res) => {
  try {
    const { studentProfile, customInternships } = req.body as {
      studentProfile: StudentProfile;
      customInternships?: Internship[];
    };

    const student = studentProfile || SAMPLE_STUDENT_PROFILES[0];
    const candidatePool = customInternships && customInternships.length > 0 ? customInternships : MOCK_INTERNSHIPS;

    // Multi-factor formula:
    // Overall = 45% Skill Similarity + 25% Trust Score + 15% Recency + 15% Location Fit
    const studentSkillNames = student.skills.map((s) => s.name.toLowerCase());
    const studentSkillMap = new Map(student.skills.map((s) => [s.name.toLowerCase(), s.level]));

    const matches = candidatePool.map((internship) => {
      // 1. Skill Match Calculation
      const reqSkills = internship.requiredSkills || [];
      const niceSkills = internship.niceToHaveSkills || [];

      let requiredMatches = 0;
      let partialMatches = 0;
      const matchedList: string[] = [];
      const partiallyMetList: string[] = [];
      const missingList: string[] = [];

      reqSkills.forEach((reqSkill) => {
        const lowerReq = reqSkill.toLowerCase();
        const foundSkill = studentSkillNames.find((s) => s.includes(lowerReq) || lowerReq.includes(s));

        if (foundSkill) {
          const level = studentSkillMap.get(foundSkill) || 'beginner';
          if (level === 'advanced' || level === 'intermediate') {
            requiredMatches += 1;
            matchedList.push(reqSkill);
          } else {
            partialMatches += 1;
            partiallyMetList.push(reqSkill);
          }
        } else {
          missingList.push(reqSkill);
        }
      });

      let niceMatches = 0;
      niceSkills.forEach((nSkill) => {
        const lower = nSkill.toLowerCase();
        if (studentSkillNames.some((s) => s.includes(lower) || lower.includes(s))) {
          niceMatches += 1;
          matchedList.push(`${nSkill} (Bonus)`);
        }
      });

      const totalReq = reqSkills.length || 1;
      const reqRatio = (requiredMatches + partialMatches * 0.5) / totalReq;
      const bonusRatio = niceSkills.length > 0 ? (niceMatches / niceSkills.length) * 0.2 : 0;
      const skillSimilarityScore = Math.min(100, Math.round((reqRatio * 0.85 + bonusRatio) * 100));

      // 2. Trust Score (0-100)
      const trustScore = internship.trustScore || 80;

      // 3. Recency Score (Exponential decay based on postedDaysAgo)
      const days = internship.postedDaysAgo ?? 7;
      const recencyScore = Math.max(30, Math.round(100 * Math.exp(-0.04 * days)));

      // 4. Location & Remote Fit
      let locationFitScore = 70;
      if (internship.isRemote && (student.remotePreference === 'remote_only' || student.remotePreference === 'any' || student.remotePreference === 'hybrid')) {
        locationFitScore = 100;
      } else if (
        student.preferredLocation &&
        internship.location.toLowerCase().includes(student.preferredLocation.toLowerCase().split(',')[0])
      ) {
        locationFitScore = 95;
      } else if (student.remotePreference === 'remote_only' && !internship.isRemote) {
        locationFitScore = 25;
      } else {
        locationFitScore = 60;
      }

      // Weighted Overall Score
      const overallScore = Math.round(
        skillSimilarityScore * 0.45 +
        trustScore * 0.25 +
        recencyScore * 0.15 +
        locationFitScore * 0.15
      );

      // Key Highlights
      const keyHighlights: string[] = [];
      if (skillSimilarityScore >= 80) keyHighlights.push('High skill overlap with core tech stack');
      if (internship.isRemote) keyHighlights.push('Flexible Remote friendly');
      if (trustScore >= 90) keyHighlights.push('Verified Top Employer');
      if (internship.stipendMonthly >= (student.minStipendMonthly || 0)) {
        keyHighlights.push(`Meets stipend target ($${internship.stipendMonthly.toLocaleString()}/mo)`);
      }
      if (missingList.length === 0) keyHighlights.push('Zero missing required skills');

      const matchReasoning = `Strong alignment with ${student.major} background. ${matchedList.length} skills verified, with high ${internship.category} role fit.`;

      return {
        internship,
        scores: {
          overallScore,
          skillSimilarityScore,
          recencyScore,
          trustScore,
          locationFitScore,
        },
        matchedSkills: matchedList,
        missingSkills: missingList,
        partiallyMetSkills: partiallyMetList,
        keyHighlights,
        matchReasoning,
      };
    });

    // Sort descending by overall score
    matches.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    res.json({
      success: true,
      matches,
      studentEvaluated: student.name,
      totalMatched: matches.length,
    });
  } catch (err: any) {
    console.error('Error in match-internships:', err);
    res.status(500).json({ success: false, error: err.message || 'Matching error' });
  }
});

// ---------------------------------------------------------------------------
// 3. POST /api/skill-gap-analysis - Predictive Skill Gap & Sprint Roadmap
// ---------------------------------------------------------------------------
app.post('/api/skill-gap-analysis', async (req, res) => {
  try {
    const { studentProfile, internship } = req.body as {
      studentProfile: StudentProfile;
      internship: Internship;
    };

    const prompt = `You are the lead engineering career mentor for SmartIntern. Analyze this undergraduate student's profile against the targeted internship posting.

Student Profile:
- Name: ${studentProfile.name}
- Major: ${studentProfile.major} (${studentProfile.university}, Graduating ${studentProfile.graduationYear})
- Current Skills & Proficiencies: ${studentProfile.skills.map((s) => `${s.name} (${s.level})`).join(', ')}
- Bio: ${studentProfile.bio}

Target Internship:
- Role: ${internship.title} at ${internship.company}
- Category: ${internship.category}
- Required Skills: ${internship.requiredSkills.join(', ')}
- Nice-to-have Skills: ${internship.niceToHaveSkills?.join(', ') || 'None specified'}
- Responsibilities: ${internship.responsibilities.join('; ')}
- Description: ${internship.description}

Generate a rigorous, highly actionable, encouraging skill gap assessment formatted as JSON with the exact following schema:
{
  "readinessPercentage": number (0 to 100 representing realistic candidate readiness),
  "strongSkills": string[] (skills where student is completely solid),
  "partiallyMetSkills": [
    {
      "skill": string,
      "studentProficiency": string,
      "targetRequirement": string,
      "gapDescription": string,
      "quickFixTip": string
    }
  ],
  "missingSkills": [
    {
      "skill": string,
      "importance": "critical" | "high" | "recommended",
      "learningRecommendation": string,
      "keyConceptsToMaster": string[]
    }
  ],
  "roadmap": [
    {
      "week": number (1 to 4),
      "theme": string,
      "moduleTopics": string[],
      "handsOnProject": string,
      "estimatedHours": number,
      "recommendedResources": [
        { "title": string, "type": "doc" | "tutorial" | "project" }
      ]
    }
  ],
  "interviewReadinessVerdict": string (2-3 sentences of direct mentor advice for tech rounds)
}

Provide directly useful technical topics without generic fluff.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedData = extractJsonFromText(response.text || '{}');
    res.json({
      success: true,
      analysis: {
        ...parsedData,
        internshipId: internship.id,
        targetRole: internship.title,
        companyName: internship.company,
      },
    });
  } catch (err: any) {
    console.error('Error in skill-gap-analysis:', err);
    res.status(500).json({ success: false, error: err.message || 'Analysis error' });
  }
});

// ---------------------------------------------------------------------------
// 4. POST /api/detect-fake - Dual Rule-Based Heuristics + Gemini Risk Assessment
// ---------------------------------------------------------------------------
app.post('/api/detect-fake', async (req, res) => {
  try {
    const { title, company, description, stipend, contactEmail, applyUrl, responsibilities } = req.body;

    const fullText = `${title || ''} ${company || ''} ${description || ''} ${(responsibilities || []).join(' ')} ${contactEmail || ''} ${applyUrl || ''}`.toLowerCase();

    // 1. Rule-Based Heuristic Scanner
    const ruleTriggers: RuleBasedTrigger[] = [];

    // Upfront Fee / Security Deposit
    if (/deposit|registration fee|processing fee|security deposit|pay for training|buy equipment|reimburse check|send check|vendor kit/i.test(fullText)) {
      ruleTriggers.push({
        id: 'rule-upfront-fee',
        severity: 'high',
        name: 'Upfront Fee or Check-Overpayment Scam Detected',
        description: 'Demands upfront payment, security deposit, equipment purchase check, or fees for registration/certification.',
        triggeredClause: 'Mentions deposit, fees, purchasing equipment, or check reimbursement.',
      });
    }

    // Unverified messaging apps for hiring
    if (/telegram|whatsapp|signal app|google chat only|text only interview/i.test(fullText)) {
      ruleTriggers.push({
        id: 'rule-unverified-messaging',
        severity: 'high',
        name: 'Informal / Encrypted Messaging Contact',
        description: 'Directing applicants to conduct formal hiring or submit documents solely through Telegram, WhatsApp, or Signal.',
        triggeredClause: 'Directing interview/onboarding to Telegram or WhatsApp.',
      });
    }

    // Suspicious email domains for purported companies
    const emailMatch = (contactEmail || '').toLowerCase();
    const isFreeMail = /@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|protonmail\.com)$/i.test(emailMatch);
    const mentionsCorporate = /google|stripe|meta|apple|microsoft|amazon|netflix|linear|datadog|accenture/i.test(company || '');
    if (isFreeMail && mentionsCorporate) {
      ruleTriggers.push({
        id: 'rule-freemail-impersonation',
        severity: 'high',
        name: 'Suspected Brand Impersonation',
        description: 'Using a free consumer email address (e.g., Gmail/Yahoo) while representing a major technology company.',
        triggeredClause: `Contact email is ${contactEmail} for ${company}`,
      });
    } else if (isFreeMail && !mentionsCorporate) {
      ruleTriggers.push({
        id: 'rule-freemail-contact',
        severity: 'medium',
        name: 'Free Consumer Email Used for Hiring',
        description: 'Legitimate employers usually operate company domain email addresses.',
        triggeredClause: `Recruiter email uses generic domain: ${contactEmail}`,
      });
    }

    // Unrealistic Compensation for Zero-Skill/Intern
    const stipendNum = typeof stipend === 'number' ? stipend : parseInt(stipend || '0', 10);
    if (stipendNum > 11000 && /data entry|typing|form filling|no experience needed|instant hire/i.test(fullText)) {
      ruleTriggers.push({
        id: 'rule-unrealistic-stipend',
        severity: 'high',
        name: 'Unrealistically High Compensation for Trivial Tasks',
        description: 'Promising $10,000+/mo for simple data entry or instant hiring without technical verification.',
        triggeredClause: `Stipend is $${stipendNum}/mo with simple data entry/instant hiring keywords.`,
      });
    }

    // Exploitative Unpaid Intense Workload
    if ((stipendNum === 0 || /unpaid/i.test(fullText)) && /50 hours|60 hours|24\/7|single-handedly|lead architect|entire product/i.test(fullText)) {
      ruleTriggers.push({
        id: 'rule-exploitative-unpaid',
        severity: 'medium',
        name: 'Exploitative Labor & Excessive Uncompensated Demands',
        description: 'Unpaid role demanding 50+ hours/week, 24/7 on-call duty, or building entire production systems solo.',
        triggeredClause: 'Demands intense tech lead hours without salary or legally compliant mentorship.',
      });
    }

    // 2. Gemini AI Deep Risk Assessment
    const aiPrompt = `You are the lead cybersecurity and career fraud analyst for SmartIntern. Analyze this internship posting to detect scams, fraud, phishing, check-overpayment traps, or predatory exploitative conditions.

Posting Details:
- Title: ${title}
- Company: ${company}
- Contact Email: ${contactEmail || 'Not provided'}
- Apply URL: ${applyUrl || 'Not provided'}
- Compensation: ${stipend ? `$${stipend}/mo` : 'Unspecified'}
- Job Description: ${description}
- Responsibilities: ${(responsibilities || []).join('; ')}

Pre-computed Heuristic Triggers:
${ruleTriggers.map((t) => `- [${t.severity.toUpperCase()}] ${t.name}: ${t.description}`).join('\n') || 'None'}

Evaluate the posting thoroughly and output JSON with this exact schema:
{
  "riskLevel": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "riskScore": number (0 to 100, where 0 is 100% verified authentic, 50 is caution, 90+ is scam),
  "verdictSummary": string (1-2 crisp, authoritative sentences explaining the status),
  "detailedReasoning": string (multi-paragraph detailed breakdown for students),
  "flaggedQuotes": string[] (exact words or phrases from the posting that arouse suspicion),
  "redFlagsIdentified": string[] (bullet points of warning signs),
  "legitimacyIndicators": string[] (bullet points of legitimate indicators like verifiable domain or clear technical expectations),
  "studentProtectionChecklist": string[] (immediate safety instructions e.g. "Do not cash any check", "Verify recruiter via LinkedIn company page"),
  "actionAdvice": string (Clear bottom-line advice: Apply, Seek Verification, or Do Not Apply / Report)
}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: aiPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const aiData = extractJsonFromText(aiResponse.text || '{}');

    // Synthesize final risk score (give weight to heuristic high severity triggers)
    let finalRiskScore = aiData.riskScore ?? 15;
    if (ruleTriggers.some((r) => r.severity === 'high')) {
      finalRiskScore = Math.max(finalRiskScore, 85);
    }

    let finalRiskLevel = aiData.riskLevel || 'SAFE';
    if (finalRiskScore >= 70) finalRiskLevel = 'HIGH_RISK';
    else if (finalRiskScore >= 35) finalRiskLevel = 'SUSPICIOUS';
    else finalRiskLevel = 'SAFE';

    res.json({
      success: true,
      analysis: {
        riskLevel: finalRiskLevel,
        riskScore: finalRiskScore,
        ruleTriggers,
        aiAssessment: {
          ...aiData,
          riskLevel: finalRiskLevel,
          riskScore: finalRiskScore,
        },
      },
    });
  } catch (err: any) {
    console.error('Error in detect-fake:', err);
    res.status(500).json({ success: false, error: err.message || 'Detection error' });
  }
});

// ---------------------------------------------------------------------------
// 5. POST /api/interview/start - Generative AI Technical Mock Interviewer
// ---------------------------------------------------------------------------
app.post('/api/interview/start', async (req, res) => {
  try {
    const { targetRole, companyType, difficulty, studentProfile } = req.body;

    const role = targetRole || 'Frontend Software Engineer Intern';
    const compType = companyType || 'Product Tech Startup';
    const diff = difficulty || 'Standard Intern';

    const systemPrompt = `You are "Alex", a welcoming, highly encouraging, yet rigorous Senior Software Engineer conducting an authentic technical mock interview for an undergraduate college student.
Role: ${role}
Company Setting: ${compType}
Difficulty: ${diff}
Candidate: ${studentProfile?.name || 'Candidate'} (${studentProfile?.major || 'Computer Science'})

Your mission:
- Introduce yourself warmly.
- State that this will be a focused 4-question technical and system discussion designed to test fundamentals, problem-solving, and communication.
- Ask QUESTION #1 right away.
- Question 1 should be a foundational yet practical coding or concept question relevant to ${role} (for example, React rendering & state lifecycle, asynchronous event loop, SQL indexing/transactions, or clean API design).
- Keep your tone supportive, conversational, and direct.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
    });

    res.json({
      success: true,
      initialMessage: response.text,
      questionNumber: 1,
      totalQuestions: 4,
    });
  } catch (err: any) {
    console.error('Error in interview/start:', err);
    res.status(500).json({ success: false, error: err.message || 'Interview start failed' });
  }
});

// ---------------------------------------------------------------------------
// 6. POST /api/interview/turn - Multi-Turn Interview Turn Handler
// ---------------------------------------------------------------------------
app.post('/api/interview/turn', async (req, res) => {
  try {
    const {
      targetRole,
      questionNumber,
      totalQuestions,
      conversationHistory,
      latestStudentAnswer,
      requestHint,
    } = req.body;

    const qNum = questionNumber || 1;
    const maxQ = totalQuestions || 4;
    const isLastTurn = qNum >= maxQ;

    const formattedHistory = (conversationHistory || [])
      .map((m: any) => `${m.role === 'interviewer' ? 'Interviewer (Alex)' : 'Student'}: ${m.text}`)
      .join('\n\n');

    const prompt = `You are "Alex", the Senior Engineer conducting a technical mock interview for a ${targetRole} intern position.

Interview History so far:
${formattedHistory}

Latest Candidate Input:
"${latestStudentAnswer}"

${requestHint ? 'The candidate is stuck and asked for a gentle nudge or hint.' : ''}
Current Question Count: ${qNum} out of ${maxQ}.

Instructions:
1. Provide a brief, authentic 2-3 sentence reaction to the student's answer (point out what was strong or clarify an edge case gracefully).
2. If the candidate asked for a hint, give a constructive conceptual hint without giving away the full answer.
3. ${
      isLastTurn
        ? 'Since this was the final question (4/4), wrap up the technical session warmly. Congratulate them on completing all 4 questions, and invite them to view their comprehensive evaluation rubric.'
        : `Then immediately transition to ask Question #${qNum + 1}. Make Question #${qNum + 1} realistic for an intern (e.g. debugging a tricky scenario, designing a simple component/endpoint, or handling concurrency/state).`
    }

Format your output as JSON:
{
  "interviewerResponse": string (your spoken response text),
  "interviewerNudge": string (optional quick feedback or tip),
  "isComplete": boolean (${isLastTurn ? 'true' : 'false'})
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');

    res.json({
      success: true,
      interviewerResponse: parsed.interviewerResponse,
      interviewerNudge: parsed.interviewerNudge,
      questionNumber: isLastTurn ? maxQ : qNum + 1,
      totalQuestions: maxQ,
      isComplete: isLastTurn,
    });
  } catch (err: any) {
    console.error('Error in interview/turn:', err);
    res.status(500).json({ success: false, error: err.message || 'Interview turn failed' });
  }
});

// ---------------------------------------------------------------------------
// 7. POST /api/interview/evaluate - Final Interview Transcript Rubric Evaluation
// ---------------------------------------------------------------------------
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { targetRole, conversationHistory, studentProfile } = req.body;

    const transcript = (conversationHistory || [])
      .map((m: any) => `${m.role === 'interviewer' ? 'Alex (Interviewer)' : 'Student'}: ${m.text}`)
      .join('\n\n');

    const prompt = `You are a Senior Staff Engineering Bar Raiser evaluating a technical mock interview transcript for an undergraduate applying for a ${targetRole} internship.

Candidate: ${studentProfile?.name || 'Student'} (${studentProfile?.major || 'CS'})
Full Transcript:
${transcript}

Produce a fair, encouraging, realistic, and highly educational evaluation report as JSON with this exact schema:
{
  "overallRating": number (1 to 10),
  "readinessStatus": "Ready for Tech Rounds" | "Strong Foundation with Minor Gaps" | "Needs Focused Practice",
  "technicalProficiencyScore": number (0 to 100),
  "communicationScore": number (0 to 100),
  "problemSolvingScore": number (0 to 100),
  "keyStrengths": string[] (3-4 bullet points highlighting specific moments or technical answers),
  "topImprovementAreas": string[] (3-4 constructive, actionable areas to polish),
  "questionRubrics": [
    {
      "questionNumber": number,
      "questionText": string,
      "studentAnswer": string,
      "ratingScore": number (1 to 10),
      "feedback": string,
      "keyStrengths": string[],
      "missingPoints": string[],
      "modelAnswerOutline": string (how a top 5% intern would answer this clearly)
    }
  ],
  "coachingSummary": string (2-3 paragraphs of encouraging, authentic engineering mentorship),
  "suggestedLearningActions": string[] (3-5 concrete action items to prepare for actual tech interviews)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const evaluation = extractJsonFromText(response.text || '{}');
    res.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error('Error in interview/evaluate:', err);
    res.status(500).json({ success: false, error: err.message || 'Evaluation error' });
  }
});

// ---------------------------------------------------------------------------
// 8. POST /api/quiz/generate - Gamified Micro-Quiz Generator for Skill Gaps
// ---------------------------------------------------------------------------
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { skillName, targetRole, difficulty } = req.body;
    const skill = skillName || 'React State & Hooks';
    const role = targetRole || 'Frontend Engineering Intern';

    const prompt = `You are the lead technical curriculum designer for SmartIntern. Generate an engaging, high-yield, 5-question multiple choice quiz tailored specifically for an undergraduate student closing a skill gap in: "${skill}" for a "${role}" role.

Requirements:
- 5 multiple choice questions ranging from foundational to practical debugging/code analysis.
- Provide practical code snippets where appropriate.
- Options must be concise and plausible.
- Clearly identify the single correct option index (0, 1, 2, or 3).
- Provide a clear, intuitive explanation of why the correct option is right and the others are traps.
- Add a 1-sentence "practicalTakeaway" that students can use directly in job interviews.

Output JSON format:
{
  "skillName": "${skill}",
  "topicTitle": string (engaging title like "Mastering Async Data Fetching in React"),
  "targetRole": "${role}",
  "totalXp": 500,
  "questions": [
    {
      "id": "q1",
      "question": string,
      "codeSnippet": string (optional code snippet, or empty string if conceptual),
      "options": [string, string, string, string],
      "correctAnswerIndex": number (0 to 3),
      "explanation": string,
      "practicalTakeaway": string,
      "xpPoints": 100,
      "difficulty": "beginner" | "intermediate"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const quizData = extractJsonFromText(response.text || '{}');
    res.json({
      success: true,
      quiz: {
        ...quizData,
        id: `quiz-${Date.now()}`,
      },
    });
  } catch (err: any) {
    console.error('Error in quiz/generate:', err);
    res.status(500).json({ success: false, error: err.message || 'Quiz generation failed' });
  }
});

// ---------------------------------------------------------------------------
// Vite Dev Middlewares / Production Static Files
// ---------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SmartIntern Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
