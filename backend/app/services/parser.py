"""
Resume Document Parser Service (PyMuPDF & python-docx)
"""

import io
import re
from typing import Dict, Any, List

def parse_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        return text.strip()
    except Exception:
        # Fallback decode
        return file_bytes.decode('utf-8', errors='ignore')

def parse_docx(file_bytes: bytes) -> str:
    """Extracts raw text from DOCX bytes."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = [p.text for p in doc.paragraphs if p.text]
        return "\n".join(full_text)
    except Exception:
        return file_bytes.decode('utf-8', errors='ignore')

def extract_contact_info(text: str) -> Dict[str, str]:
    """Extracts email, phone, and name heuristics from resume text."""
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else "candidate@example.com"
    
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else "+1 (555) 019-2834"

    # Candidate Name heuristic from first lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    candidate_name = lines[0] if len(lines) > 0 and len(lines[0]) < 40 else "Candidate"

    return {
        "candidate_name": candidate_name,
        "email": email,
        "phone": phone
    }
