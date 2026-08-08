export interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  phone?: string;
  email: string;
  photoURL?: string;
  usnNumber?: string;
  institution?: string;
  digiLockerId?: string;
}

export type DocumentCategory = 
  | 'All'
  | 'Degree & Diploma'
  | 'Marksheets & Transcripts'
  | 'Certifications'
  | 'Identity & Student Cards'
  | 'Recommendations & Conduct'
  | 'Projects & Research';

export type VerificationStatus = 'Verified Digital Seal' | 'Institution Signed' | 'Pending Verification' | 'Self-Uploaded';

export interface EduLockerDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  ownerId: string;
  
  // Academic & File Metadata
  institution?: string;
  credentialId?: string;
  issueDate?: string;
  gradeOrMarks?: string;
  verificationStatus?: VerificationStatus;
  verificationHash?: string;
  
  // File details
  fileName?: string;
  fileSizeText?: string;
  fileSizeBytes?: number;
  fileType?: string;
  fileDataUrl?: string;
  
  // Security
  isPasswordProtected?: boolean;
  documentPassword?: string;
  
  // AI analysis
  aiAnalysis?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySettings {
  twoStepVerification: boolean;
  backupEmail: string;
  lastPasswordChange?: string;
}

export type AIMode = 'fast' | 'general' | 'thinking';

export interface AIResponse {
  text: string;
  model: string;
  latencyMs?: number;
  extractedFields?: {
    title?: string;
    institution?: string;
    credentialId?: string;
    gradeOrMarks?: string;
    category?: string;
    issueDate?: string;
  };
}

