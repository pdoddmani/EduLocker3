import React, { useState } from 'react';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../lib/firebase';
import { Lock, Mail, User as UserIcon, ShieldCheck, Sparkles, X, ArrowRight, Loader2, Building2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await registerWithEmail(email, password, name, institution.trim() || undefined);
      } else {
        await loginWithEmail(email, password, institution.trim() || undefined);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle(institution.trim() || undefined);
      onClose();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError('Google Sign-In failed: ' + (err.message || 'Error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-slate-900 border border-blue-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">EduLocker Account</h3>
              <p className="text-[11px] text-slate-400 font-mono">Sign in or create account for Educational Vault</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              mode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              mode === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-sans">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Student Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prathamesh Doddmani"
                  required
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Institute Name Option */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Institute / College / University Name {mode === 'register' ? '*' : '(Optional)'}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                list="institute-suggestions"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Visvesvaraya Technological University (VTU)"
                required={mode === 'register'}
                className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <datalist id="institute-suggestions">
                <option value="Visvesvaraya Technological University (VTU)" />
                <option value="Indian Institute of Technology (IIT Bombay)" />
                <option value="Indian Institute of Technology (IIT Delhi)" />
                <option value="Anna University" />
                <option value="University of Delhi" />
                <option value="Stanford University" />
                <option value="Harvard University" />
                <option value="National Institute of Technology (NIT)" />
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu.in"
                required
                className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to EduLocker' : 'Register Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-mono text-slate-500 uppercase shrink-0">OR</span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs py-3 rounded-2xl transition flex items-center justify-center space-x-2.5 active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

      </div>
    </div>
  );
};

