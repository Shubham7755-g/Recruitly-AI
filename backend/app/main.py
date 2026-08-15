"""
AI-Based Resume Screening & Candidate Ranking Tool
FastAPI Backend Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import screening, candidates, analytics

app = FastAPI(
    title="Recruitly AI API",
    description="Explainable ML & AI-Powered Candidate Ranking and Resume Parser",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(screening.router, prefix="/api", tags=["Screening & Ranking"])
app.include_router(candidates.router, prefix="/api", tags=["Candidates"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Recruitly AI  FastAPI Core",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
