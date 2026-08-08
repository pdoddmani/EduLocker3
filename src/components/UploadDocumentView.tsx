import React, { useState } from 'react';
import { createFirestoreDocument, User } from '../lib/firebase';
import { 
  UploadCloud, 
  FileText, 
  Lock, 
  KeyRound, 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Hash, 
  Wand2,
  FolderPlus,
  AlertCircle
} from 'lucide-react';

interface UploadDocumentViewProps {
  user: User | null;
  onSuccess: () => void;
}

export const UploadDocumentView: React.FC<UploadDocumentViewProps> = ({ user, onSuccess }) => {
  const [docName, setDocName] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [category, setCategory] = useState('Degree & Diploma');
  const [institution, setInstitution] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [gradeOrMarks, setGradeOrMarks] = useState('');
  const [issueDate, setIssueDate] = useState('');

  // Password Protection state
  const [wantPassword, setWantPassword] = useState<'no' | 'yes'>('no');
  const [documentPassword, setDocumentPassword] = useState('');

  // File Upload Drag & Drop state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  // AI Parsing state
  const [pasteTextForAi, setPasteTextForAi] = useState('');
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setSelectedFile(file);

    // Auto set name if empty
    if (!docName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setDocName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl(e.target?.result as string || '');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAiParseText = async () => {
    if (!pasteTextForAi.trim()) return;
    setIsParsingAi(true);
    setMessage(null);
    try {
      const res = await fetch('/api/gemini/parse-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteTextForAi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse certificate text');

      const extracted = data.extracted || {};
      if (extracted.title) setDocName(extracted.title);
      if (extracted.institution) setInstitution(extracted.institution);
      if (extracted.credentialId && extracted.credentialId !== 'N/A') setCredentialId(extracted.credentialId);
      if (extracted.gradeOrMarks && extracted.gradeOrMarks !== 'N/A') setGradeOrMarks(extracted.gradeOrMarks);
      if (extracted.category) setCategory(extracted.category);
      if (extracted.issueDate && extracted.issueDate !== 'N/A') setIssueDate(extracted.issueDate);
      if (extracted.summary) setDocDescription(extracted.summary);

      setMessage({ type: 'success', text: 'Gemini AI successfully extracted document fields!' });
    } catch (err: any) {
      console.error('AI extraction error:', err);
      setMessage({ type: 'error', text: 'AI Extraction Error: ' + err.message });
    } finally {
      setIsParsingAi(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in with Google or Email to upload to your EduLocker.' });
      return;
    }

    if (!docName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a document name.' });
      return;
    }

    if (wantPassword === 'yes' && !documentPassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter a password for this document.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const fileSizeInBytes = selectedFile ? selectedFile.size : 1500000;
    const sizeFormatted = fileSizeInBytes < 1024 * 1024 
      ? `${(fileSizeInBytes / 1024).toFixed(1)} KB` 
      : `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

    try {
      await createFirestoreDocument(user.uid, {
        title: docName,
        description: docDescription || 'Uploaded academic credential.',
        category: category,
        institution: institution || 'Educational Institution',
        credentialId: credentialId || 'N/A',
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        gradeOrMarks: gradeOrMarks || '',
        fileName: selectedFile ? selectedFile.name : `${docName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSizeText: sizeFormatted,
        fileSizeBytes: fileSizeInBytes,
        fileType: selectedFile ? selectedFile.type : 'application/pdf',
        fileDataUrl: fileDataUrl,
        isPasswordProtected: wantPassword === 'yes',
        documentPassword: wantPassword === 'yes' ? documentPassword : '',
      });

      setMessage({ type: 'success', text: 'Document successfully saved to EduLocker Vault!' });
      
      // Reset form
      setDocName('');
      setDocDescription('');
      setInstitution('');
      setCredentialId('');
      setGradeOrMarks('');
      setWantPassword('no');
      setDocumentPassword('');
      setSelectedFile(null);
      setFileDataUrl('');
      setPasteTextForAi('');

      setTimeout(() => {
        onSuccess();
      }, 1200);

    } catch (err: any) {
      console.error('Upload document error:', err);
      setMessage({ type: 'error', text: 'Failed to upload: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bento-card max-w-4xl mx-auto space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
          <UploadCloud className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Upload Document to EduLocker</h2>
          <p className="text-xs text-slate-400 font-mono">Store academic degrees, transcripts, certificates with optional password protection</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Auto-Extractor Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-300">
          <span className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" />
            <span>AI Auto-Extract Document Fields with Gemini</span>
          </span>
          <span className="text-[10px] text-slate-500">Optional AI Assistant</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={pasteTextForAi}
            onChange={(e) => setPasteTextForAi(e.target.value)}
            placeholder="Paste raw certificate text, transcript lines, or certificate ID..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAiParseText}
            disabled={isParsingAi || !pasteTextForAi.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
          >
            {isParsingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Auto-Fill</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleUploadSubmit} className="space-y-5">
        
        {/* Document Name & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              Name of Document *
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Bachelor of Technology Degree Certificate"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              Document Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="Degree & Diploma">Degree & Diploma</option>
              <option value="Marksheets & Transcripts">Marksheets & Transcripts</option>
              <option value="Certifications">Certifications</option>
              <option value="Identity & Student Cards">Identity & Student Cards</option>
              <option value="Recommendations & Conduct">Recommendations & Conduct</option>
              <option value="Projects & Research">Projects & Research</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
            Description of Document
          </label>
          <textarea
            value={docDescription}
            onChange={(e) => setDocDescription(e.target.value)}
            placeholder="e.g. Official B.Tech degree awarded by Visvesvaraya Technological University with First Class Distinction."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
          />
        </div>

        {/* Radio Button: Password Protection Option */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                Do you want to set password protection for this document? *
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="wantPassword"
                value="no"
                checked={wantPassword === 'no'}
                onChange={() => setWantPassword('no')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300 font-semibold">No (Standard Encrypted Access)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="wantPassword"
                value="yes"
                checked={wantPassword === 'yes'}
                onChange={() => setWantPassword('yes')}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <span>Yes (Require Password to Open Document)</span>
              </span>
            </label>
          </div>

          {/* Conditional Password Input Section */}
          {wantPassword === 'yes' && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-200">
              <label className="block text-xs font-mono font-bold text-amber-300">
                Set Document Unlock Password *
              </label>
              <div className="relative max-w-md">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={documentPassword}
                  onChange={(e) => setDocumentPassword(e.target.value)}
                  placeholder="Enter secret password to protect document"
                  required={wantPassword === 'yes'}
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Anyone viewing this document in your EduLocker will be prompted for this password.
              </p>
            </div>
          )}
        </div>

        {/* Drag & Drop / Browse File Upload Area */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold text-slate-300">
            Upload Document File (Drag & Drop or Browse)
          </label>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-blue-400 bg-blue-500/10 scale-[1.01]' 
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="font-bold text-sm text-slate-100">{selectedFile.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setFileDataUrl(''); }}
                  className="text-xs text-rose-400 hover:underline pt-1"
                >
                  Remove File & Select Different
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FolderPlus className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Drag and drop your document here, or <span className="text-blue-400 underline cursor-pointer">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Supports PDF, PNG, JPG, DOCX up to 25 MB
                  </p>
                </div>
                <input
                  type="file"
                  id="file-upload-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload-input"
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition"
                >
                  Select File from Computer
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit Upload Button */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            type="submit"
            disabled={uploading || !docName.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-full transition shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>Upload Document to EduLocker</span>
          </button>
        </div>

      </form>

    </div>
  );
};
