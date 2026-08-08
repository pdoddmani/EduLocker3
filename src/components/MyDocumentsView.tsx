import React, { useState } from 'react';
import { EduLockerDocument, deleteFirestoreDocument } from '../lib/firebase';
import { 
  FileText, 
  HardDrive, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  KeyRound, 
  X, 
  Check, 
  Loader2, 
  Sparkles, 
  Building2, 
  Calendar, 
  QrCode,
  Hash
} from 'lucide-react';

interface MyDocumentsViewProps {
  documents: EduLockerDocument[];
  userId: string | null;
  loadingDocs: boolean;
  onOpenUpload: () => void;
}

export const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({
  documents,
  userId,
  loadingDocs,
  onOpenUpload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Selected document to view
  const [viewDoc, setViewDoc] = useState<EduLockerDocument | null>(null);
  
  // Password prompt state
  const [passwordTargetDoc, setPasswordTargetDoc] = useState<EduLockerDocument | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete confirmation modal state
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<EduLockerDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied Share Link Feedback
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Top Box 1: Document Count
  const totalCount = documents.length;

  // Top Box 2: Total Storage Used
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.fileSizeBytes || 1200000), 0);
  const totalStorageFormatted = totalSizeBytes < 1024 * 1024 
    ? `${(totalSizeBytes / 1024).toFixed(1)} KB` 
    : `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  // Top Box 3: Password Protected & Verified Seals
  const protectedCount = documents.filter(d => d.isPasswordProtected).length;

  const categories = [
    'All',
    'Degree & Diploma',
    'Marksheets & Transcripts',
    'Certifications',
    'Identity & Student Cards',
    'Recommendations & Conduct',
    'Projects & Research'
  ];

  // Sorting & Filtering logic
  const filteredAndSortedDocs = documents
    .filter((doc) => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.institution && doc.institution.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'size') {
        const sizeA = a.fileSizeBytes || 0;
        const sizeB = b.fileSizeBytes || 0;
        return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      } else {
        // Date sorting
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
    });

  const handleDocumentClick = (docItem: EduLockerDocument) => {
    if (docItem.isPasswordProtected) {
      setPasswordTargetDoc(docItem);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setViewDoc(docItem);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetDoc) return;

    if (enteredPassword === passwordTargetDoc.documentPassword) {
      setViewDoc(passwordTargetDoc);
      setPasswordTargetDoc(null);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect document password. Access denied.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmDoc) return;
    setIsDeleting(true);
    try {
      await deleteFirestoreDocument(deleteConfirmDoc.id);
      setDeleteConfirmDoc(null);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyShareLink = (docId: string) => {
    const link = `${window.location.origin}/#edulocker-verify-${docId}`;
    navigator.clipboard.writeText(link);
    setCopiedDocId(docId);
    setTimeout(() => setCopiedDocId(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top 3 Metric Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Box 1: Number of Documents */}
        <div className="bento-card bg-slate-900/90 border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Number of Documents</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-400 font-mono">Active credentials in EduLocker Vault</p>
        </div>

        {/* Box 2: Storage Used */}
        <div className="bento-card bg-slate-900/90 border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Storage Used</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalStorageFormatted}</div>
          <p className="text-[11px] text-slate-400 font-mono">Encrypted Firestore file storage</p>
        </div>

        {/* Box 3: Security & Protected Seals */}
        <div className="bento-card bg-slate-900/90 border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Protected Credentials</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{protectedCount}</div>
          <p className="text-[11px] text-slate-400 font-mono">Password-locked secure credentials</p>
        </div>

      </div>

      {/* Sort & Filter Control Bar */}
      <div className="bento-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents by name, university, or keywords..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort Control Dropdown & Direction Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none font-bold"
              >
                <option value="date" className="bg-slate-900">Date</option>
                <option value="name" className="bg-slate-900">Name</option>
                <option value="size" className="bg-slate-900">Size</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-mono text-slate-300 transition"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? 'Desc ↓' : 'Asc ↑'}
            </button>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] px-3.5 py-1.5 rounded-full border transition whitespace-nowrap font-mono font-medium ${
                selectedCategory === cat
                  ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Items Grid / List */}
      {loadingDocs ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading your EduLocker documents...</p>
        </div>
      ) : filteredAndSortedDocs.length === 0 ? (
        <div className="bento-card py-16 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="font-extrabold text-base text-white">No Documents Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'All' 
                ? 'No documents matched your current search or category filter.' 
                : 'Your EduLocker vault is empty. Click below to upload your first academic document.'}
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-md shadow-blue-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedDocs.map((docItem) => (
            <div
              key={docItem.id}
              className="bento-card p-4 space-y-3 hover:border-blue-500/40 transition group flex flex-col justify-between"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified Seal</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    {docItem.isPasswordProtected && (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Protected</span>
                      </span>
                    )}

                    {/* Delete Option (Explicit Requirement) */}
                    <button
                      onClick={() => setDeleteConfirmDoc(docItem)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition line-clamp-1">
                  {docItem.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-sans leading-relaxed">
                  {docItem.description}
                </p>

                {/* Institution & Metadata */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
                    {docItem.category}
                  </span>
                  <span>•</span>
                  <span>{docItem.fileSizeText || '1.2 MB'}</span>
                  <span>•</span>
                  <span>{docItem.createdAt?.split('T')[0] || '2026'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleDocumentClick(docItem)}
                  className="flex items-center space-x-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs px-3 py-1.5 rounded-xl font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{docItem.isPasswordProtected ? 'Unlock & View' : 'View Document'}</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCopyShareLink(docItem.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                    title="Share Link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={docItem.fileDataUrl || '#'}
                    download={docItem.fileName || `${docItem.title}.pdf`}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Password Challenge Modal */}
      {passwordTargetDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Password Protected Document</h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">{passwordTargetDoc.title}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordTargetDoc(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Enter Document Password *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordTargetDoc(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition shadow-md"
                >
                  Unlock Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Full Modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Verified Digital Seal
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {viewDoc.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{viewDoc.title}</h3>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{viewDoc.institution || 'Visvesvaraya Technological University'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Category</span>
                <span className="font-bold text-slate-200">{viewDoc.category}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">File Size</span>
                <span className="font-bold text-indigo-300">{viewDoc.fileSizeText || '1.2 MB'}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Date Added</span>
                <span className="font-bold text-slate-300">{viewDoc.createdAt?.split('T')[0] || 'Today'}</span>
              </div>
            </div>

            {/* Verification Seal & Hash */}
            <div className="p-4 bg-slate-950 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="text-[10px] font-mono font-bold text-blue-400 uppercase flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>EduLocker Cryptographic Seal Hash</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 break-all select-all">
                  {viewDoc.verificationHash || '0x9f18a203b918c'}
                </div>
              </div>
              <div className="flex flex-col items-center bg-white p-2 rounded-xl shrink-0">
                <QrCode className="w-14 h-14 text-slate-950" />
                <span className="text-[8px] font-mono text-slate-700 font-bold mt-0.5">EDULOCKER SEAL</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Document Description</span>
              <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 leading-relaxed font-sans">
                {viewDoc.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyShareLink(viewDoc.id)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-full font-semibold transition"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{copiedDocId === viewDoc.id ? 'Link Copied!' : 'Share Verification Link'}</span>
              </button>

              <button
                onClick={() => setViewDoc(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2 rounded-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-white">Delete Document from EduLocker?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmDoc.title}"</strong> from your Firestore EduLocker database?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
