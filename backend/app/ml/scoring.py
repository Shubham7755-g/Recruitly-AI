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

def _experience_section(text: str) -> str:
    """Return the likely work-experience section without education/projects."""
    if not text:
        return ""
    pattern = re.compile(
        r"(?is)(?:^|\n)\s*(?:professional\s+experience|work\s+experience|experience|employment\s+history|employment|internship)\s*[:\-]?\s*\n?(.*?)(?=\n\s*(?:education|academic|projects?|certifications?|skills|technical\s+skills|achievements?|references|publications?)\s*[:\-]?\s*\n|$)"
    )
    match = pattern.search(text)
    return match.group(1).strip() if match else text


def _months_between(start_year: int, start_month: int, end_year: int, end_month: int) -> float:
    months = (end_year - start_year) * 12 + (end_month - start_month)
    return max(0, months) / 12.0


def extract_years_of_experience(text: str) -> float:
    """Extract realistic experience years; never invent a 2.5-year default."""
    if not text:
        return 0.0

    section = _experience_section(text)

    # Prefer explicit totals such as "6 years of experience".
    explicit = re.findall(
        r"(?<!\d)(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b(?:\s+of)?\s+(?:professional\s+|work\s+|industry\s+|relevant\s+)?experience\b",
        section,
        re.IGNORECASE,
    )
    if explicit:
        return round(max(float(x) for x in explicit), 1)

    # Also accept concise lines such as "Experience: 4 years".
    concise = re.findall(
        r"(?:experience|exp)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b",
        section,
        re.IGNORECASE,
    )
    if concise:
        return round(max(float(x) for x in concise), 1)

    # Calculate date ranges inside the experience section.
    current_year = 2026
    current_month = 8
    total_months = 0

    month_names = {
        "jan": 1, "january": 1, "feb": 2, "february": 2,
        "mar": 3, "march": 3, "apr": 4, "april": 4,
        "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
        "aug": 8, "august": 8, "sep": 9, "sept": 9, "september": 9,
        "oct": 10, "october": 10, "nov": 11, "november": 11,
        "dec": 12, "december": 12,
    }

    # Month + year ranges: Jan 2022 - Mar 2024 / Jan 2022 to Present.
    month_year = re.compile(
        r"(?i)(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(19\d{2}|20\d{2})\s*(?:-|–|—|to)\s*(?:(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?(19\d{2}|20\d{2}|present|current)")
    for m in month_year.finditer(section):
        sm, sy = month_names[m.group(1).lower()], int(m.group(2))
        end_token = m.group(4)
        if end_token.lower() in {"present", "current"}:
            ey, em = current_year, current_month
        else:
            ey = int(end_token)
            em = month_names[m.group(3).lower()] if m.group(3) else 12
        if ey >= sy and ey - sy <= 20:
            total_months += (ey - sy) * 12 + (em - sm)

    # Year-only ranges: 2021 - 2024 / 2022 - Present.
    year_ranges = re.findall(
        r"\b(19\d{2}|20\d{2})\s*(?:-|–|—|to)\s*(19\d{2}|20\d{2}|present|current)\b",
        section,
        re.IGNORECASE,
    )
    for sy_s, ey_s in year_ranges:
        sy = int(sy_s)
        ey = current_year if ey_s.lower() in {"present", "current"} else int(ey_s)
        if ey >= sy and ey - sy <= 20:
            total_months += (ey - sy) * 12

    if total_months > 0:
        return round(total_months / 12.0, 1)

    return 0.0


def extract_education(text: str, required_education: str) -> Dict[str, Any]:
    """Extract the actual degree/institution instead of returning a generic flag."""
    if not text:
        return {"degree": "Not detected", "meets_requirement": False}

    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines() if line.strip()]
    degree_patterns = [
        (5, r"\b(?:ph\.?d|doctorate|doctoral)\b", "Ph.D."),
        (4, r"\b(?:m\.?s\.?|master(?:'s)?|m\.?tech|mca|mba)\b", "Master's"),
        (3, r"\b(?:b\.?tech|b\.?e\.?|b\.?s\.?|bca|bachelor(?:'s)?|b\.?sc)\b", "Bachelor's"),
        (2, r"\b(?:associate|diploma|polytechnic)\b", "Diploma / Associate"),
    ]

    detected_rank = 0
    degree = "Not detected"
    degree_line = ""
    for line in lines:
        for rank, pattern, label in degree_patterns:
            if re.search(pattern, line, re.IGNORECASE) and rank > detected_rank:
                detected_rank = rank
                degree_line = line
                degree = line[:120]
                break

    # Normalize common degree lines into the clean presentation used by the UI.
    if detected_rank == 3:
        degree = degree_line if degree_line else "Bachelor's"
    elif detected_rank == 4:
        degree = degree_line if degree_line else "Master's"
    elif detected_rank == 5:
        degree = degree_line if degree_line else "Ph.D."
    elif detected_rank == 2:
        degree = degree_line if degree_line else "Diploma / Associate"

    # If the degree line is noisy, use a focused phrase from it.
    if degree_line:
        cleaned = re.sub(r"\s+", " ", degree_line).strip(" -:|•")
        degree = cleaned[:120]

    institution = None
    for line in lines:
        if re.search(r"\b(?:university|institute|college|school|academy|technology)\b", line, re.IGNORECASE):
            if len(line) <= 120 and not re.search(r"@|https?://", line, re.IGNORECASE):
                institution = line
                break

    graduation_year = None
    # Prefer a year near education-related wording.
    edu_blob = "\n".join(lines)
    grad_match = re.search(r"(?:graduat(?:ed|ion)|class\s+of|batch\s+of|passing\s+year|\b(?:19|20)\d{2}\b)\D{0,30}((?:19|20)\d{2})", edu_blob, re.IGNORECASE)
    if grad_match:
        graduation_year = grad_match.group(1)

    required_rank = 3
    if re.search(r"ph\.?d|doctorate", required_education or "", re.IGNORECASE):
        required_rank = 5
    elif re.search(r"master|m\.?s|m\.?tech|mca|mba", required_education or "", re.IGNORECASE):
        required_rank = 4
    elif re.search(r"associate|diploma", required_education or "", re.IGNORECASE):
        required_rank = 2

    return {
        "degree": degree,
        "institution": institution,
        "graduation_year": graduation_year,
        "meets_requirement": detected_rank >= required_rank if detected_rank else False,
    }


def extract_projects(text: str) -> List[Dict[str, Any]]:
    projects: List[Dict[str, Any]] = []
    if not text:
        return projects
    section = re.search(
        r"(?is)(?:^|\n)\s*projects?\s*[:\-]?\s*\n?(.*?)(?=\n\s*(?:education|experience|skills|certifications?|achievements?|references)\s*[:\-]?\s*\n|$)",
        text,
    )
    blob = section.group(1) if section else ""
    if blob:
        chunks = [re.sub(r"\s+", " ", x).strip(" -•") for x in blob.splitlines() if x.strip()]
        for chunk in chunks[:3]:
            if len(chunk) >= 8:
                projects.append({
                    "name": chunk[:60],
                    "technologies": [],
                    "relevance": "Medium",
                    "description": chunk[:180],
                })
    return projects


def compute_candidate_score(
    resume_text: str,
    extracted_skills: List[str],
    job_required_skills: List[str],
    job_description: str,
    job_req_exp: float,
    job_req_edu: str,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """Compute explainable 0-100 score and return extracted resume fields."""
    weights = weights or DEFAULT_WEIGHTS
    resume_text = resume_text or ""
    required = job_required_skills or []

    matched_skills = [s for s in required if any(s.lower() == es.lower() for es in extracted_skills)]
    missing_skills = [s for s in required if s.lower() not in {m.lower() for m in matched_skills}]
    additional_skills = [s for s in extracted_skills if s.lower() not in {m.lower() for m in required}]

    skill_ratio = len(matched_skills) / max(len(required), 1)
    skill_score = skill_ratio * weights.get("skills", 40.0)

    cos_sim = calculate_cosine_similarity(resume_text, job_description)
    semantic_score = min(cos_sim * 1.2, 1.0) * weights.get("semantic_similarity", 30.0)

    cand_exp = extract_years_of_experience(resume_text)
    if job_req_exp > 0:
        exp_score = min(cand_exp / job_req_exp, 1.0) * weights.get("experience", 15.0)
    else:
        exp_score = weights.get("experience", 15.0) if cand_exp > 0 else 0.0

    education = extract_education(resume_text, job_req_edu)
    edu_score = weights.get("education", 10.0) if education["meets_requirement"] else (weights.get("education", 10.0) * 0.5 if education["degree"] != "Not detected" else 0.0)

    projects = extract_projects(resume_text)
    project_score = weights.get("projects", 5.0) if projects else 0.0

    total_score = round(skill_score + semantic_score + exp_score + edu_score + project_score)
    total_score = max(0, min(100, total_score))

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

    strengths = []
    weaknesses = []
    if matched_skills:
        strengths.append(f"Matched required skills: {', '.join(matched_skills[:4])}")
    if cand_exp >= job_req_exp and job_req_exp > 0:
        strengths.append(f"Meets the {job_req_exp:g}-year experience requirement")
    if education["meets_requirement"]:
        strengths.append(f"Education detected: {education['degree']}")
    if not matched_skills and required:
        weaknesses.append("No required skills were detected")
    if missing_skills:
        weaknesses.append(f"Missing required skills: {', '.join(missing_skills[:5])}")
    if job_req_exp > 0 and cand_exp < job_req_exp:
        weaknesses.append(f"Experience ({cand_exp:g} yrs) is below the required {job_req_exp:g} yrs")
    if not weaknesses:
        weaknesses.append("No major gaps detected against the supplied requirements")

    return {
        "match_score": total_score,
        "recommendation": recommendation,
        "recommendation_reason": "Score is based on required skills, semantic alignment, experience, education, and projects.",
        "summary": f"{recommendation} candidate with {total_score}% match, {cand_exp:g} years of detected experience, and education: {education['degree']}.",
        "score_breakdown": {
            "skills": round(skill_score, 1),
            "semantic_similarity": round(semantic_score, 1),
            "experience": round(exp_score, 1),
            "education": round(edu_score, 1),
            "projects": round(project_score, 1),
            "total": total_score,
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "additional_skills": additional_skills,
        "experience": {
            "years": cand_exp,
            "required_years": job_req_exp,
            "meets_requirement": cand_exp >= job_req_exp if job_req_exp > 0 else cand_exp > 0,
        },
        "education": education,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "projects": projects,
    }
