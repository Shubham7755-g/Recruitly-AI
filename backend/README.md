# AI-Based Resume Screening & Candidate Ranking System
## Capstone & Virtual Internship Project

An AI and NLP-driven talent assessment platform that screens, parses, and ranks candidate resumes against job descriptions using an explainable 5-pillar matching algorithm, TF-IDF cosine similarity, skill taxonomy extraction, and LLM-assisted summaries.

---

## 🚀 Key Features

1. **Deterministic ML Scoring Engine**:
   - **Skill Match (40%)**: Taxonomy-aware parsing of required and complementary technologies.
   - **Semantic Similarity (30%)**: TF-IDF vectorization and cosine distance against job description text.
   - **Experience Alignment (15%)**: Automated tenure extraction and validation.
   - **Education Level (10%)**: Degree hierarchy classification (B.Tech, M.S, Ph.D.).
   - **Projects & Keywords (5%)**: Technical portfolio depth.
2. **AI Candidate Summary & Interview Questions**: Gemini-powered executive recruiter insights and candidate-specific interview probes.
3. **Multi-Format Document Parsing**: PDF and DOCX parsing.
4. **Side-by-Side Candidate Comparison**: Compare multiple candidates across all 5 dimensions simultaneously.
5. **Talent Pool Analytics**: Real-time distribution charts, skill frequency bars, and qualification tiers.
6. **Configurable Scoring Weights**: Recruiters can dynamically modify algorithm weights with live recalculation.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router
- **Full-Stack Node Server**: Express, Vite Middleware, `@google/genai` SDK
- **Python Backend (Optional/Standalone)**: FastAPI, PyMuPDF (`fitz`), `python-docx`, Scikit-learn, Uvicorn

---

## 📦 How to Run the Project

### 1. Web Application (Full-Stack Express + Vite React)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Standalone Python FastAPI Backend (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🎓 Viva & Technical Presentation Highlights

- **Why Hybrid Deterministic + LLM?**
  Pure LLM prompts suffer from hallucination, scoring drift, and unexplainable outcomes. By anchoring the score in deterministic TF-IDF and regex metrics, the recruiter receives a mathematically rigorous rank while leveraging Gemini solely for narrative synthesis and personalized interview question formulation.
- **Fair Recruitment:**
  Removes demographic bias and focuses solely on skills, tenure, and verified project competencies.
