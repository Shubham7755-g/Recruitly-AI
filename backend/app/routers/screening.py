"""
FastAPI Screening Router

Supports:
1. JSON requests from Express /api/analyze
2. Multipart form-data requests with uploaded files

The current React/Express frontend sends already-extracted
resume text as JSON, so JSON is the primary path.
"""

from fastapi import APIRouter, Request, UploadFile
from typing import List, Any
import json

from app.services.parser import (
    parse_pdf,
    parse_docx,
    extract_contact_info,
)

from app.ml.scoring import compute_candidate_score

print("[Parser] FINAL name extractor loaded")

router = APIRouter()

# In-memory session store
SESSION_CANDIDATES = []


# =========================================================
# Resume Text Extraction
# =========================================================

def get_resume_text(filename: str, contents: bytes) -> str:
    """
    Extract resume text safely from PDF/DOCX/TXT files.

    The Express server normally sends already-extracted resume text
    as UTF-8 bytes while preserving the original filename.
    """

    lower_filename = (filename or "").lower()

    # -----------------------------------------------------
    # PDF
    # -----------------------------------------------------
    if lower_filename.endswith(".pdf"):

        # First try the existing PDF parser.
        try:
            raw_text = parse_pdf(contents) or ""

            if raw_text and len(raw_text.strip()) >= 30:
                return raw_text.strip()

        except Exception as error:
            print(
                f"[FastAPI] PDF parser failed for {filename}: "
                f"{error}"
            )

        # Fallback to PyPDF2 for PDFs that the primary parser
        # cannot decode.
        try:
            from pypdf import PdfReader
            import io

            reader = PdfReader(io.BytesIO(contents))
            pages_text = []

            for page in reader.pages:
                try:
                    page_text = page.extract_text() or ""
                    pages_text.append(page_text)
                except Exception:
                    pass

            raw_text = "\n".join(pages_text).strip()

            if raw_text and len(raw_text) >= 30:
                print(
                    f"[FastAPI] PyPDF2 extracted "
                    f"{len(raw_text)} characters"
                )
                return raw_text

        except Exception as error:
            print(
                f"[FastAPI] PyPDF2 fallback failed: {error}"
            )

        # IMPORTANT:
        # Never decode raw PDF binary as UTF-8. That was causing
        # the PDF binary (%PDF-1.7, compressed streams, etc.) to
        # be passed to the contact extractor and produce
        # "Unknown Candidate".
        print(
            f"[FastAPI] Could not extract readable text "
            f"from PDF: {filename}"
        )

        return ""

    # -----------------------------------------------------
    # DOCX
    # -----------------------------------------------------
    if lower_filename.endswith(".docx"):

        try:
            raw_text = parse_docx(contents) or ""

            if raw_text and len(raw_text.strip()) >= 30:
                return raw_text.strip()

        except Exception as error:
            print(
                f"[FastAPI] DOCX parser failed for {filename}: "
                f"{error}"
            )

        return ""

    # -----------------------------------------------------
    # Plain text / unknown file
    # -----------------------------------------------------
    try:
        return contents.decode(
            "utf-8",
            errors="ignore"
        ).strip()

    except Exception:
        return ""


# =========================================================
# Required Skills Parser
# =========================================================

def normalize_required_skills(required_skills: Any) -> List[str]:
    """
    Convert required_skills into a clean list of strings.

    Supports:
    - JSON list
    - Python list
    - JSON string containing a list
    - Empty / invalid values
    """

    if required_skills is None:
        return []

    # Already a list
    if isinstance(required_skills, list):
        return [
            str(skill).strip()
            for skill in required_skills
            if str(skill).strip()
        ]

    # String
    if isinstance(required_skills, str):

        value = required_skills.strip()

        if not value:
            return []

        try:
            parsed = json.loads(value)

            if isinstance(parsed, list):
                return [
                    str(skill).strip()
                    for skill in parsed
                    if str(skill).strip()
                ]

        except Exception:
            pass

        # Fallback: comma-separated skills
        return [
            skill.strip()
            for skill in value.split(",")
            if skill.strip()
        ]

    return []


# =========================================================
# Resume Processing
# =========================================================

async def process_resume(
    filename: str,
    resume_text: str,
    index: int,
    job_description: str,
    required_experience: float,
    required_education: str,
    skills_list: List[str],
):
    """
    Process one resume and return a candidate object.
    """

    filename = filename or f"resume_{index + 1}.txt"

    # -----------------------------------------------------
    # JSON requests from Express already contain extracted
    # resume text. Do NOT try to parse that text as a PDF just
    # because the original filename ends in .pdf. Doing so was
    # the source of the zlib/startxref errors and Unknown
    # Candidate results.
    # -----------------------------------------------------

    raw_text = (resume_text or "").strip()

    # Compatibility: if a caller accidentally sends actual PDF
    # bytes decoded into a string, recover by parsing the bytes.
    if raw_text.startswith("%PDF-"):
        print(
            f"[FastAPI] Received raw PDF data for {filename}; "
            "using server-side PDF parser."
        )
        raw_text = get_resume_text(
            filename,
            raw_text.encode("latin-1", errors="ignore"),
        )

    print(
        f"[FastAPI] Processing resume: {filename} "
        f"({len(raw_text)} text characters)"
    )

    # -----------------------------------------------------
    # Contact information
    # -----------------------------------------------------

    contact = extract_contact_info(raw_text)

    print(
        f"[FastAPI] Extracted candidate: "
        f"{contact.get('candidate_name')}"
    )

    print(
        f"[FastAPI] Extracted email: "
        f"{contact.get('email')}"
    )

    # -----------------------------------------------------
    # Extract required skills present in resume
    # -----------------------------------------------------

    extracted_skills = []

    resume_lower = raw_text.lower()

    for skill in skills_list:

        skill_text = str(skill).strip()

        if (
            skill_text
            and skill_text.lower() in resume_lower
        ):
            extracted_skills.append(skill_text)

    # -----------------------------------------------------
    # Compute candidate score
    # -----------------------------------------------------

    score_res = compute_candidate_score(
        resume_text=raw_text,
        extracted_skills=extracted_skills,
        job_required_skills=skills_list,
        job_description=job_description,
        job_req_exp=required_experience,
        job_req_edu=required_education,
    )

    # -----------------------------------------------------
    # Candidate basic information
    # -----------------------------------------------------

    candidate_name = (
        contact.get("candidate_name")
        or "Unknown Candidate"
    )

    email = (
        contact.get("email")
        or ""
    )

    phone = (
        contact.get("phone")
        or ""
    )

    # -----------------------------------------------------
    # Candidate object
    # -----------------------------------------------------

    candidate_obj = {
        "candidate_id": f"cand_{index + 1}",

        "candidate_name": candidate_name,

        "email": email,

        "phone": phone,

        "match_score": score_res.get(
            "match_score",
            0,
        ),

        "recommendation": score_res.get(
            "recommendation",
            "Low Match",
        ),

        "recommendation_reason": score_res.get(
            "recommendation_reason",
            "",
        ),

        "summary": score_res.get(
            "summary",
            "",
        ),

        "score_breakdown": score_res.get(
            "score_breakdown",
            {
                "skills": 0,
                "semantic_similarity": 0,
                "experience": 0,
                "education": 0,
                "projects": 0,
                "total": 0,
            },
        ),

        "matched_skills": score_res.get(
            "matched_skills",
            [],
        ),

        "missing_skills": score_res.get(
            "missing_skills",
            [],
        ),

        "additional_skills": score_res.get(
            "additional_skills",
            [],
        ),

        "experience": score_res.get(
            "experience",
            {
                "years": 0,
                "required_years": required_experience,
                "meets_requirement": False,
            },
        ),

        "education": score_res.get(
            "education",
            {
                "degree": "Not detected",
                "meets_requirement": False,
            },
        ),

        "strengths": score_res.get(
            "strengths",
            [],
        ),

        "weaknesses": score_res.get(
            "weaknesses",
            [],
        ),

        "projects": score_res.get(
            "projects",
            [],
        ),

        "resume_filename": filename,

        "resume_text": raw_text,

        "analyzed_at": __import__(
            "datetime"
        ).datetime.now(
            __import__(
                "datetime"
            ).timezone.utc
        ).isoformat(),

        "status": (
            "Shortlisted"
            if score_res.get("match_score", 0) >= 80
            else "Screened"
        ),

        "ai_generated_summary": False,

        "rank": 1,
    }

    return candidate_obj


# =========================================================
# Analyze Endpoint
# =========================================================

@router.post("/analyze")
async def analyze_resumes_endpoint(
    request: Request,
):
    """
    Analyze resumes.

    Primary format from Express:

    {
        "job_title": "...",
        "job_description": "...",
        "required_experience": 0,
        "required_education": "...",
        "required_skills": [],
        "weights": null,
        "resumes": [
            {
                "filename": "resume.pdf",
                "text": "resume text..."
            }
        ]
    }

    Multipart form-data is also supported for compatibility.
    """

    global SESSION_CANDIDATES

    # =====================================================
    # Read request body
    # =====================================================

    content_type = (
        request.headers.get(
            "content-type",
            "",
        ).lower()
    )

    job_title = ""
    job_description = ""
    required_experience = 0.0
    required_education = "Bachelor's"
    required_skills: Any = []
    resumes = []

    # =====================================================
    # JSON REQUEST
    #
    # This is what server.ts currently sends.
    # =====================================================

    if "application/json" in content_type:

        try:
            body = await request.json()

        except Exception as error:

            return {
                "status": "error",
                "error": (
                    f"Invalid JSON request: {error}"
                ),
            }

        job_title = str(
            body.get(
                "job_title",
                "Untitled Job",
            )
        )

        job_description = str(
            body.get(
                "job_description",
                "",
            )
        )

        try:
            required_experience = float(
                body.get(
                    "required_experience",
                    0,
                )
                or 0
            )
        except Exception:
            required_experience = 0.0

        required_education = str(
            body.get(
                "required_education",
                "Bachelor's",
            )
            or "Bachelor's"
        )

        required_skills = body.get(
            "required_skills",
            [],
        )

        resumes = body.get(
            "resumes",
            [],
        )

        print(
            "[FastAPI] Received JSON request"
        )

    # =====================================================
    # MULTIPART REQUEST
    #
    # Kept for compatibility with direct file uploads.
    # =====================================================

    else:

        try:
            form = await request.form()

        except Exception as error:

            return {
                "status": "error",
                "error": (
                    f"Unable to read form data: {error}"
                ),
            }

        job_title = str(
            form.get(
                "job_title",
                "Untitled Job",
            )
        )

        job_description = str(
            form.get(
                "job_description",
                "",
            )
        )

        try:
            required_experience = float(
                form.get(
                    "required_experience",
                    0,
                )
                or 0
            )
        except Exception:
            required_experience = 0.0

        required_education = str(
            form.get(
                "required_education",
                "Bachelor's",
            )
            or "Bachelor's"
        )

        required_skills = form.get(
            "required_skills",
            "[]",
        )

        # Collect uploaded files
        for key, value in form.multi_items():

            if isinstance(value, UploadFile) or hasattr(value, "filename") and hasattr(value, "read"):

                file_bytes = await value.read()
                filename = value.filename or "resume.txt"

                # Parse the ORIGINAL bytes on the backend. Never decode PDF
                # binary as UTF-8; that produces corrupted text and causes
                # candidate extraction to fail.
                text = get_resume_text(filename, file_bytes)

                resumes.append(
                    {
                        "filename": filename,
                        "text": text,
                    }
                )

        print(
            "[FastAPI] Received multipart request"
        )

    # =====================================================
    # Validate job description
    # =====================================================

    if not job_description.strip():

        return {
            "status": "error",
            "error": "Missing job description",
        }

    # =====================================================
    # Normalize skills
    # =====================================================

    skills_list = normalize_required_skills(
        required_skills
    )

    # =====================================================
    # Validate resumes
    # =====================================================

    if not isinstance(resumes, list):

        return {
            "status": "error",
            "error": "Resumes must be a list",
        }

    if len(resumes) == 0:

        return {
            "status": "error",
            "error": "No resumes received",
        }

    print(
        f"[FastAPI] Processing "
        f"{len(resumes)} resume(s)"
    )

    # =====================================================
    # Process all resumes
    # =====================================================

    results = []

    for index, resume in enumerate(resumes):

        if not isinstance(resume, dict):
            # Preserve the one-to-one relationship between uploaded files
            # and returned candidates even if a malformed item reaches us.
            results.append({
                "candidate_id": f"cand_{index + 1}",
                "candidate_name": "Unknown Candidate",
                "email": "",
                "phone": "",
                "match_score": 0,
                "recommendation": "Low Match",
                "recommendation_reason": "Resume item could not be processed.",
                "summary": "Resume could not be processed.",
                "score_breakdown": {"skills": 0, "semantic_similarity": 0, "experience": 0, "education": 0, "projects": 0, "total": 0},
                "matched_skills": [],
                "missing_skills": skills_list,
                "additional_skills": [],
                "experience": {"years": 0, "required_years": required_experience, "meets_requirement": False},
                "education": {"degree": "Not detected", "meets_requirement": False},
                "strengths": [],
                "weaknesses": ["Resume item could not be processed."],
                "projects": [],
                "resume_filename": f"resume_{index + 1}.txt",
                "resume_text": "",
                "analyzed_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
                "status": "Screened",
                "ai_generated_summary": False,
                "rank": 1,
                "processing_error": "Invalid resume item",
            })
            continue

        filename = str(
            resume.get(
                "filename",
                f"resume_{index + 1}.txt",
            )
        )

        resume_text = str(
            resume.get(
                "text",
                "",
            )
            or ""
        )

        try:

            candidate = await process_resume(
                filename=filename,
                resume_text=resume_text,
                index=index,
                job_description=job_description,
                required_experience=required_experience,
                required_education=required_education,
                skills_list=skills_list,
            )

            results.append(candidate)

        except Exception as error:

            print(
                f"[FastAPI] Error processing "
                f"{filename}: {error}"
            )

            # Do not silently drop a resume. Return a visible candidate row
            # so the UI count always matches the number of submitted files.
            results.append({
                "candidate_id": f"cand_{index + 1}",
                "candidate_name": "Unknown Candidate",
                "email": "",
                "phone": "",
                "match_score": 0,
                "recommendation": "Low Match",
                "recommendation_reason": "Resume processing failed; manual review required.",
                "summary": "Resume processing failed; manual review required.",
                "score_breakdown": {"skills": 0, "semantic_similarity": 0, "experience": 0, "education": 0, "projects": 0, "total": 0},
                "matched_skills": [],
                "missing_skills": skills_list,
                "additional_skills": [],
                "experience": {"years": 0, "required_years": required_experience, "meets_requirement": False},
                "education": {"degree": "Not detected", "meets_requirement": False},
                "strengths": [],
                "weaknesses": ["Resume processing failed; manual review required."],
                "projects": [],
                "resume_filename": filename,
                "resume_text": resume_text,
                "analyzed_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
                "status": "Screened",
                "ai_generated_summary": False,
                "rank": 1,
                "processing_error": str(error),
            })

    
    # =====================================================
    # Sort by match score
    # =====================================================

    results.sort(
        key=lambda candidate: float(
            candidate.get(
                "match_score",
                0,
            )
            or 0
        ),
        reverse=True,
    )

    # =====================================================
    # Assign ranking
    # =====================================================

    for rank, candidate in enumerate(
        results,
        start=1,
    ):

        candidate["rank"] = rank

    # =====================================================
    # Save current session
    # =====================================================

    SESSION_CANDIDATES = results

    print(
        f"[FastAPI] Successfully processed "
        f"{len(results)} candidates"
    )

    # =====================================================
    # Return response
    # =====================================================

    return {
        "status": "success",

        "job_title": job_title,

        "processed_count": len(results),

        "candidates": results,
    }