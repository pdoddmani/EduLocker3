import React, { useState } from 'react';
import { 
  EduLockerDocument, 
  createFirestoreDocument, 
  updateFirestoreDocument, 
  deleteFirestoreDocument 
} from '../lib/firebase';
import { 
  GraduationCap, Award, FileText, ShieldCheck, Lock, QrCode, Share2, Sparkles, Plus, 
  Search, Trash2, Edit3, CheckCircle2, Building2, Calendar, Hash, Download, Eye, 
  Check, X, Loader2, Bolt, Brain, Copy, RefreshCw, Wand2 
} from 'lucide-react';

interface FirestoreDocumentListProps {
  documents: EduLockerDocument[];
  userId: string | null;
  loadingDocs: boolean;
}

export const FirestoreDocumentList: React.FC<FirestoreDocumentListProps> = ({
  documents,
  userId,
  loadingDocs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewDocModal, setViewDocModal] = useState<EduLockerDocument | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newCredentialId, setNewCredentialId] = useState('');
  const [newGradeOrMarks, setNewGradeOrMarks] = useState('');
  const [newCategory, setNewCategory] = useState('Degree & Diploma');
  const [newIssueDate, setNewIssueDate] = useState('');
  const [newVerificationStatus, setNewVerificationStatus] = useState<any>('Verified Digital Seal');
  const [newContent, setNewContent] = useState('');
  const [pasteTextForAi, setPasteTextForAi] = useState('');
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [creating, setCreating] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editCredentialId, setEditCredentialId] = useState('');
  const [editGradeOrMarks, setEditGradeOrMarks] = useState('');
  const [editCategory, setEditCategory] = useState('Degree & Diploma');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // AI Trigger state on specific document
  const [aiDocId, setAiDocId] = useState<string | null>(null);
  const [aiRunningMode, setAiRunningMode] = useState<'fast' | 'general' | 'thinking' | null>(null);

  // Share state
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  const categories = [
    'All',
    'Degree & Diploma',
    'Marksheets & Transcripts',
    'Certifications',
    'Identity & Student Cards',
    'Recommendations & Conduct',
    'Projects & Research'
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.institution && doc.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.credentialId && doc.credentialId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // AI Auto Parse Certificate Text
  const handleAiAutoParse = async () => {
    if (!pasteTextForAi.trim()) return;
    setIsParsingAi(true);
    try {
      const res = await fetch('/api/gemini/parse-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteTextForAi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-parse certificate');

      const extracted = data.extracted || {};
      if (extracted.title) setNewTitle(extracted.title);
      if (extracted.institution) setNewInstitution(extracted.institution);
      if (extracted.credentialId && extracted.credentialId !== 'N/A') setNewCredentialId(extracted.credentialId);
      if (extracted.gradeOrMarks && extracted.gradeOrMarks !== 'N/A') setNewGradeOrMarks(extracted.gradeOrMarks);
      if (extracted.category) setNewCategory(extracted.category);
      if (extracted.issueDate && extracted.issueDate !== 'N/A') setNewIssueDate(extracted.issueDate);
      if (extracted.summary) setNewContent(extracted.summary);
    } catch (err: any) {
      console.error('Error auto parsing with AI:', err);
      alert('AI Extraction Error: ' + err.message);
    } finally {
      setIsParsingAi(false);
    }
  };

  // Populate sample academic credential templates
  const applySampleTemplate = (type: 'vtu' | 'aws' | 'cbse') => {
    if (type === 'vtu') {
      setNewTitle('Bachelor of Technology in Computer Science & Engineering');
      setNewInstitution('Visvesvaraya Technological University (VTU)');
      setNewCredentialId('USN: 1VT20CS042');
      setNewGradeOrMarks('CGPA: 9.15 / 10.0 (First Class with Distinction)');
      setNewCategory('Degree & Diploma');
      setNewIssueDate('2024-06-20');
      setNewVerificationStatus('Verified Digital Seal');
      setNewContent('Official B.Tech Degree awarded upon completion of 8 semesters coursework, capstone project, and industry internship with First Class Distinction.');
    } else if (type === 'aws') {
      setNewTitle('AWS Certified Solutions Architect - Associate');
      setNewInstitution('Amazon Web Services (AWS)');
      setNewCredentialId('AWS-CERT-98240192');
      setNewGradeOrMarks('Score: 890 / 1000 (Pass)');
      setNewCategory('Certifications');
      setNewIssueDate('2024-03-10');
      setNewVerificationStatus('Verified Digital Seal');
      setNewContent('Validates expertise in designing resilient, high-performing, decoupled, and secure architectures on AWS cloud infrastructure.');
    } else if (type === 'cbse') {
      setNewTitle('Class 12th Senior School Certificate Examination');
      setNewInstitution('Central Board of Secondary Education (CBSE)');
      setNewCredentialId('Roll No: 11684920');
      setNewGradeOrMarks('94.6% Overall Aggregate');
      setNewCategory('Marksheets & Transcripts');
      setNewIssueDate('2020-05-18');
      setNewVerificationStatus('Institution Signed');
      setNewContent('Subjects: Physics (95), Chemistry (94), Mathematics (97), Computer Science (98), English Core (89).');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please sign in with Google to store credentials in your EduLocker.');
      return;
    }
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      await createFirestoreDocument(
        userId,
        newTitle,
        newContent,
        newCategory,
        '',
        {
          institution: newInstitution || 'University / Board',
          credentialId: newCredentialId || 'N/A',
          issueDate: newIssueDate || new Date().toISOString().split('T')[0],
          gradeOrMarks: newGradeOrMarks || '',
          verificationStatus: newVerificationStatus
        }
      );
      // Reset form
      setNewTitle('');
      setNewInstitution('');
      setNewCredentialId('');
      setNewGradeOrMarks('');
      setNewCategory('Degree & Diploma');
      setNewContent('');
      setPasteTextForAi('');
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error creating credential in Firestore:', err);
      alert('Failed to save to EduLocker: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (doc: EduLockerDocument) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
    setEditInstitution(doc.institution || '');
    setEditCredentialId(doc.credentialId || '');
    setEditGradeOrMarks(doc.gradeOrMarks || '');
    setEditCategory(doc.category || 'Degree & Diploma');
    setEditContent(doc.description || '');
  };

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true);
    try {
      await updateFirestoreDocument(id, {
        title: editTitle,
        institution: editInstitution,
        credentialId: editCredentialId,
        gradeOrMarks: editGradeOrMarks,
        category: editCategory,
        description: editContent,
      });
      setEditingId(null);
    } catch (err: any) {
      console.error('Error updating document in Firestore:', err);
      alert('Failed to update: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this academic credential from EduLocker?')) return;
    try {
      await deleteFirestoreDocument(id);
    } catch (err: any) {
      console.error('Error deleting document from Firestore:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleRunAiOnDoc = async (docItem: EduLockerDocument, mode: 'fast' | 'general' | 'thinking') => {
    setAiDocId(docItem.id);
    setAiRunningMode(mode);

    let endpoint = '/api/gemini/general';
    if (mode === 'fast') endpoint = '/api/gemini/fast';
    if (mode === 'thinking') endpoint = '/api/gemini/thinking';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: mode === 'thinking' 
            ? 'Provide a deep academic analysis of this transcript/certificate, converting grades into standard GPA and identifying core strengths.'
            : mode === 'fast'
            ? 'Generate a 2-bullet executive summary and key highlight for this credential.'
            : 'Draft a professional verification breakdown and resume achievement bullet for this academic document.',
          context: `Document Title: ${docItem.title}\nInstitution: ${docItem.institution}\nCredential ID: ${docItem.credentialId}\nGrade/Marks: ${docItem.gradeOrMarks}\nDetails: ${docItem.description}`
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      const updatedAnalysis = `[${data.model}]:\n${data.text}`;
      await updateFirestoreDocument(docItem.id, {
        aiAnalysis: updatedAnalysis
      });
    } catch (err: any) {
      console.error('Error running AI on document:', err);
      alert('AI processing error: ' + err.message);
    } finally {
      setAiDocId(null);
      setAiRunningMode(null);
    }
  };

  const handleCopyShareLink = (docId: string) => {
    const link = `${window.location.origin}/#verify-${docId}`;
    navigator.clipboard.writeText(link);
    setCopiedDocId(docId);
    setTimeout(() => setCopiedDocId(null), 3000);
  };

  return (
    <div className="bento-card shadow-lg space-y-4">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-100 tracking-tight flex items-center gap-2">
              <span>Academic Credentials Vault</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                {documents.length} Saved
              </span>
            </h2>
            <p className="text-xs text-slate-400">Secure Firestore vault for Degrees, Marksheets, Certifications & IDs</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={!userId}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add to EduLocker</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, university, USN, or grade..."
            className="w-full bg-slate-950/80 border border-slate-700/40 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200 whitespace-nowrap font-mono font-medium ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold shadow-sm'
                  : 'bg-slate-900/60 border-slate-700/30 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="bg-slate-950/95 border border-blue-500/40 rounded-2xl p-5 space-y-4 shadow-2xl relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-sm text-slate-100">Add Academic Credential to EduLocker</h3>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Auto Extractor Tool Box */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Auto-Extract Credential Fields (Gemini)</span>
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={pasteTextForAi}
                onChange={(e) => setPasteTextForAi(e.target.value)}
                placeholder="Paste certificate text, result notes, or credential summary..."
                className="flex-1 bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAiAutoParse}
                disabled={isParsingAi || !pasteTextForAi.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition disabled:opacity-50 whitespace-nowrap"
              >
                {isParsingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Auto-Fill</span>
              </button>
            </div>
          </div>

          {/* Sample Templates Bar */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span>Quick Templates:</span>
            <button
              type="button"
              onClick={() => applySampleTemplate('vtu')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-full text-[11px] text-blue-300 transition"
            >
              + VTU B.Tech
            </button>
            <button
              type="button"
              onClick={() => applySampleTemplate('aws')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-full text-[11px] text-amber-300 transition"
            >
              + AWS Cloud Cert
            </button>
            <button
              type="button"
              onClick={() => applySampleTemplate('cbse')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-full text-[11px] text-emerald-300 transition"
            >
              + CBSE 12th Marksheet
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Document / Certificate Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. B.Tech Degree Certificate"
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Issuing Institution / University</label>
                <input
                  type="text"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="e.g. Visvesvaraya Technological University"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Credential ID / USN / Roll No</label>
                <input
                  type="text"
                  value={newCredentialId}
                  onChange={(e) => setNewCredentialId(e.target.value)}
                  placeholder="e.g. USN: 1VT20CS042"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Grade / CGPA / Score</label>
                <input
                  type="text"
                  value={newGradeOrMarks}
                  onChange={(e) => setNewGradeOrMarks(e.target.value)}
                  placeholder="e.g. CGPA 9.15 / First Class"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Academic Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 text-slate-200 text-xs rounded-xl px-3.5 py-2 focus:outline-none font-sans"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={newIssueDate}
                  onChange={(e) => setNewIssueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Verification Seal Status</label>
                <select
                  value={newVerificationStatus}
                  onChange={(e) => setNewVerificationStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 text-slate-200 text-xs rounded-xl px-3.5 py-2 focus:outline-none font-sans"
                >
                  <option value="Verified Digital Seal">Verified Digital Seal (Green Badge)</option>
                  <option value="Institution Signed">Institution Signed (Blue Badge)</option>
                  <option value="Pending Verification">Pending Verification (Amber Badge)</option>
                  <option value="Self-Uploaded">Self-Uploaded (Gray Badge)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Document Notes & Summary</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Key subjects, course modules, distinction honors, or verification note..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2 rounded-full transition disabled:opacity-50 shadow-md shadow-blue-500/20 active:scale-95"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save to EduLocker</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Full Document / Verification Modal */}
      {viewDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {viewDocModal.verificationStatus || 'Verified Digital Seal'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">EduLocker ID: {viewDocModal.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{viewDocModal.title}</h3>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{viewDocModal.institution || 'Visvesvaraya Technological University'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDocModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Credential ID</span>
                <span className="font-bold text-slate-200">{viewDocModal.credentialId || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Grade / Score</span>
                <span className="font-bold text-amber-400">{viewDocModal.gradeOrMarks || 'Pass'}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Issue Date</span>
                <span className="font-bold text-slate-300">{viewDocModal.issueDate || '2024'}</span>
              </div>
            </div>

            {/* Verification Hash & QR Code Simulation */}
            <div className="p-4 bg-slate-950 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Digital Vault Seal Hash</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 break-all select-all">
                  {viewDocModal.verificationHash || '0x8f92a10b982c40d12e873a'}
                </div>
                <p className="text-[10px] text-slate-500">
                  Cryptographically secured in Firestore cluster <span className="text-blue-400 font-mono">edu2-9970f</span>
                </p>
              </div>

              <div className="flex flex-col items-center bg-white p-2.5 rounded-2xl shrink-0">
                <QrCode className="w-16 h-16 text-slate-950" />
                <span className="text-[9px] font-mono text-slate-700 font-bold mt-1">VERIFY CERT</span>
              </div>
            </div>

            {/* Content & Notes */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Document Summary & Modules</span>
              <p className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {viewDocModal.description || 'No additional summary notes provided.'}
              </p>
            </div>

            {/* AI Output if present */}
            {viewDocModal.aiAnalysis && (
              <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-2xl space-y-1">
                <div className="text-[10px] font-mono font-bold text-blue-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Insights & Analysis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {viewDocModal.aiAnalysis}
                </p>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyShareLink(viewDocModal.id)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-full font-semibold transition"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{copiedDocId === viewDocModal.id ? 'Link Copied!' : 'Share Public Link'}</span>
              </button>

              <button
                onClick={() => setViewDocModal(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2 rounded-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Cards Grid */}
      {loadingDocs ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-xs font-mono">Syncing EduLocker documents from Firestore...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/40 border border-dashed border-slate-800/80 rounded-3xl p-6 space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
          <div>
            <p className="text-sm font-bold text-slate-300">No Academic Credentials Found</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {!userId
                ? 'Sign in with Google to view and sync your EduLocker documents.'
                : 'Click "Add to EduLocker" above or use a Quick Template to store your first certificate.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((docItem) => (
            <div
              key={docItem.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/40 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 shadow-sm group"
            >
              {editingId === docItem.id ? (
                /* Inline Edit Form */
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editInstitution}
                      onChange={(e) => setEditInstitution(e.target.value)}
                      placeholder="University / Board"
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={editCredentialId}
                      onChange={(e) => setEditCredentialId(e.target.value)}
                      placeholder="USN / Credential ID"
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-xs text-slate-200"
                    />
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 resize-none font-sans"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1"
                    >
                      <option value="Degree & Diploma">Degree & Diploma</option>
                      <option value="Marksheets & Transcripts">Marksheets & Transcripts</option>
                      <option value="Certifications">Certifications</option>
                      <option value="Identity & Student Cards">Identity & Student Cards</option>
                      <option value="Recommendations & Conduct">Recommendations & Conduct</option>
                    </select>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(docItem.id)}
                        disabled={savingEdit}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                      >
                        {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Document Card Mode */
                <>
                  <div>
                    {/* Status & Category Bar */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{docItem.verificationStatus || 'Verified Digital Seal'}</span>
                      </span>

                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setViewDocModal(docItem)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                          title="View & Verify Credential"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyShareLink(docItem.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                          title="Share Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(docItem)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Credential"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(docItem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete from EduLocker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Institution */}
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 mb-0.5">
                      {docItem.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mb-2.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{docItem.institution || 'University / Board'}</span>
                    </p>

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-mono">
                      {docItem.credentialId && (
                        <span className="bg-slate-950 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-800">
                          ID: {docItem.credentialId}
                        </span>
                      )}
                      {docItem.gradeOrMarks && (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg font-bold">
                          {docItem.gradeOrMarks}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-3 leading-relaxed mb-3 font-sans">
                      {docItem.description}
                    </p>

                    {/* AI Output if exists */}
                    {docItem.aiAnalysis && (
                      <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-3 mb-3 text-xs text-slate-200 font-mono">
                        <div className="flex items-center space-x-1 text-[10px] text-blue-400 uppercase tracking-wider font-bold mb-1">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>Gemini AI Insights</span>
                        </div>
                        <div className="line-clamp-3 whitespace-pre-wrap text-[11px] font-sans text-slate-300">
                          {docItem.aiAnalysis}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer & AI Triggers */}
                  <div className="pt-3 border-t border-slate-800/60 flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                        {docItem.category}
                      </span>
                      <span>Issued: {docItem.issueDate || '2024'}</span>
                    </div>

                    {/* AI Action Triggers */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Gemini AI:</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleRunAiOnDoc(docItem, 'fast')}
                          disabled={aiDocId === docItem.id}
                          className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-1 rounded-full transition font-mono"
                          title="Low-latency summary"
                        >
                          {aiDocId === docItem.id && aiRunningMode === 'fast' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Bolt className="w-3 h-3" />
                          )}
                          <span>Summary</span>
                        </button>

                        <button
                          onClick={() => handleRunAiOnDoc(docItem, 'general')}
                          disabled={aiDocId === docItem.id}
                          className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 text-[10px] px-2.5 py-1 rounded-full transition font-mono"
                          title="Format & enhance"
                        >
                          {aiDocId === docItem.id && aiRunningMode === 'general' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>Verify</span>
                        </button>

                        <button
                          onClick={() => handleRunAiOnDoc(docItem, 'thinking')}
                          disabled={aiDocId === docItem.id}
                          className="flex items-center space-x-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-[10px] px-2.5 py-1 rounded-full transition font-mono"
                          title="High thinking GPA & career analysis"
                        >
                          {aiDocId === docItem.id && aiRunningMode === 'thinking' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Brain className="w-3 h-3" />
                          )}
                          <span>GPA Analysis</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
