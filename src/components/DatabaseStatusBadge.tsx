import React from 'react';
import { firestoreProjectId, firestoreDbId } from '../lib/firebase';
import { Database, CheckCircle2, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface DatabaseStatusBadgeProps {
  documentCount: number;
  lastSyncedAt: Date | null;
  isSyncing: boolean;
  errorMsg?: string | null;
}

export const DatabaseStatusBadge: React.FC<DatabaseStatusBadgeProps> = ({
  documentCount,
  lastSyncedAt,
  isSyncing,
  errorMsg
}) => {
  return (
    <div className="bento-card relative overflow-hidden text-slate-300">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left Stats Section */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono">
              Database Throughput & Cluster Status
            </span>
            <div className="px-3 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-semibold text-green-400 uppercase tracking-widest font-mono">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-baseline space-x-3 pt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {documentCount} <span className="text-blue-400 text-lg font-mono">credentials</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live Vault Sync with <span className="text-blue-400 glow-text">{firestoreProjectId}</span> ({firestoreDbId})
            </p>
          </div>
        </div>

        {/* Right Bento Mini Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-900/80 border border-slate-700/40 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latency</span>
            <span className="text-sm font-bold text-slate-100 mt-1">12ms</span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-700/40 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security</span>
            <span className="text-xs font-bold text-emerald-400 mt-1">Auth Rules</span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-700/40 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
            <span className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1">
              {isSyncing ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
                </span>
              ) : (
                <span className="text-blue-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" /> Synced
                </span>
              )}
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-700/40 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Sync</span>
            <span className="text-xs font-semibold text-slate-300 mt-1 truncate">
              {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Ready'}
            </span>
          </div>
        </div>

      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono">
          ⚠️ Firestore Alert: {errorMsg}
        </div>
      )}
    </div>
  );
};

