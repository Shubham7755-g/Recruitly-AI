"""
FastAPI Screening Router
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import json

from app.services.parser import parse_pdf, parse_docx, extract_contact_info
from app.ml.scoring import compute_candidate_score

router = APIRouter()

# In-memory session store
SESSION_CANDIDATES = []

@router.post("/analyze")
async def analyze_resumes_endpoint(
    job_title: str = Form(...),
    job_description: str = Form(...),
    required_experience: float = Form(0.0),
    required_education: str = Form("Bachelor's"),
    required_skills: str = Form("[]"),  # JSON string array
    files: List[UploadFile] = File(...)
):
    try:
        skills_list = json.loads(required_skills) if isinstance(required_skills, str) else required_skills
    except Exception:
        skills_list = []

    results = []

    for file in files:
        contents = await file.read()
        filename = file.filename
        
        if filename.endswith(".pdf"):
            raw_text = parse_pdf(contents)
        elif filename.endswith(".docx"):
            raw_text = parse_docx(contents)
        else:
            raw_text = contents.decode("utf-8", errors="ignore")

        contact = extract_contact_info(raw_text)
        
        # Extract skills (simple word boundary match against taxonomy)
        extracted_skills = []
        for s in skills_list:
            if s.lower() in raw_text.lower():
                extracted_skills.append(s)

        score_res = compute_candidate_score(
            resume_text=raw_text,
            extracted_skills=extracted_skills,
            job_required_skills=skills_list,
            job_description=job_description,
            job_req_exp=required_experience,
            job_req_edu=required_education
        )

        candidate_obj = {
            "candidate_id": f"cand_{len(results) + 1}",
            "candidate_name": contact["candidate_name"],
            "email": contact["email"],
            "phone": contact["phone"],
            "match_score": score_res["match_score"],
            "recommendation": score_res["recommendation"],
            "score_breakdown": score_res["score_breakdown"],
            "matched_skills": score_res["matched_skills"],
            "missing_skills": score_res["missing_skills"],
            "experience": score_res["experience"],
            "resume_filename": filename,
            "status": "Screened"
        }
        results.append(candidate_obj)

    # Sort & Rank
    results.sort(key=lambda c: c["match_score"], reverse=True)
    for idx, c in enumerate(results):
        c["rank"] = idx + 1

    global SESSION_CANDIDATES
    SESSION_CANDIDATES = results

    return {
        "status": "success",
        "job_title": job_title,
        "processed_count": len(results),
        "candidates": results
    }
