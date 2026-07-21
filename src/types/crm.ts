export type PartnershipStage = 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Active';
export type OrganizationType = 'University' | 'Startup' | 'Mentor' | 'Partner';
export type Priority = 'High' | 'Medium' | 'Low';
export type ReminderStatus = 'Open' | 'Done';
export type AuthMode = 'login' | 'signup';

export type Contact = {
  name: string;
  role: string;
  email: string;
  phone: string;
  preferredChannel: string;
  lastTouch: string;
};

export type Meeting = {
  id: string;
  date: string;
  subject: string;
  outcome: string;
  nextStep: string;
};

export type Note = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  tag: string;
  updatedAt?: string;
};

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  stage: PartnershipStage;
  owner: string;
  priority: Priority;
  health: number;
  website: string;
  location: string;
  summary: string;
  lastTouch: string;
  nextFollowUp: string;
  reminderDate: string;
  reminderMessage: string;
  reminderStatus: ReminderStatus;
  contacts: Contact[];
  meetings: Meeting[];
  notes: Note[];
  tags: string[];
};

export type NewPartnerDraft = {
  name: string;
  type: OrganizationType;
  owner: string;
  priority: Priority;
  website: string;
  location: string;
  summary: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  reminderDate: string;
  reminderMessage: string;
};

export type StageFilter = 'All' | PartnershipStage;

export type AuthSession = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type DashboardStats = {
  followUpsDue: number;
  activePartners: number;
  conversations: number;
  notes: number;
  averageHealth: number;
};

export type FollowUpItem = Pick<Organization, 'id' | 'name' | 'reminderMessage' | 'nextFollowUp'>;

export type ReminderItem = Pick<Organization, 'id' | 'name' | 'reminderDate' | 'reminderMessage' | 'reminderStatus'>;

