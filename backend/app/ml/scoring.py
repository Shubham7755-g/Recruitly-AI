"""
Scoring and Ranking Machine Learning Module
Calculates TF-IDF Cosine Similarity, Skill Gaps, and 5-Pillar Weighted Score.
"""

from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

DEFAULT_WEIGHTS = {
    "skills": 40.0,
    "semantic_similarity": 30.0,
    "experience": 15.0,
    "education": 10.0,
    "projects": 5.0
}

def calculate_cosine_similarity(resume_text: str, job_text: str) -> float:
    """Calculates TF-IDF vector Cosine Similarity between resume and job description."""
    if not resume_text or not job_text:
        return 0.0
    
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000, ngram_range=(1, 2))
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(sim)
    except Exception:
        return 0.35

def extract_years_of_experience(text: str) -> float:
    """Extracts candidate total years of experience from text using pattern heuristics."""
    patterns = [
        r'(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)',
        r'(?:experience|exp):\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)',
        r'(\d+)\s*(?:years?|yrs?)\s+in\s+software',
    ]
    
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
    return 2.5

def compute_candidate_score(
    resume_text: str,
    extracted_skills: List[str],
    job_required_skills: List[str],
    job_description: str,
    job_req_exp: float,
    job_req_edu: str,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """Computes explainable 0-100 match score and categorizes match tier."""
    if weights is None:
        weights = DEFAULT_WEIGHTS

    # 1. Skill Match (40 pts)
    matched_skills = [s for s in job_required_skills if any(s.lower() == es.lower() for es in extracted_skills)]
    missing_skills = [s for s in job_required_skills if s not in matched_skills]
    
    skill_ratio = len(matched_skills) / max(len(job_required_skills), 1)
    skill_score = skill_ratio * (weights.get("skills", 40.0))

    # 2. Semantic Similarity (30 pts)
    cos_sim = calculate_cosine_similarity(resume_text, job_description)
    semantic_score = min(cos_sim * 1.2, 1.0) * (weights.get("semantic_similarity", 30.0))

    # 3. Experience (15 pts)
    cand_exp = extract_years_of_experience(resume_text)
    if job_req_exp > 0:
        exp_ratio = min(cand_exp / job_req_exp, 1.25)
    else:
        exp_ratio = 1.0
    exp_score = min(exp_ratio, 1.0) * (weights.get("experience", 15.0))

    # 4. Education (10 pts)
    has_degree = bool(re.search(r'\b(bachelor|master|b\.tech|m\.tech|ph\.d|bs|ms|degree)\b', resume_text, re.IGNORECASE))
    edu_score = (weights.get("education", 10.0)) if has_degree else (weights.get("education", 10.0) * 0.6)

    # 5. Projects (5 pts)
    has_projects = bool(re.search(r'\b(projects?|portfolio|github|repository|developed|built)\b', resume_text, re.IGNORECASE))
    proj_score = (weights.get("projects", 5.0)) if has_projects else (weights.get("projects", 5.0) * 0.5)

    total_score = round(skill_score + semantic_score + exp_score + edu_score + proj_score)
    total_score = max(0, min(100, total_score))

    # Recommendation tier
    if total_score >= 90:
        recommendation = "Excellent Match"
    elif total_score >= 80:
        recommendation = "Strong Match"
    elif total_score >= 70:
        recommendation = "Good Match"
    elif total_score >= 60:
        recommendation = "Moderate Match"
    else:
        recommendation = "Low Match"

    return {
        "match_score": total_score,
        "recommendation": recommendation,
        "score_breakdown": {
            "skills": round(skill_score, 1),
            "semantic_similarity": round(semantic_score, 1),
            "experience": round(exp_score, 1),
            "education": round(edu_score, 1),
            "projects": round(proj_score, 1),
            "total": total_score
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "experience": {
            "years": cand_exp,
            "required_years": job_req_exp,
            "meets_requirement": cand_exp >= job_req_exp
        }
    }
