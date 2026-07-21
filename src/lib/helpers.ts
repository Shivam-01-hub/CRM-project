import type { PartnershipStage, OrganizationType, Priority } from '../types/crm';

export const stageOrder: PartnershipStage[] = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Active'];

export const stagePalette: Record<PartnershipStage, string> = {
  Discovery: 'var(--stage-discovery)',
  Qualified: 'var(--stage-qualified)',
  Proposal: 'var(--stage-proposal)',
  Negotiation: 'var(--stage-negotiation)',
  Active: 'var(--stage-active)',
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));

export const toDateInputValue = (value: string) => new Date(value).toISOString().slice(0, 10);

export const toIsoFromDateInput = (value: string) => new Date(`${value}T09:00:00.000Z`).toISOString();

export const addDays = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getToday = () => new Date().toISOString();

