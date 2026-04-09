import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PdfLibrary = ({ user, loadingUser }) => {
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [chapterNumbers, setChapterNumbers] = useState({});

  const fetchPdfs = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/pdfs`, { withCredentials: true });
      setPdfs(response.data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  }, []);

  useEffect(() => {
    if (!loadingUser) fetchPdfs();
  }, [loadingUser, fetchPdfs]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${apiUrl}/pdfs/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setFile(null);
      fetchPdfs();
    } catch (error) {
      alert("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (pdfId) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await axios.delete(`${apiUrl}/pdfs/${pdfId}`, { withCredentials: true });
      fetchPdfs();
    } catch (error) {
      alert("Failed to delete PDF.");
    }
  };

  const handleParse = async (pdfId) => {
    setParsing(true);
    setParsedText("");
    const chapterNumber = chapterNumbers[pdfId];
    try {
      const response = await axios.post(`${apiUrl}/pdfs/${pdfId}/parse`, 
        { chapter_number: chapterNumber ? parseInt(chapterNumber, 10) : null },
        { withCredentials: true }
      );
      setParsedText(response.data.content);
    } catch (error) {
      alert("Failed to parse PDF");
    } finally {
      setParsing(false);
    }
  };

  const cardStyle = `
    bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-gray-900 dark:border-white/10
    shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]
    transition-all duration-300
  `;

  if (loadingUser) return <div className="p-8 text-center dark:text-white uppercase font-black tracking-widest animate-pulse">Scanning Library...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      <div className="mb-12 text-center fade-up">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
          PDF <span className="text-pink-600">Library</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
          Upload textbooks, parse chapters, and extract vocabulary from your own documents.
        </p>
      </div>
      
      {/* Upload Section */}
      {user && user.username !== "Guest" && (
        <div className={`${cardStyle} mb-12 fade-up`} style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 dark:text-white">
            <span className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">📤</span>
            Upload New Document
          </h2>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium"
            />
            <button 
              type="submit" 
              disabled={!file || uploading}
              className="w-full sm:w-auto bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black px-8 py-4 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PDF List */}
        <div className="lg:col-span-5 space-y-6 fade-up" style={{ animationDelay: '200ms' }}>
          <div className={`${cardStyle} min-h-[400px]`}>
            <h2 className="text-2xl font-black mb-8 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">📚</span>
              Documents
            </h2>
            {pdfs.length === 0 ? (
              <p className="text-gray-400 font-medium text-center py-12">No documents found.</p>
            ) : (
              <ul className="space-y-4">
                {pdfs.map((pdf) => (
                  <li key={pdf.id} className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{pdf.original_file_name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          {pdf.is_global ? 'Public' : 'Personal'}
                        </span>
                      </div>
                      {user && user.username !== "Guest" && !pdf.is_global && (
                        <button onClick={() => handleDelete(pdf.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">🗑️</button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Ch #" 
                        className="w-20 p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
                        value={chapterNumbers[pdf.id] || ''}
                        onChange={(e) => setChapterNumbers({...chapterNumbers, [pdf.id]: e.target.value})}
                      />
                      <button 
                        onClick={() => handleParse(pdf.id)}
                        disabled={parsing}
                        className="flex-1 bg-blue-600 text-white font-black py-2 rounded-lg hover:bg-blue-700 transition-all text-sm disabled:opacity-50"
                      >
                        {parsing ? 'Parsing...' : 'Extract Chapter'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Parsing Result */}
        <div className="lg:col-span-7 fade-up" style={{ animationDelay: '300ms' }}>
          <div className={`${cardStyle} h-full flex flex-col`}>
            <h2 className="text-2xl font-black mb-8 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">📝</span>
              Extracted Content
            </h2>
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border-2 border-gray-900 dark:border-white/10 font-mono text-sm whitespace-pre-wrap leading-relaxed dark:text-gray-300">
              {parsedText || "Select a document and specify a chapter to begin extraction."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfLibrary;
