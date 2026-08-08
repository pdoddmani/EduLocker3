import React, { useEffect, useState } from 'react';
import { User, subscribeUserProfile, syncUserProfile } from '../lib/firebase';
import { UserProfile } from '../types';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  QrCode, 
  Key, 
  Sparkles,
  Calendar,
  Lock
} from 'lucide-react';

interface ProfileViewProps {
  user: User | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit profile form state
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUsn, setEditUsn] = useState('');
  const [editInstitution, setEditInstitution] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserProfile(user.uid, (data) => {
      setProfile(data);
      setEditUsername(data.displayName || user.displayName || '');
      setEditPhone(data.phone || '+91 98765 43210');
      setEditUsn(data.usnNumber || '');
      setEditInstitution(data.institution || '');
    });
    return () => unsub();
  }, [user]);

  const handleOpenEditModal = () => {
    if (profile) {
      setEditUsername(profile.displayName || user?.displayName || '');
      setEditPhone(profile.phone || '+91 98765 43210');
      setEditUsn(profile.usnNumber || '');
      setEditInstitution(profile.institution || '');
    }
    setIsEditing(true);
    setSuccessMsg('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await syncUserProfile(user, {
        displayName: editUsername.trim(),
        username: `@${editUsername.toLowerCase().replace(/\s+/g, '_')}`,
        phone: editPhone.trim(),
        usnNumber: editUsn.trim(),
        institution: editInstitution.trim()
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg('');
      }, 1000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[500px]">
      
      {/* Background with blur and 50% dark overlay as explicitly requested */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-10 pointer-events-none" />

      {/* Foreground Attractive Profile Card */}
      <div className="relative z-20 max-w-2xl mx-auto py-4 space-y-6">
        
        {/* Main Profile Card */}
        <div className="bento-card p-6 sm:p-8 space-y-6 bg-slate-900/95 border-blue-500/30 shadow-2xl relative overflow-hidden">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>EduLocker Verified Student Profile</span>
            </div>

            <button
              onClick={handleOpenEditModal}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* User Hero Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={profile?.displayName || 'Student'}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-blue-500/40 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl flex items-center justify-center text-3xl font-black text-white">
                  {profile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || 'S'}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-xl text-slate-950 shadow-lg">
                <Check className="w-4 h-4 font-extrabold stroke-[3]" />
              </div>
            </div>

            {/* Title & Details */}
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {profile?.displayName || user?.displayName || 'Student Locker Owner'}
              </h1>
              <p className="text-xs font-mono text-blue-400 font-semibold">
                {profile?.username || `@${user?.email?.split('@')[0] || 'student'}`}
              </p>
              <p className="text-xs text-slate-300 font-sans flex items-center justify-center sm:justify-start gap-1 pt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{profile?.institution || 'Visvesvaraya Technological University (VTU)'}</span>
              </p>
            </div>

          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-400" />
                <span>Email Address</span>
              </span>
              <p className="text-xs font-bold text-slate-200 truncate">{user?.email || 'student@university.edu.in'}</p>
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Phone Number</span>
              </span>
              <p className="text-xs font-bold text-slate-200">{profile?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-amber-400" />
                <span>USN / Student Roll No.</span>
              </span>
              <p className="text-xs font-bold text-amber-300 font-mono">{profile?.usnNumber || 'USN-1019283'}</p>
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <Key className="w-3 h-3 text-indigo-400" />
                <span>EduLocker DigiID</span>
              </span>
              <p className="text-xs font-bold text-indigo-300 font-mono">{profile?.digiLockerId || 'EDULOCKER-89A12'}</p>
            </div>

          </div>

          {/* QR Code / Credential Footer */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-slate-300">EduLocker Student Credential Seal</span>
              <p className="text-[10px] text-slate-500 font-mono">Issued by AIML Educational Network</p>
            </div>
            <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl">
              <QrCode className="w-10 h-10 text-slate-950" />
            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Edit Profile Details</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Update phone number and username</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Field 1: Username / Full Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  Full Name / Username *
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. Prathamesh Doddmani"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 2: Phone Number */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 3: USN Number */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  USN / Student ID Number
                </label>
                <input
                  type="text"
                  value={editUsn}
                  onChange={(e) => setEditUsn(e.target.value)}
                  placeholder="1VT21AI042"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 4: Institution */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  University / Institution
                </label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  placeholder="Visvesvaraya Technological University"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Profile</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
