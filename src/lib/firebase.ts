import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserProfile, EduLockerDocument, SecuritySettings } from '../types';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = firebaseConfigData.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const firestoreProjectId = firebaseConfigData.projectId;
export const firestoreDbId = firebaseConfigData.firestoreDatabaseId || '(default)';

// Auth Helper Functions
export const signInWithGoogle = async (institution?: string) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user, institution ? { institution } : undefined);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.warn('Popup failed, falling back to redirect:', error);
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, institution?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName: name });
    await syncUserProfile(userCredential.user, { 
      displayName: name,
      ...(institution ? { institution } : {}) 
    });
  }
  return userCredential.user;
};

export const loginWithEmail = async (email: string, pass: string, institution?: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  if (userCredential.user) {
    await syncUserProfile(userCredential.user, institution ? { institution } : undefined);
  }
  return userCredential.user;
};

export const logoutUser = async () => {
  return firebaseSignOut(auth);
};

export { onAuthStateChanged };
export type { User };

export type FirestoreDocument = EduLockerDocument;

// Ensure user profile document exists in Firestore
export const syncUserProfile = async (user: User, customFields?: Partial<UserProfile>) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  const defaultUsn = customFields?.usnNumber || `USN-${user.uid.substring(0, 8).toUpperCase()}`;
  const defaultLockerId = `EDULOCKER-${user.uid.substring(0, 6).toUpperCase()}`;

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: customFields?.displayName || user.displayName || emailToName(user.email) || 'Student Locker Owner',
      username: customFields?.username || `@${user.email?.split('@')[0] || 'student'}`,
      email: user.email || '',
      phone: customFields?.phone || '+91 98765 43210',
      photoURL: user.photoURL || '',
      usnNumber: defaultUsn,
      institution: customFields?.institution || 'Visvesvaraya Technological University (VTU)',
      digiLockerId: defaultLockerId,
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp()
    });
  } else {
    await setDoc(userRef, {
      lastSeenAt: serverTimestamp(),
      ...customFields
    }, { merge: true });
  }
};

function emailToName(email: string | null): string {
  if (!email) return 'Student';
  const prefix = email.split('@')[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

// Subscribe to User Profile
export const subscribeUserProfile = (userId: string, onData: (profile: UserProfile) => void) => {
  if (!userId) return () => {};
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      onData(snap.data() as UserProfile);
    }
  }, (err) => {
    console.error('Error listening to user profile:', err);
  });
};

// Subscribe to User Security Settings
export const subscribeSecuritySettings = (userId: string, onData: (sec: SecuritySettings) => void) => {
  if (!userId) return () => {};
  const secRef = doc(db, 'user_security', userId);
  return onSnapshot(secRef, (snap) => {
    if (snap.exists()) {
      onData(snap.data() as SecuritySettings);
    } else {
      onData({
        twoStepVerification: false,
        backupEmail: '',
        lastPasswordChange: new Date().toLocaleDateString()
      });
    }
  }, (err) => {
    console.error('Error listening to security settings:', err);
  });
};

export const updateSecuritySettingsInDb = async (userId: string, settings: Partial<SecuritySettings>) => {
  if (!userId) return;
  const secRef = doc(db, 'user_security', userId);
  return setDoc(secRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
};

// Real-time listener for user documents
export const subscribeUserDocuments = (
  userId: string, 
  onData: (docs: EduLockerDocument[]) => void,
  onError?: (err: Error) => void
) => {
  if (!userId) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(db, 'documents'),
    where('ownerId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const documents: EduLockerDocument[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled Document',
          description: data.description || data.content || '',
          category: data.category || 'Degree & Diploma',
          ownerId: data.ownerId,
          institution: data.institution || 'University / Institution',
          credentialId: data.credentialId || 'N/A',
          issueDate: data.issueDate || '',
          gradeOrMarks: data.gradeOrMarks || '',
          verificationStatus: data.verificationStatus || 'Verified Digital Seal',
          verificationHash: data.verificationHash || `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          fileName: data.fileName || 'academic_document.pdf',
          fileSizeText: data.fileSizeText || '1.2 MB',
          fileSizeBytes: data.fileSizeBytes || 1250000,
          fileType: data.fileType || 'application/pdf',
          fileDataUrl: data.fileDataUrl || '',
          isPasswordProtected: !!data.isPasswordProtected,
          documentPassword: data.documentPassword || '',
          aiAnalysis: data.aiAnalysis || '',
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        };
      });
      // Sort client side by updatedAt descending
      documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(documents);
    },
    (error) => {
      console.error('Error fetching documents from Firestore:', error);
      if (onError) onError(error);
    }
  );
};

export type { EduLockerDocument } from '../types';

// Overloaded Create document in Firestore
export const createFirestoreDocument = async (
  userId: string, 
  titleOrData: string | {
    title: string;
    description?: string;
    content?: string;
    category?: string;
    institution?: string;
    credentialId?: string;
    issueDate?: string;
    gradeOrMarks?: string;
    fileName?: string;
    fileSizeText?: string;
    fileSizeBytes?: number;
    fileType?: string;
    fileDataUrl?: string;
    isPasswordProtected?: boolean;
    documentPassword?: string;
    aiAnalysis?: string;
  },
  content?: string,
  category?: string,
  aiAnalysis?: string,
  extraFields?: any
) => {
  const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
  
  if (typeof titleOrData === 'object') {
    return addDoc(collection(db, 'documents'), {
      title: titleOrData.title,
      description: titleOrData.description || titleOrData.content || '',
      category: titleOrData.category || 'Degree & Diploma',
      ownerId: userId,
      institution: titleOrData.institution || 'Educational Board',
      credentialId: titleOrData.credentialId || 'N/A',
      issueDate: titleOrData.issueDate || new Date().toISOString().split('T')[0],
      gradeOrMarks: titleOrData.gradeOrMarks || '',
      verificationStatus: 'Verified Digital Seal',
      verificationHash: hash,
      fileName: titleOrData.fileName || 'document.pdf',
      fileSizeText: titleOrData.fileSizeText || '1.5 MB',
      fileSizeBytes: titleOrData.fileSizeBytes || 1500000,
      fileType: titleOrData.fileType || 'application/pdf',
      fileDataUrl: titleOrData.fileDataUrl || '',
      isPasswordProtected: !!titleOrData.isPasswordProtected,
      documentPassword: titleOrData.documentPassword || '',
      aiAnalysis: titleOrData.aiAnalysis || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  return addDoc(collection(db, 'documents'), {
    title: titleOrData,
    description: content || '',
    category: category || 'Degree & Diploma',
    ownerId: userId,
    institution: extraFields?.institution || 'Educational Board',
    credentialId: extraFields?.credentialId || 'N/A',
    issueDate: extraFields?.issueDate || new Date().toISOString().split('T')[0],
    gradeOrMarks: extraFields?.gradeOrMarks || '',
    verificationStatus: 'Verified Digital Seal',
    verificationHash: hash,
    fileName: extraFields?.fileName || 'document.pdf',
    fileSizeText: '1.2 MB',
    fileSizeBytes: 1200000,
    fileType: 'application/pdf',
    fileDataUrl: extraFields?.fileUrl || '',
    isPasswordProtected: false,
    documentPassword: '',
    aiAnalysis: aiAnalysis || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Update document in Firestore
export const updateFirestoreDocument = async (
  docId: string, 
  updates: Partial<EduLockerDocument>
) => {
  const docRef = doc(db, 'documents', docId);
  const payload: any = {
    ...updates,
    updatedAt: serverTimestamp()
  };
  delete payload.id;
  delete payload.createdAt;
  return updateDoc(docRef, payload);
};

// Delete document from Firestore
export const deleteFirestoreDocument = async (docId: string) => {
  const docRef = doc(db, 'documents', docId);
  return deleteDoc(docRef);
};

