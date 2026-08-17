import { Candidate, EducationInfo, ExperienceInfo, JobDescription, ProjectInfo, RecommendationTier, ScoreBreakdown, ScoringWeights } from '../types';
import { extractSkillsFromText } from './skillTaxonomy';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  skills: 40,
  semantic_similarity: 30,
  experience: 15,
  education: 10,
  projects: 5,
};

// Clean and tokenize text
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
]);

// TF-IDF Cosine Similarity Calculation
export function calculateSemanticSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  // Build Term Frequencies
  const tf1: Record<string, number> = {};
  const tf2: Record<string, number> = {};
  const vocabulary = new Set<string>();

  for (const t of tokens1) {
    tf1[t] = (tf1[t] || 0) + 1;
    vocabulary.add(t);
  }
  for (const t of tokens2) {
    tf2[t] = (tf2[t] || 0) + 1;
    vocabulary.add(t);
  }

  // Calculate TF-IDF vectors (in 2-document corpus, IDF = log(1 + 2/df))
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const term of vocabulary) {
    const count1 = tf1[term] || 0;
    const count2 = tf2[term] || 0;
    
    // Document frequency
    const df = (count1 > 0 ? 1 : 0) + (count2 > 0 ? 1 : 0);
    const idf = Math.log(1 + 2 / df);

    const v1 = (count1 / tokens1.length) * idf;
    const v2 = (count2 / tokens2.length) * idf;

    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  if (mag1 === 0 || mag2 === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  
  // Scale and normalize to 0 - 1 range, smoothing baseline overlap
  return Math.min(1, Math.max(0, similarity * 1.6));
}

// Resume Field Extraction Utilities
export function extractCandidateName(text: string, filename?: string): string {
  if (!text || !text.trim()) {
    return 'Candidate';
  }

  // ---------------------------------------------------------
  // Normalize extracted resume text
  // ---------------------------------------------------------
  const normalizedText = text
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // ---------------------------------------------------------
  // Validate whether a string looks like a real person's name
  // ---------------------------------------------------------
  const isValidName = (value: string): boolean => {
    let name = value
      .replace(
        /^(full\s+name|candidate\s+name|name)\s*[:\-]\s*/i,
        ''
      )
      .trim();

    name = name
      .replace(/\s+/g, ' ')
      .trim();

    if (!name || name.length < 3 || name.length > 60) {
      return false;
    }

    // Names normally contain 2–5 words
    const words = name.split(' ');

    if (words.length < 2 || words.length > 5) {
      return false;
    }

    // Never accept email / URL
    if (
      name.includes('@') ||
      /https?:\/\//i.test(name) ||
      /www\./i.test(name)
    ) {
      return false;
    }

    // Never accept anything containing numbers
    if (/\d/.test(name)) {
      return false;
    }

    // Every word should look like a person's name
    if (
      !words.every(word =>
        /^[A-Za-z][A-Za-z.'’-]*$/.test(word)
      )
    ) {
      return false;
    }

    const lower = name.toLowerCase();

    // -------------------------------------------------------
    // Resume headings / technical terms that are NOT names
    // -------------------------------------------------------
    const excludedPhrases = [
      'resume',
      'curriculum vitae',
      'professional resume',
      'profile',
      'career profile',
      'professional profile',
      'about me',
      'contact',
      'contact information',
      'personal information',
      'objective',
      'career objective',
      'summary',
      'professional summary',
      'experience',
      'work experience',
      'education',
      'skills',
      'technical skills',
      'skills summary',
      'projects',
      'certifications',
      'achievements',
      'references',

      // Technical / job related phrases
      'machine learning',
      'deep learning',
      'data science',
      'computer science',
      'artificial intelligence',
      'software engineering',
      'software development',
      'web development',
      'frontend developer',
      'backend developer',
      'full stack developer',
      'full-stack developer',
      'software developer',
      'data scientist',
      'machine learning engineer',
      'ai engineer',
      'ml engineer',
    ];

    if (excludedPhrases.includes(lower)) {
      return false;
    }

    // -------------------------------------------------------
    // Individual words that strongly indicate a job title
    // -------------------------------------------------------
    const titleWords = new Set([
      'engineer',
      'developer',
      'designer',
      'manager',
      'student',
      'intern',
      'analyst',
      'scientist',
      'consultant',
      'architect',
      'administrator',
      'recruiter',
      'director',
      'professor',
      'specialist',
      'developer',
      'programmer',
      'technician',
      'lead',
      'internship',
    ]);

    if (
      words.some(word =>
        titleWords.has(word.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  };

  // ---------------------------------------------------------
  // 1. Explicit name labels
  // ---------------------------------------------------------
  const labelPatterns = [
    /(?:full\s+name|candidate\s+name|name)\s*[:\-]\s*([A-Za-z][A-Za-z.'’-]*(?:\s+[A-Za-z][A-Za-z.'’-]*){1,4})/i,
  ];

  for (const pattern of labelPatterns) {
    const match = normalizedText.match(pattern);

    if (match && isValidName(match[1])) {
      return match[1].trim();
    }
  }

  // ---------------------------------------------------------
  // 2. Search first part of resume for an actual name
  // ---------------------------------------------------------
  const firstPart = text
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 20);

  for (const line of firstPart) {
    let candidate = line
      .replace(
        /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/gi,
        ' '
      )
      .replace(
        /(?:\+?\d[\d\s().-]{7,}\d)/g,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim();

    if (isValidName(candidate)) {
      return candidate;
    }
  }

  // ---------------------------------------------------------
  // 3. Try extracting a name from the email address
  // ---------------------------------------------------------
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/
  );

  if (emailMatch) {
    const email = emailMatch[0]
      .split('@')[0]
      .toLowerCase();

    // Remove common numeric suffixes / years / IDs
    const withoutNumbers = email
      .replace(/\d+/g, '')
      .replace(/[^a-z._-]/g, '');

    const parts = withoutNumbers
      .split(/[._-]+/)
      .filter(Boolean);

    // -------------------------------------------------------
    // Example:
    // shreya.singh2151@gmail.com
    // -> Shreya Singh
    // -------------------------------------------------------
    if (parts.length >= 2) {
      const possibleName = parts
        .slice(0, 3)
        .map(
          part =>
            part.charAt(0).toUpperCase() +
            part.slice(1)
        )
        .join(' ');

      if (isValidName(possibleName)) {
        return possibleName;
      }
    }

    // -------------------------------------------------------
    // Example:
    // shreyasrivastava020806@gmail.com
    // -> Shreya Srivastava
    //
    // Common Indian name patterns are handled here.
    // -------------------------------------------------------
    const compact = withoutNumbers;

    const commonFirstNames = [
      'shreya',
      'priya',
      'pooja',
      'neha',
      'riya',
      'ananya',
      'arjun',
      'rahul',
      'rohit',
      'sumit',
      'sudeep',
      'shubham',
      'aman',
      'aditya',
      'ayush',
      'nikhil',
      'simran',
      'sakshi',
      'muskan',
      'kavya',
    ];

    for (const firstName of commonFirstNames) {
      if (compact.startsWith(firstName) && compact.length > firstName.length + 2) {
        const lastName = compact.slice(firstName.length);

        const possibleName =
          firstName.charAt(0).toUpperCase() +
          firstName.slice(1) +
          ' ' +
          lastName.charAt(0).toUpperCase() +
          lastName.slice(1);

        if (isValidName(possibleName)) {
          return possibleName;
        }
      }
    }
  }

  // ---------------------------------------------------------
  // 4. Filename fallback
  // ---------------------------------------------------------
  if (filename) {
    const cleanFilename = filename
      .replace(/\.(pdf|docx|txt)$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(
        /\b(resume|cv|profile|candidate|document|final|copy|v\d+|\d+)\b/gi,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim();

    if (isValidName(cleanFilename)) {
      return cleanFilename;
    }
  }

  // ---------------------------------------------------------
  // 5. Final fallback
  // ---------------------------------------------------------
  return 'Candidate';
}
export function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : '';
}

export function extractPhone(text: string): string {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : '';
}

export function extractExperience(text: string, requiredYears: number): ExperienceInfo {
  // Look for explicit experience mentions like "4+ years of experience", "3.5 years in software", "5 yrs"
  let totalYears = 0;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|work|industry)/i);
  if (expMatch) {
    totalYears = parseFloat(expMatch[1]);
  } else {
    // Try to calculate from year ranges: e.g., "2019 - 2023", "2020 - Present"
    const currentYear = 2026;
    const yearRanges = text.matchAll(/\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|Present|Current)\b/gi);
    let calculatedSpan = 0;
    for (const match of yearRanges) {
      const start = parseInt(match[1], 10);
      const end = /present|current/i.test(match[2]) ? currentYear : parseInt(match[2], 10);
      if (end >= start && end - start <= 20) {
        calculatedSpan += (end - start);
      }
    }
    totalYears = calculatedSpan > 0 ? calculatedSpan : 1.5; // default reasonable estimate if detected
  }

  // Extract roles / titles
  const rolesFound: string[] = [];
  const commonRoles = [
    'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer',
    'Backend Developer', 'Machine Learning Engineer', 'Data Scientist', 'DevOps Engineer',
    'Cloud Architect', 'Technical Lead', 'Data Analyst', 'Product Engineer', 'Intern'
  ];
  for (const role of commonRoles) {
    if (new RegExp(`\\b${role}\\b`, 'i').test(text)) {
      rolesFound.push(role);
    }
  }

  return {
    years: Math.round(totalYears * 10) / 10,
    required_years: requiredYears,
    meets_requirement: totalYears >= requiredYears,
    roles: rolesFound.slice(0, 4),
  };
}

export function extractEducation(text: string, requiredEducation: string): EducationInfo {
  const degrees = [
    { name: 'Ph.D. in Computer Science', pattern: /\b(ph\.?d|doctorate)\b/i, rank: 5 },
    { name: 'M.S. in Computer Science / Data Science', pattern: /\b(m\.?s|master'?s|m\.?tech|mca)\b/i, rank: 4 },
    { name: 'B.Tech / B.S. in Computer Science', pattern: /\b(b\.?tech|b\.?s\.?|bachelor'?s|b\.?e\.?|bca)\b/i, rank: 3 },
    { name: 'Associate Degree', pattern: /\b(associate|diploma)\b/i, rank: 2 },
  ];

  let detectedDegree = 'Not detected';
  let candidateRank = 1;

  for (const deg of degrees) {
    if (deg.pattern.test(text)) {
      detectedDegree = deg.name;
      candidateRank = deg.rank;
      break;
    }
  }

  // Check required education rank
  let reqRank = 3;
  if (/master|m\.?s|m\.?tech|mca/i.test(requiredEducation)) reqRank = 4;
  if (/ph\.?d|doctorate/i.test(requiredEducation)) reqRank = 5;
  if (/associate|diploma/i.test(requiredEducation)) reqRank = 2;

  // Extract institution
  const institutionMatch = text.match(/(?:university|institute|college|academy)\s+of\s+[A-Za-z\s]+|[A-Za-z\s]+(?:university|institute of technology|college)/i);
  const institution = institutionMatch ? institutionMatch[0].trim().slice(0, 50) : undefined;

  // Graduation year
  const gradMatch = text.match(/(?:graduated|class of|batch of|\b)\s*(20\d{2})\b/i);
  const graduation_year = gradMatch ? gradMatch[1] : undefined;

  return {
    degree: detectedDegree,
    institution,
    graduation_year,
    meets_requirement: candidateRank >= reqRank || detectedDegree !== 'Not detected',
  };
}

export function extractProjects(text: string): ProjectInfo[] {
  const projects: ProjectInfo[] = [];
  
  // Check for project sections or keywords
  const projectRegex = /(?:project|built|developed|designed|implemented)\s*[:\-–]\s*([^\n.]+)/gi;
  const matches = Array.from(text.matchAll(projectRegex));

  for (let i = 0; i < Math.min(matches.length, 3); i++) {
    const rawDesc = matches[i][1].trim();
    if (rawDesc.length > 10) {
      const skillsInProject = extractSkillsFromText(rawDesc);
      projects.push({
        name: `Project: ${rawDesc.slice(0, 30)}...`,
        description: rawDesc.slice(0, 120),
        technologies: skillsInProject.length > 0 ? skillsInProject : ['Python', 'API'],
        relevance: skillsInProject.length >= 2 ? 'High' : 'Medium',
      });
    }
  }

  if (projects.length === 0) {
    // Provide general extracted highlights
    const detectedSkills = extractSkillsFromText(text);
    if (detectedSkills.length > 0) {
      projects.push({
        name: 'Technical Implementation & Architecture',
        description: `Applied ${detectedSkills.slice(0, 3).join(', ')} across engineering modules and system workflows.`,
        technologies: detectedSkills.slice(0, 4),
        relevance: 'High',
      });
    }
  }

  return projects;
}

export function generateStrengthsAndWeaknesses(
  matchedSkills: string[],
  missingSkills: string[],
  experience: ExperienceInfo,
  education: EducationInfo,
  semanticScore: number
): { strengths: string[]; weaknesses: string[]; recommendationReason: string } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Strengths
  if (matchedSkills.length >= 4) {
    strengths.push(`Strong coverage of core technical stack (${matchedSkills.slice(0, 3).join(', ')})`);
  } else if (matchedSkills.length > 0) {
    strengths.push(`Demonstrated proficiency in ${matchedSkills.join(', ')}`);
  }

  if (experience.meets_requirement) {
    strengths.push(`Meets experience requirement with ${experience.years} years of relevant domain work`);
  }

  if (semanticScore >= 20) {
    strengths.push('High contextual alignment between resume project descriptions and the job requirements');
  }

  if (education.meets_requirement && education.degree !== 'Not detected') {
    strengths.push(`Holds relevant qualification: ${education.degree}`);
  }

  // Weaknesses
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing key required skill${missingSkills.length > 1 ? 's' : ''}: ${missingSkills.join(', ')}`);
  }

  if (!experience.meets_requirement) {
    weaknesses.push(`Experience (${experience.years} yrs) is below the required target (${experience.required_years} yrs)`);
  }

  if (semanticScore < 15) {
    weaknesses.push('Lower semantic overlap with specialized job description responsibilities');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No significant gaps identified against primary baseline requirements');
  }

  // Recommendation Reason
  let recommendationReason = '';
  if (matchedSkills.length >= 4 && experience.meets_requirement) {
    recommendationReason = 'Strong candidate with verified skill overlap and requisite industry experience. Highly recommended for technical screening.';
  } else if (matchedSkills.length >= 2 && experience.meets_requirement) {
    recommendationReason = 'Candidate meets general prerequisites and core skills, though onboarding or training on missing tools may be beneficial.';
  } else if (missingSkills.length > 2) {
    recommendationReason = 'Candidate has valuable competencies but exhibits noticeable gaps in required critical toolchains.';
  } else {
    recommendationReason = 'Partial match against job criteria. Best evaluated for secondary or adjacently aligned positions.';
  }

  return { strengths, weaknesses, recommendationReason };
}

// Master Deterministic Scoring Algorithm
export function scoreCandidate(
  resumeText: string,
  filename: string,
  job: JobDescription,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Candidate {
  const candidateName = extractCandidateName(resumeText, filename);
  const email = extractEmail(resumeText);
  const phone = extractPhone(resumeText);

  // Extract skills from resume and job description
  const candidateSkills = extractSkillsFromText(resumeText);
  const requiredSkills = job.required_skills.length > 0 
    ? job.required_skills 
    : extractSkillsFromText(job.description);

  // Skill Matching
  const reqSkillSet = new Set(requiredSkills.map(s => s.toLowerCase()));
  const candSkillSet = new Set(candidateSkills.map(s => s.toLowerCase()));

  const matched_skills: string[] = [];
  const missing_skills: string[] = [];

  for (const req of requiredSkills) {
    if (candSkillSet.has(req.toLowerCase())) {
      matched_skills.push(req);
    } else {
      missing_skills.push(req);
    }
  }

  const additional_skills = candidateSkills.filter(
    s => !reqSkillSet.has(s.toLowerCase())
  );

  // 1. Skill Score (Max: weights.skills, default 40)
  const skillRatio = requiredSkills.length > 0 ? matched_skills.length / requiredSkills.length : 0.8;
  const rawSkillScore = skillRatio * weights.skills;

  // 2. Semantic Similarity Score (Max: weights.semantic_similarity, default 30)
  const similarity = calculateSemanticSimilarity(job.description, resumeText);
  const rawSemanticScore = Math.min(weights.semantic_similarity, similarity * weights.semantic_similarity);

  // 3. Experience Score (Max: weights.experience, default 15)
  const experience = extractExperience(resumeText, job.required_experience);
  let rawExpScore = 0;
  if (job.required_experience === 0) {
    rawExpScore = weights.experience;
  } else {
    const expRatio = Math.min(1.5, experience.years / job.required_experience);
    rawExpScore = Math.min(weights.experience, (expRatio >= 1 ? 1 : expRatio * 0.8) * weights.experience);
  }

  // 4. Education Score (Max: weights.education, default 10)
  const education = extractEducation(resumeText, job.required_education);
  const rawEduScore = education.meets_requirement ? weights.education : weights.education * 0.5;

  // 5. Projects Score (Max: weights.projects, default 5)
  const projects = extractProjects(resumeText);
  const rawProjScore = projects.length > 0 ? weights.projects : weights.projects * 0.4;

  // Final Total Score
  const totalScore = Math.min(
    100,
    Math.max(0, Math.round(rawSkillScore + rawSemanticScore + rawExpScore + rawEduScore + rawProjScore))
  );

  const score_breakdown: ScoreBreakdown = {
    skills: Math.round(rawSkillScore * 10) / 10,
    semantic_similarity: Math.round(rawSemanticScore * 10) / 10,
    experience: Math.round(rawExpScore * 10) / 10,
    education: Math.round(rawEduScore * 10) / 10,
    projects: Math.round(rawProjScore * 10) / 10,
    total: totalScore,
  };

  // Assign Recommendation Tier
  let recommendation: RecommendationTier = 'Moderate Match';
  if (totalScore >= 90) recommendation = 'Excellent Match';
  else if (totalScore >= 80) recommendation = 'Strong Match';
  else if (totalScore >= 70) recommendation = 'Good Match';
  else if (totalScore >= 60) recommendation = 'Moderate Match';
  else recommendation = 'Low Match';

  const { strengths, weaknesses, recommendationReason } = generateStrengthsAndWeaknesses(
    matched_skills,
    missing_skills,
    experience,
    education,
    rawSemanticScore
  );

  // Standard Deterministic Summary
  const defaultSummary = `${recommendation} candidate (${totalScore}%) displaying proficiency in ${
    matched_skills.slice(0, 4).join(', ') || 'software development'
  } with ${experience.years} years of industry experience. ${
    missing_skills.length > 0 ? `Primary skill gaps include: ${missingSkillsList(missing_skills)}.` : 'Satisfies core technical prerequisites.'
  }`;

  return {
    candidate_id: `cand_${Math.random().toString(36).substring(2, 9)}`,
    candidate_name: candidateName,
    email: email || `${candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: phone || '+1 (555) 234-5678',
    rank: 1, // dynamically updated after ranking list
    match_score: totalScore,
    matched_skills,
    missing_skills,
    additional_skills,
    experience,
    education,
    recommendation,
    recommendation_reason: recommendationReason,
    summary: defaultSummary,
    ai_generated_summary: false,
    strengths,
    weaknesses,
    projects,
    score_breakdown,
    resume_filename: filename,
    resume_text: resumeText,
    analyzed_at: new Date().toISOString(),
    status: totalScore >= 80 ? 'Shortlisted' : 'Screened',
  };
}

function missingSkillsList(skills: string[]): string {
  if (skills.length <= 3) return skills.join(', ');
  return `${skills.slice(0, 3).join(', ')} (+${skills.length - 3} more)`;
}

export function rankCandidates(candidates: Candidate[]): Candidate[] {
  return [...candidates]
    .sort((a, b) => b.match_score - a.match_score)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
    }));
}
