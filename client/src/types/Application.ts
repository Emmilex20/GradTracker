export interface Email {
  subject: string;
  body: string;
  recipient: string;
  sentAt: string;
}

export interface Application {
  contactEmail: string;
  _id: string;
  schoolName: string;
  programName: string;
  funding: string;
  fundingAmount: string;
  deadline: string; // Changed from applicationDeadline to deadline
  status: 'Interested' | 'Applying' | 'Submitted' | 'Accepted' | 'Rejected';
  notes: string;
  emails: Email[];
  greWaiver: string;
  ieltsWaiver: string;
  appFeeWaiver: string;
  requiredDocs: string[];
  appLink: string;
}