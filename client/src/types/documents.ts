// src/types/documents.ts

// The main Program interface, which seems to be the core application data
export interface Program {
  _id: string;
  university: string;
  department: string;
  funding: string;
  fundingAmount: string;
  deadline: string;
  greWaiver: string;
  ieltsWaiver: string;
  appFeeWaiver: string;
  requiredDocs: string[];
  appLink: string;
}

// Interface for the populated application data returned from the API
export interface PopulatedApplication {
  _id: string;
  schoolName: string;
  programName: string;
}

// The Document interface, which now correctly uses the populated application type
export interface Document {
  _id: string;
  applicationId: PopulatedApplication;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  status: 'uploaded' | 'pending_review' | 'review_complete';
  correctedFileUrl?: string;
}

// You can add other related types here as well
export interface Email {
  subject: string;
  body: string;
  recipient: string;
  sentAt: string;
}