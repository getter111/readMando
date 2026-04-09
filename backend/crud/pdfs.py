from supabase import Client
from typing import List, Optional
import models

class PdfCRUD:
    """
    CRUD operations for PDF documents using Supabase.
    """
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.table = "pdfs"

    def create_pdf(self, pdf: models.PdfCreate) -> dict:
        """
        Creates a new PDF record in the database.
        """
        try:
            response = self.supabase.table(self.table).insert(pdf.model_dump(exclude_unset=True)).execute()
            if not response.data:
                raise RuntimeError("Failed to insert PDF record")
            return response.data[0]
        except Exception as e:
            raise RuntimeError(f"Database error creating PDF: {str(e)}")

    def get_pdfs_by_user(self, user_id: int) -> List[dict]:
        """
        Retrieves all PDFs accessible by a specific user (either uploaded by them or global).
        """
        try:
            # Get PDFs uploaded by user OR global PDFs
            response = self.supabase.table(self.table).select("*").or_(f"uploaded_by.eq.{user_id},is_global.eq.true").order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise RuntimeError(f"Database error getting PDFs: {str(e)}")

    def get_global_pdfs(self) -> List[dict]:
        """
        Retrieves all globally available PDFs.
        """
        try:
            response = self.supabase.table(self.table).select("*").eq("is_global", True).order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise RuntimeError(f"Database error getting global PDFs: {str(e)}")

    def get_pdf_by_id(self, pdf_id: str) -> Optional[dict]:
        """
        Retrieves a specific PDF by its ID.
        """
        try:
            response = self.supabase.table(self.table).select("*").eq("id", pdf_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise RuntimeError(f"Database error getting PDF by id: {str(e)}")

    def delete_pdf(self, pdf_id: str) -> dict:
        """
        Deletes a specific PDF record by its ID.
        """
        try:
            response = self.supabase.table(self.table).delete().eq("id", pdf_id).execute()
            if not response.data:
                raise ValueError("Failed to delete PDF record or record not found")
            return response.data[0]
        except Exception as e:
            raise RuntimeError(f"Database error deleting PDF: {str(e)}")
