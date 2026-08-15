from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/analytics")
def get_analytics():
    from app.routers.screening import SESSION_CANDIDATES
    total = len(SESSION_CANDIDATES)
    if total == 0:
        return {"total_candidates": 0, "avg_score": 0}

    avg_score = round(sum(c.get("match_score", 0) for c in SESSION_CANDIDATES) / total)
    strong = len([c for c in SESSION_CANDIDATES if c.get("match_score", 0) >= 80])

    return {
        "total_candidates": total,
        "avg_score": avg_score,
        "strong_matches_count": strong,
        "screening_timestamp": "Real-time"
    }
