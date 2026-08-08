import React from 'react';
import { EduLockerDocument, User } from '../lib/firebase';
import { 
  FileText, 
  HardDrive, 
  PlusCircle, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Building2,
  Calendar,
  Share2
} from 'lucide-react';
import { AIPromptPlayground } from './AIPromptPlayground';

interface DashboardViewProps {
  documents: EduLockerDocument[];
  user: User | null;
  onOpenUpload: () => void;
  onOpenMyDocuments: () => void;
  onOpenProfile: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  user,
  onOpenUpload,
  onOpenMyDocuments,
  onOpenProfile
}) => {
  // Calculate total storage used in bytes and format it
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.fileSizeBytes || 1200000), 0);
  const totalStorageFormatted = totalSizeBytes < 1024 * 1024 
    ? `${(totalSizeBytes / 1024).toFixed(1)} KB` 
    : `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  const storagePercentage = Math.min(100, (totalSizeBytes / (100 * 1024 * 1024)) * 100);

  const passwordProtectedCount = documents.filter(d => d.isPasswordProtected).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bento-card relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DigiLocker Educational Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome to EduLocker, {user?.displayName?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Your centralized encrypted vault for storing degrees, university marksheets, certifications, and academic identity documents. Cryptographically signed & verified.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Add Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid (3 Key Dashboard Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Number of Documents Uploaded */}
        <div className="bento-card bg-slate-900/90 border-slate-800 p-5 space-y-3 hover:border-blue-500/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Number of Documents Uploaded</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{documents.length}</span>
            <span className="text-xs text-slate-400 font-mono">Vault Files</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {documents.length > 0 ? `${documents.length} active academic credentials` : 'No credentials uploaded yet'}
          </p>
        </div>

        {/* Metric 2: Total Storage Used */}
        <div className="bento-card bg-slate-900/90 border-slate-800 p-5 space-y-3 hover:border-indigo-500/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Total Storage Used</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <HardDrive className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{totalStorageFormatted}</span>
            <span className="text-xs text-slate-400 font-mono">of 100 MB</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, storagePercentage)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Add Documents Quick Action */}
        <div 
          onClick={onOpenUpload}
          className="bento-card bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/40 p-5 space-y-3 cursor-pointer hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">Quick Action</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition">
              <PlusCircle className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white group-hover:text-blue-300 transition">Add New Document</h3>
            <p className="text-xs text-slate-400 mt-1">Upload degree, marksheet, or certification with optional password lock.</p>
          </div>
          <div className="flex items-center text-xs font-mono font-bold text-blue-400 gap-1 pt-1">
            <span>Open Upload Window</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

      </div>

      {/* Grid: Gemini AI Workspace & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Gemini AI Assistant Workspace (5 cols) */}
        <div className="lg:col-span-5">
          <AIPromptPlayground />
        </div>

        {/* Right: Recent Uploaded Documents Feed (7 cols) */}
        <div className="lg:col-span-7 bento-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-400" />
              <h2 className="font-extrabold text-base text-white">Recent Vault Credentials</h2>
            </div>
            <button
              onClick={onOpenMyDocuments}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All ({documents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="py-10 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-6 space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-300">No Credentials Uploaded</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click "Add Documents" to upload your first academic certificate or transcript.
                </p>
              </div>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={onOpenMyDocuments}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      {doc.isPasswordProtected ? (
                        <Lock className="w-5 h-5 text-amber-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-100 group-hover:text-blue-300 transition truncate">
                          {doc.title}
                        </h4>
                        {doc.isPasswordProtected && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.2 rounded-md">
                            Password Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {doc.institution || 'VTU'} • {doc.fileSizeText || '1.2 MB'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold block">
                      {doc.verificationStatus || 'Verified'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      {doc.createdAt?.split('T')[0] || 'Today'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
