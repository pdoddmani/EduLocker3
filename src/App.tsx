import React, { useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  User, 
  subscribeUserDocuments, 
  EduLockerDocument, 
  syncUserProfile,
  firestoreDbId
} from './lib/firebase';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { UploadDocumentView } from './components/UploadDocumentView';
import { MyDocumentsView } from './components/MyDocumentsView';
import { SecurityView } from './components/SecurityView';
import { ProfileView } from './components/ProfileView';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [documents, setDocuments] = useState<EduLockerDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);

      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (e: any) {
          console.warn('Profile sync error:', e);
        }
      } else {
        setDocuments([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Monitor Real-time Firestore Documents for Authenticated User
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoadingDocs(false);
      return;
    }

    setLoadingDocs(true);

    const unsubscribeDocs = subscribeUserDocuments(
      user.uid,
      (updatedDocs) => {
        setDocuments(updatedDocs);
        setLoadingDocs(false);
        setDbError(null);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setDbError(error.message || 'Error subscribing to Firestore collection');
        setLoadingDocs(false);
      }
    );

    return () => unsubscribeDocs();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar with active tab state */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        documentCount={documents.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Render view according to active tab */}
        {activeTab === 'dashboard' && (
          <DashboardView
            documents={documents}
            user={user}
            onOpenUpload={() => setActiveTab('upload')}
            onOpenMyDocuments={() => setActiveTab('my-documents')}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'upload' && (
          <UploadDocumentView
            user={user}
            onSuccess={() => setActiveTab('my-documents')}
          />
        )}

        {activeTab === 'my-documents' && (
          <MyDocumentsView
            documents={documents}
            userId={user ? user.uid : null}
            loadingDocs={loadingDocs}
            onOpenUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            user={user}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 mt-auto text-xs text-slate-500 text-center relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div>
            EduLocker • Digital Academic Credentials Vault • <strong className="text-slate-300">Prathamesh Doddmani Inplant Training 2026</strong>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firestore Connected</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}


