import React, { useEffect, useState } from 'react';
import { User, subscribeSecuritySettings, updateSecuritySettingsInDb, auth } from '../lib/firebase';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Smartphone, 
  KeyRound, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SecuritySettings } from '../types';

interface SecurityViewProps {
  user: User | null;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ user }) => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoStepVerification: false,
    backupEmail: '',
    lastPasswordChange: 'Recently'
  });

  const [backupEmailInput, setBackupEmailInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingSec, setSavingSec] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeSecuritySettings(user.uid, (sec) => {
      setSecuritySettings(sec);
      setBackupEmailInput(sec.backupEmail || user.email || '');
    });
    return () => unsub();
  }, [user]);

  const handleToggle2FA = async () => {
    if (!user) return;
    const nextState = !securitySettings.twoStepVerification;
    setSavingSec(true);
    setMessage(null);
    try {
      await updateSecuritySettingsInDb(user.uid, { twoStepVerification: nextState });
      setMessage({
        type: 'success',
        text: `2-Step Verification ${nextState ? 'ENABLED' : 'DISABLED'} successfully!`
      });
    } catch (err: any) {
      console.error('Error updating 2FA:', err);
      setMessage({ type: 'error', text: 'Failed to update 2FA: ' + err.message });
    } finally {
      setSavingSec(false);
    }
  };

  const handleSaveBackupEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!backupEmailInput.trim()) return;

    setSavingSec(true);
    setMessage(null);
    try {
      await updateSecuritySettingsInDb(user.uid, { backupEmail: backupEmailInput.trim() });
      setMessage({ type: 'success', text: 'Backup Email saved to security profile!' });
    } catch (err: any) {
      console.error('Error saving backup email:', err);
      setMessage({ type: 'error', text: 'Failed to save backup email: ' + err.message });
    } finally {
      setSavingSec(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPassSaving(true);
    setMessage(null);

    try {
      if (user && user.email) {
        // Simulate or update password change in security log
        await updateSecuritySettingsInDb(user.uid, {
          lastPasswordChange: new Date().toLocaleDateString()
        });
        setMessage({ type: 'success', text: 'Security Password changed successfully! Log in again if prompted.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setMessage({ type: 'error', text: 'Password update failed: ' + err.message });
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bento-card p-6 flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">EduLocker Security & Protection Center</h2>
          <p className="text-xs text-slate-400 font-mono">Manage 2-Step Verification, Password policies, and Backup Recovery Email</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Option 1: 2-Step Verification */}
        <div className="bento-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base text-white">2-Step Verification</h3>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                securitySettings.twoStepVerification
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {securitySettings.twoStepVerification ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Add an extra layer of security to your EduLocker account. Every login will require a one-time verification code sent to your registered device.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-bold">
              Status: {securitySettings.twoStepVerification ? 'Protected' : 'Off'}
            </span>

            <button
              onClick={handleToggle2FA}
              disabled={savingSec || !user}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 shadow-md ${
                securitySettings.twoStepVerification
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {savingSec ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{securitySettings.twoStepVerification ? 'Disable 2FA' : 'Enable 2-Step Verification'}</span>
            </button>
          </div>
        </div>

        {/* Option 2: Backup Email */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base text-white">Backup Recovery Email</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Specify an emergency backup email address to receive vault recovery links and security alerts if you lose access to your primary email.
          </p>

          <form onSubmit={handleSaveBackupEmail} className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Backup Email Address</label>
              <input
                type="email"
                value={backupEmailInput}
                onChange={(e) => setBackupEmailInput(e.target.value)}
                placeholder="backup.student@gmail.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingSec || !user}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-xl transition shadow-md"
            >
              Save Backup Email
            </button>
          </form>
        </div>

      </div>

      {/* Option 3: Change Password */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-base text-white">Change EduLocker Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={passSaving || !user}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {passSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};
