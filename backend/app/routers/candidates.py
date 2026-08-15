from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter()

@router.get("/candidates")
def list_candidates():
    from app.routers.screening import SESSION_CANDIDATES
    return SESSION_CANDIDATES

@router.get("/candidates/{candidate_id}")
def get_candidate(candidate_id: str):
    from app.routers.screening import SESSION_CANDIDATES
    for c in SESSION_CANDIDATES:
        if c.get("candidate_id") == candidate_id:
            return c
    raise HTTPException(status_code=404, detail="Candidate not found")
