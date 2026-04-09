import fitz  # PyMuPDF
import re
from typing import Optional

def extract_pdf_content(pdf_bytes: bytes, chapter_number: Optional[int] = None) -> str:
    """
    Extracts text from a PDF byte stream. If chapter_number is provided,
    attempts to extract only that chapter. Otherwise, returns the first 5000 characters.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = "".join(page.get_text() for page in doc)
            
        if chapter_number is not None:
            pattern = re.compile(
                rf"Chapter\s+{chapter_number}.*?(?=Chapter\s+{chapter_number + 1}|$)",
                re.DOTALL | re.IGNORECASE
            )
            match = pattern.search(full_text)
            if match:
                return match.group(0)
            return f"Chapter {chapter_number} not found. Returning partial text:\n\n{full_text[:5000]}"
            
        return full_text[:5000]
    except Exception as e:
        raise ValueError(f"Failed to parse PDF content: {str(e)}")
