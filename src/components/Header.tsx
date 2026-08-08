import React, { useState } from 'react';
import { User, logoutUser } from '../lib/firebase';
import { 
  GraduationCap, 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Sparkles,
  Lock
} from 'lucide-react';
import { AuthModal } from './AuthModal';

export type ActiveTab = 'dashboard' | 'upload' | 'my-documents' | 'security' | 'profile';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  documentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  documentCount
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Documents', icon: UploadCloud },
    { id: 'my-documents', label: 'My Documents', icon: FileText },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-white tracking-tight">EduLocker</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  DigiLocker Edu
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Official Academic Credentials Vault</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'my-documents' && documentCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {documentCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Profile Corner */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-xl object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      {user.displayName?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block pr-1">
                    <div className="text-xs font-bold text-slate-100 line-clamp-1">{user.displayName || 'Student'}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">Verified Vault</div>
                  </div>
                </button>

                <button
                  onClick={() => logoutUser()}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition shadow-md shadow-blue-500/20 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Login</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2.5 gap-1 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};
