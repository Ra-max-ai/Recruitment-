const { GoogleGenAI } = require("@google/genai");

/**
 * Intelligent NLP Fallback Matcher
 * Analyzes actual resume text against job requirements when Gemini API key
 * is not yet configured or when LLM API rate limits are encountered.
 */
function performNLPAnalysis(resumeText, job) {
  const textLower = (resumeText || "").toLowerCase();
  const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];

  const matchedSkills = [];
  const missingSkills = [];

  // 1. Skill Matching Analysis based on actual resume text
  requiredSkills.forEach((skill) => {
    const cleanSkill = skill.trim();
    if (!cleanSkill) return;

    // Use regex word boundary check where possible or simple inclusion
    const escaped = cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9+#.])${escaped}([^a-zA-Z0-9+#.]|$)`, "i");

    if (regex.test(textLower) || textLower.includes(cleanSkill.toLowerCase())) {
      matchedSkills.push(cleanSkill);
    } else {
      missingSkills.push(cleanSkill);
    }
  });

  // 2. Extract Candidate Skills found in resume
  const commonTechSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL",
    "PostgreSQL", "Python", "Java", "C++", "C#", "HTML", "CSS", "Git", "Docker",
    "Kubernetes", "AWS", "Azure", "GCP", "REST API", "GraphQL", "Redux", "Tailwind",
    "Bootstrap", "Next.js", "Machine Learning", "NLP", "Data Structures", "Algorithms"
  ];
  const detectedSkills = [];
  commonTechSkills.forEach((s) => {
    if (textLower.includes(s.toLowerCase())) {
      detectedSkills.push(s);
    }
  });
  // Also include matched skills
  matchedSkills.forEach((s) => {
    if (!detectedSkills.includes(s)) detectedSkills.push(s);
  });

  // 3. Experience Estimation
  let detectedExpYears = 0;
  const expRegex = /(\d+)\+?\s*(?:years?|yrs?)(?:\s*(?:of)?\s*experience)?/i;
  const expMatch = textLower.match(expRegex);
  if (expMatch && expMatch[1]) {
    detectedExpYears = parseInt(expMatch[1], 10);
  } else if (textLower.includes("senior") || textLower.includes("lead")) {
    detectedExpYears = 4;
  } else if (textLower.includes("junior") || textLower.includes("intern") || textLower.includes("fresher")) {
    detectedExpYears = 1;
  } else {
    detectedExpYears = 1;
  }

  // 4. Education Extraction
  let detectedEducation = "Bachelor's Degree in Computer Science or related field";
  if (textLower.includes("ph.d") || textLower.includes("doctorate")) {
    detectedEducation = "Ph.D. / Doctorate";
  } else if (textLower.includes("master") || textLower.includes("m.tech") || textLower.includes("m.s.") || textLower.includes("mca")) {
    detectedEducation = "Master's Degree (M.Tech / M.S. / MCA)";
  } else if (textLower.includes("bachelor") || textLower.includes("b.tech") || textLower.includes("b.e.") || textLower.includes("bca") || textLower.includes("b.s.")) {
    detectedEducation = "Bachelor's Degree (B.Tech / B.E. / BCA / B.S.)";
  }

  // 5. Calculate Transparent Match Score (0 - 100)
  // Skills weight: 60%
  const skillRatio = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) : 0.5;
  const skillScore = skillRatio * 60;

  // Experience weight: 25%
  const reqExp = job.experienceRequired || 0;
  let expScore = 15;
  if (reqExp === 0) {
    expScore = 25;
  } else if (detectedExpYears >= reqExp) {
    expScore = 25;
  } else {
    expScore = Math.max(5, (detectedExpYears / reqExp) * 25);
  }

  // Education/Domain Relevance: 15%
  let eduScore = 12;
  if (textLower.includes("computer science") || textLower.includes("software engineering") || textLower.includes("information technology")) {
    eduScore = 15;
  }

  const totalScore = Math.min(100, Math.max(10, Math.round(skillScore + expScore + eduScore)));

  // 6. Generate Reasoning
  let reasoning = "";
  if (matchedSkills.length === requiredSkills.length) {
    reasoning = `Strong fit. Candidate demonstrates proficiency in all ${matchedSkills.length} required skills (${matchedSkills.join(", ")}). Experience profile (~${detectedExpYears} yrs) aligns with role requirements.`;
  } else if (matchedSkills.length > 0) {
    reasoning = `Moderate fit. Candidate matches ${matchedSkills.length} of ${requiredSkills.length} required skills (${matchedSkills.join(", ")}). Missing key skills: ${missingSkills.join(", ")}. Estimated ~${detectedExpYears} years of experience.`;
  } else {
    reasoning = `Low alignment. Resume does not mention primary required skills (${requiredSkills.join(", ")}). Additional training or review required.`;
  }

  return {
    extractedData: {
      skills: detectedSkills.length > 0 ? detectedSkills : matchedSkills,
      education: detectedEducation,
      experienceYears: detectedExpYears,
      summary: `Candidate with background in ${detectedSkills.slice(0, 4).join(", ") || "software development"} and estimated ${detectedExpYears} years of experience.`
    },
    matchResult: {
      matchScore: totalScore,
      matchedSkills,
      missingSkills,
      scoreReasoning: reasoning
    }
  };
}

/**
 * Screen Resume with Real Google Gemini LLM API
 *
 * @param {string} resumeText - Extracted resume plain text
 * @param {object} job - Target job document from MongoDB
 * @returns {Promise<object>} Structured AI screening and matching result
 */
async function screenResumeWithAI(resumeText, job) {
  const apiKey = process.env.GEMINI_API_KEY;

  // If API key is missing or placeholder, use NLP analyzer
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.log("ℹ️ GEMINI_API_KEY not configured in server/.env — Using NLP-based resume analyzer.");
    return performNLPAnalysis(resumeText, job);
  }

  try {
    console.log("🤖 Calling Google Gemini LLM API for resume screening...");
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const requiredSkillsList = Array.isArray(job.requiredSkills)
      ? job.requiredSkills.join(", ")
      : job.requiredSkills;

    const prompt = `
You are an expert technical recruiter and HR screening specialist.
Evaluate the candidate's resume text against the target job requirements.

TARGET JOB DETAILS:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${requiredSkillsList}
- Minimum Experience: ${job.experienceRequired} years
- Education Required: ${job.educationRequired || "Bachelor's Degree in Computer Science or related field"}

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

Instructions:
1. Extract candidate technical and professional skills, education, and years of experience found in the resume.
2. Compare the candidate's resume with the job's required skills.
3. Determine which required skills are MATCHED.
4. Determine which required skills are MISSING.
5. Compute a fair, realistic match score between 0 and 100 based on:
   - Skills alignment (approx. 50% weight)
   - Experience relevance (approx. 30% weight)
   - Domain/education relevance (approx. 20% weight)
6. Write a concise, 2-3 sentence explanation justifying the match score.

You MUST respond strictly in the following JSON structure with no markdown code fences or conversational text:
{
  "extractedData": {
    "skills": ["string"],
    "education": "string",
    "experienceYears": number,
    "summary": "string"
  },
  "matchResult": {
    "matchScore": number,
    "matchedSkills": ["string"],
    "missingSkills": ["string"],
    "scoreReasoning": "string"
  }
}
`;

    // Call Gemini API with JSON response format
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    console.log("✅ Gemini API responded successfully.");

    // Parse the structured JSON response
    const parsedResult = JSON.parse(responseText.trim());

    // Validate that required fields exist
    if (
      parsedResult &&
      parsedResult.matchResult &&
      typeof parsedResult.matchResult.matchScore === "number"
    ) {
      // Ensure matchScore is clamped between 0 and 100
      parsedResult.matchResult.matchScore = Math.max(
        0,
        Math.min(100, Math.round(parsedResult.matchResult.matchScore))
      );
      return parsedResult;
    } else {
      console.warn("⚠️ Gemini returned unexpected schema, falling back to NLP parser.");
      return performNLPAnalysis(resumeText, job);
    }
  } catch (error) {
    console.error("❌ Google Gemini API Error:", error.message);
    console.log("🔄 Gracefully falling back to NLP-based resume analyzer.");
    return performNLPAnalysis(resumeText, job);
  }
}

module.exports = {
  screenResumeWithAI,
  performNLPAnalysis,
};