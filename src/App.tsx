import { type FormEvent, useEffect, useMemo, useState } from 'react';
import seedOrganizationsData from './data/seed-organizations.json';
import AuthScreen from './components/AuthScreen';
import DashboardHeader from './components/DashboardHeader';
import Sidebar from './components/Sidebar';
import { apiRequest } from './lib/api';

type PartnershipStage = 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Active';
type OrganizationType = 'University' | 'Startup' | 'Mentor' | 'Partner';
type Priority = 'High' | 'Medium' | 'Low';

type Contact = {
  name: string;
  role: string;
  email: string;
  phone: string;
  preferredChannel: string;
  lastTouch: string;
};

type Meeting = {
  id: string;
  date: string;
  subject: string;
  outcome: string;
  nextStep: string;
};

type Note = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  tag: string;
  updatedAt?: string;
};

type ReminderStatus = 'Open' | 'Done';

type Organization = {
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

type NewPartnerDraft = {
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

const stageOrder: PartnershipStage[] = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Active'];
const stagePalette: Record<PartnershipStage, string> = {
  Discovery: 'var(--stage-discovery)',
  Qualified: 'var(--stage-qualified)',
  Proposal: 'var(--stage-proposal)',
  Negotiation: 'var(--stage-negotiation)',
  Active: 'var(--stage-active)',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));

const toDateInputValue = (value: string) => new Date(value).toISOString().slice(0, 10);

const toIsoFromDateInput = (value: string) => new Date(`${value}T09:00:00.000Z`).toISOString();

const addDays = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const today = new Date().toISOString();

const storageKey = 'partnership-crm-organizations-v2';
const authStorageKey = 'partnership-crm-access-token';

type AuthMode = 'login' | 'signup';

type AuthSession = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

type AuthResponse = {
  user: AuthSession;
  accessToken: string;
};

type SeedOrganization = Omit<Organization, 'reminderDate' | 'reminderMessage' | 'reminderStatus'>;

const initialOrganizations = seedOrganizationsData as SeedOrganization[];

const seedOrganizations: Organization[] = initialOrganizations.map((organization) => ({
  ...organization,
  reminderDate: organization.nextFollowUp,
  reminderMessage: `Follow up with ${organization.name}.`,
  reminderStatus: 'Open',
}));

const createDefaultNewPartnerDraft = (): NewPartnerDraft => ({
  name: '',
  type: 'Partner',
  owner: '',
  priority: 'Medium',
  website: '',
  location: '',
  summary: '',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  reminderDate: toDateInputValue(addDays(today, 7)),
  reminderMessage: 'Send an intro email and confirm the first partnership call.',
});

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(authStorageKey);
  });
  const [authUser, setAuthUser] = useState<AuthSession | null>(null);

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    if (typeof window === 'undefined') {
      return seedOrganizations;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return seedOrganizations;
    }

    try {
      return JSON.parse(stored) as Organization[];
    } catch {
      return seedOrganizations;
    }
  });
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | PartnershipStage>('All');
  const [selectedId, setSelectedId] = useState(seedOrganizations[0].id);
  const [noteDraft, setNoteDraft] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [reminderDateDraft, setReminderDateDraft] = useState(toDateInputValue(seedOrganizations[0].reminderDate));
  const [reminderMessageDraft, setReminderMessageDraft] = useState(seedOrganizations[0].reminderMessage);
  const [newPartnerDraft, setNewPartnerDraft] = useState<NewPartnerDraft>(createDefaultNewPartnerDraft);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!authToken) {
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ user: AuthSession }>('/auth/me', {
          method: 'GET',
          accessToken: authToken,
        });

        if (!cancelled) {
          setAuthUser(response.user);
          setAuthError('');
        }
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(authStorageKey);
          setAuthToken(null);
          setAuthUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (authToken) {
      window.localStorage.setItem(authStorageKey, authToken);
    } else {
      window.localStorage.removeItem(authStorageKey);
    }
  }, [authToken]);

  const handleSignOut = () => {
    setAuthToken(null);
    setAuthUser(null);
    setAuthError('');
    setAuthPassword('');
  };

  const handleAuthSubmit = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const payload =
        authMode === 'signup'
          ? { name: authName.trim(), email: authEmail.trim(), password: authPassword }
          : { email: authEmail.trim(), password: authPassword };

      const response = await apiRequest<AuthResponse>(authMode === 'signup' ? '/auth/signup' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setAuthUser(response.user);
      setAuthToken(response.accessToken);
      setAuthPassword('');
      if (authMode === 'signup') {
        setAuthName('');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === selectedId) ?? organizations[0],
    [organizations, selectedId],
  );

  const visibleOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((organization) => {
      const stageMatches = stageFilter === 'All' || organization.stage === stageFilter;
      const queryMatches =
        query.length === 0 ||
        [organization.name, organization.type, organization.owner, organization.location, organization.summary, ...organization.tags]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return stageMatches && queryMatches;
    });
  }, [organizations, search, stageFilter]);

  useEffect(() => {
    if (visibleOrganizations.length === 0) {
      return;
    }

    const selectedVisible = visibleOrganizations.some((organization) => organization.id === selectedId);
    if (!selectedVisible) {
      setSelectedId(visibleOrganizations[0].id);
    }
  }, [selectedId, visibleOrganizations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(organizations));
    }
  }, [organizations]);

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }

    setReminderDateDraft(toDateInputValue(selectedOrganization.reminderDate));
    setReminderMessageDraft(selectedOrganization.reminderMessage);
    setEditingNoteId(null);
  }, [selectedOrganization?.id, selectedOrganization?.reminderDate, selectedOrganization?.reminderMessage]);

  const stats = useMemo(() => {
    const followUpsDue = organizations.filter((organization) => new Date(organization.nextFollowUp) <= new Date()).length;
    const activePartners = organizations.filter((organization) => organization.stage === 'Active').length;
    const conversations = organizations.reduce((count, organization) => count + organization.meetings.length, 0);
    const notes = organizations.reduce((count, organization) => count + organization.notes.length, 0);
    const averageHealth = organizations.reduce((sum, organization) => sum + organization.health, 0) / organizations.length;

    return { followUpsDue, activePartners, conversations, notes, averageHealth };
  }, [organizations]);

  const stageCounts = useMemo(
    () =>
      stageOrder.map((stage) => ({
        stage,
        count: organizations.filter((organization) => organization.stage === stage).length,
      })),
    [organizations],
  );

  const prioritizedOrganizations = useMemo(
    () =>
      [...organizations].sort((left, right) => {
        const priorityWeight: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
        const leftScore = priorityWeight[left.priority] * 100 + left.health;
        const rightScore = priorityWeight[right.priority] * 100 + right.health;
        return leftScore - rightScore;
      }),
    [organizations],
  );

  const followUpQueue = useMemo(() => {
    return [...organizations]
      .filter(
        (organization) =>
          organization.reminderStatus === 'Open' &&
          new Date(organization.reminderDate).getTime() <= new Date(addDays(today, 7)).getTime(),
      )
      .sort((left, right) => new Date(left.reminderDate).getTime() - new Date(right.reminderDate).getTime());
  }, [organizations]);

  const reminderQueue = useMemo(
    () =>
      [...organizations]
        .filter((organization) => organization.reminderStatus === 'Open')
        .sort((left, right) => new Date(left.reminderDate).getTime() - new Date(right.reminderDate).getTime()),
    [organizations],
  );

  const reminderDueSoon = useMemo(
    () => reminderQueue.filter((organization) => new Date(organization.reminderDate).getTime() <= new Date(addDays(today, 7)).getTime()),
    [reminderQueue],
  );

  const updateOrganization = (organizationId: string, updater: (organization: Organization) => Organization) => {
    setOrganizations((current) => current.map((organization) => (organization.id === organizationId ? updater(organization) : organization)));
  };

  const resetNewPartnerDraft = () => setNewPartnerDraft(createDefaultNewPartnerDraft());

  const createPartner = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPartnerDraft.name.trim() || !newPartnerDraft.owner.trim()) {
      return;
    }

    const reminderDate = newPartnerDraft.reminderDate || toDateInputValue(addDays(today, 7));
    const nextFollowUp = toIsoFromDateInput(reminderDate);
    const organization: Organization = {
      id: createId(),
      name: newPartnerDraft.name.trim(),
      type: newPartnerDraft.type,
      stage: 'Discovery',
      owner: newPartnerDraft.owner.trim(),
      priority: newPartnerDraft.priority,
      health: 58,
      website: newPartnerDraft.website.trim(),
      location: newPartnerDraft.location.trim(),
      summary: newPartnerDraft.summary.trim(),
      lastTouch: today,
      nextFollowUp,
      reminderDate: nextFollowUp,
      reminderMessage: newPartnerDraft.reminderMessage.trim() || `Follow up with ${newPartnerDraft.name.trim()}.`,
      reminderStatus: 'Open',
      contacts: [
        {
          name: newPartnerDraft.contactName.trim() || 'Primary contact',
          role: newPartnerDraft.contactRole.trim() || 'Partnership lead',
          email: newPartnerDraft.contactEmail.trim() || 'n/a',
          phone: newPartnerDraft.contactPhone.trim() || 'n/a',
          preferredChannel: 'Email',
          lastTouch: today,
        },
      ],
      meetings: [],
      notes: [
        {
          id: createId(),
          author: 'System',
          body: 'New partner created from the intake form.',
          createdAt: today,
          tag: 'Created',
        },
      ],
      tags: [newPartnerDraft.type, 'New partner'],
    };

    setOrganizations((current) => [organization, ...current]);
    setSelectedId(organization.id);
    setSearch('');
    setStageFilter('All');
    resetNewPartnerDraft();
  };

  const saveNote = () => {
    const content = noteDraft.trim();
    if (!content || !selectedOrganization) {
      return;
    }

    if (editingNoteId) {
      updateOrganization(selectedOrganization.id, (organization) => ({
        ...organization,
        lastTouch: today,
        notes: organization.notes.map((note) =>
          note.id === editingNoteId ? { ...note, body: content, updatedAt: today } : note,
        ),
      }));

      setEditingNoteId(null);
      setNoteDraft('');
      return;
    }

    updateOrganization(selectedOrganization.id, (organization) => ({
      ...organization,
      lastTouch: today,
      notes: [
        {
          id: crypto.randomUUID(),
          author: 'Founder',
          body: content,
          createdAt: today,
          tag: 'Note',
        },
        ...organization.notes,
      ],
    }));

    setNoteDraft('');
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteDraft(note.body);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setNoteDraft('');
  };

  const deleteNote = (noteId: string) => {
    if (!selectedOrganization) {
      return;
    }

    updateOrganization(selectedOrganization.id, (organization) => ({
      ...organization,
      lastTouch: today,
      notes: organization.notes.filter((note) => note.id !== noteId),
    }));

    if (editingNoteId === noteId) {
      cancelEditingNote();
    }
  };

  const moveStage = (nextStage: PartnershipStage) => {
    if (!selectedOrganization) {
      return;
    }

    updateOrganization(selectedOrganization.id, (organization) => ({
      ...organization,
      stage: nextStage,
      lastTouch: today,
      notes: [
        {
          id: crypto.randomUUID(),
          author: 'System',
          body: `Moved partnership stage from ${organization.stage} to ${nextStage}.`,
          createdAt: today,
          tag: 'Status',
        },
        ...organization.notes,
      ],
    }));
  };

  const bumpFollowUp = () => {
    if (!selectedOrganization) {
      return;
    }

    updateOrganization(selectedOrganization.id, (organization) => ({
      ...organization,
      nextFollowUp: addDays(today, 7),
      reminderDate: addDays(today, 7),
      reminderMessage: `Follow up with ${organization.name} after the current step.`,
      reminderStatus: 'Open',
      lastTouch: today,
      notes: [
        {
          id: crypto.randomUUID(),
          author: 'System',
          body: 'Follow-up pushed one week out after completing the current step.',
          createdAt: today,
          tag: 'Follow-up',
        },
        ...organization.notes,
      ],
    }));
  };

  const saveReminder = () => {
    if (!selectedOrganization || !reminderDateDraft) {
      return;
    }

    updateOrganization(selectedOrganization.id, (organization) => ({
      ...organization,
      nextFollowUp: toIsoFromDateInput(reminderDateDraft),
      reminderDate: toIsoFromDateInput(reminderDateDraft),
      reminderMessage: reminderMessageDraft.trim() || organization.reminderMessage,
      reminderStatus: 'Open',
      lastTouch: today,
      notes: [
        {
          id: createId(),
          author: 'System',
          body: `Reminder set for ${formatDate(toIsoFromDateInput(reminderDateDraft))}: ${reminderMessageDraft.trim() || organization.reminderMessage}`,
          createdAt: today,
          tag: 'Reminder',
        },
        ...organization.notes,
      ],
    }));
  };

  const completeReminder = () => {
    if (!selectedOrganization) {
      return;
    }

    updateOrganization(selectedOrganization.id, (organization) => ({
      ...organization,
      reminderStatus: 'Done',
      nextFollowUp: addDays(today, 14),
      lastTouch: today,
      notes: [
        {
          id: createId(),
          author: 'System',
          body: 'Reminder marked complete and pushed into the next follow-up cycle.',
          createdAt: today,
          tag: 'Reminder',
        },
        ...organization.notes,
      ],
    }));
  };

  if (authLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Partnership CRM</p>
          <h1>Checking your session...</h1>
          <p>Restoring the authenticated workspace.</p>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <AuthScreen
        mode={authMode}
        name={authName}
        email={authEmail}
        password={authPassword}
        loading={authLoading}
        error={authError}
        onModeChange={setAuthMode}
        onNameChange={setAuthName}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmit={() => void handleAuthSubmit()}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        stats={stats}
        stageCounts={stageCounts}
        stageFilter={stageFilter}
        totalOrganizations={organizations.length}
        followUpQueue={followUpQueue}
        stagePalette={stagePalette}
        onStageFilterChange={setStageFilter}
        onSelectOrganization={setSelectedId}
        formatDate={formatDate}
      />

      <main className="workspace">
        <DashboardHeader
          search={search}
          stageFilter={stageFilter}
          followUpsDue={stats.followUpsDue}
          conversations={stats.conversations}
          notes={stats.notes}
          averageHealth={stats.averageHealth}
          userName={authUser.name}
          userRole={authUser.role}
          onSearchChange={setSearch}
          onSignOut={handleSignOut}
        />

        <section className="content-grid">
          <div className="left-column">
            <section className="panel form-panel">
              <div className="card-header">
                <div>
                  <h3>Add new partner</h3>
                  <p>Create a new relationship and seed its first reminder.</p>
                </div>
                <span className="ghost-badge">Local data</span>
              </div>

              <form className="partner-form" onSubmit={createPartner}>
                <div className="form-grid">
                  <label className="field-group">
                    <span>Organization name</span>
                    <input
                      required
                      value={newPartnerDraft.name}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Skyline University"
                    />
                  </label>
                  <label className="field-group">
                    <span>Type</span>
                    <select
                      value={newPartnerDraft.type}
                      onChange={(event) =>
                        setNewPartnerDraft((current) => ({ ...current, type: event.target.value as OrganizationType }))
                      }
                    >
                      <option value="University">University</option>
                      <option value="Startup">Startup</option>
                      <option value="Mentor">Mentor</option>
                      <option value="Partner">Partner</option>
                    </select>
                  </label>
                  <label className="field-group">
                    <span>Owner</span>
                    <input
                      required
                      value={newPartnerDraft.owner}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, owner: event.target.value }))}
                      placeholder="Ava"
                    />
                  </label>
                  <label className="field-group">
                    <span>Priority</span>
                    <select
                      value={newPartnerDraft.priority}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, priority: event.target.value as Priority }))}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid">
                  <label className="field-group">
                    <span>Website</span>
                    <input
                      value={newPartnerDraft.website}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, website: event.target.value }))}
                      placeholder="partner.org"
                    />
                  </label>
                  <label className="field-group">
                    <span>Location</span>
                    <input
                      value={newPartnerDraft.location}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, location: event.target.value }))}
                      placeholder="Remote"
                    />
                  </label>
                </div>

                <label className="field-group">
                  <span>Summary</span>
                  <textarea
                    rows={3}
                    value={newPartnerDraft.summary}
                    onChange={(event) => setNewPartnerDraft((current) => ({ ...current, summary: event.target.value }))}
                    placeholder="Why this partner matters and what value you are trying to create."
                  />
                </label>

                <div className="form-grid">
                  <label className="field-group">
                    <span>Contact name</span>
                    <input
                      value={newPartnerDraft.contactName}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, contactName: event.target.value }))}
                      placeholder="Primary contact"
                    />
                  </label>
                  <label className="field-group">
                    <span>Contact role</span>
                    <input
                      value={newPartnerDraft.contactRole}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, contactRole: event.target.value }))}
                      placeholder="Partnership lead"
                    />
                  </label>
                  <label className="field-group">
                    <span>Contact email</span>
                    <input
                      value={newPartnerDraft.contactEmail}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, contactEmail: event.target.value }))}
                      placeholder="person@company.com"
                    />
                  </label>
                  <label className="field-group">
                    <span>Contact phone</span>
                    <input
                      value={newPartnerDraft.contactPhone}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, contactPhone: event.target.value }))}
                      placeholder="(555) 555-0123"
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label className="field-group">
                    <span>Reminder date</span>
                    <input
                      type="date"
                      value={newPartnerDraft.reminderDate}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, reminderDate: event.target.value }))}
                    />
                  </label>
                  <label className="field-group span-2">
                    <span>Reminder message</span>
                    <input
                      value={newPartnerDraft.reminderMessage}
                      onChange={(event) => setNewPartnerDraft((current) => ({ ...current, reminderMessage: event.target.value }))}
                      placeholder="Follow up after the intro call."
                    />
                  </label>
                </div>

                <div className="detail-actions">
                  <button type="submit" className="primary-button">
                    Add new partner
                  </button>
                  <button type="button" className="secondary-button" onClick={resetNewPartnerDraft}>
                    Reset form
                  </button>
                </div>
              </form>
            </section>

            <section className="panel">
              <div className="card-header">
                <div>
                  <h3>Pipeline</h3>
                  <p>{visibleOrganizations.length} visible organizations after filtering</p>
                </div>
                <span className="ghost-badge">Sorts by priority and health</span>
              </div>
              <div className="organization-list">
                {visibleOrganizations.map((organization) => {
                  const selected = organization.id === selectedOrganization?.id;
                  return (
                    <button
                      key={organization.id}
                      type="button"
                      className={`organization-card ${selected ? 'selected' : ''}`}
                      onClick={() => setSelectedId(organization.id)}
                    >
                      <div className="organization-card-top">
                        <div>
                          <p className="organization-type">{organization.type}</p>
                          <h4>{organization.name}</h4>
                        </div>
                        <span className="health-score">{organization.health}%</span>
                      </div>
                      <p className="organization-summary">{organization.summary}</p>
                      <div className="organization-meta">
                        <span>{organization.owner}</span>
                        <span>{formatDate(organization.nextFollowUp)}</span>
                      </div>
                      <div className="tag-row">
                        {organization.tags.map((tag) => (
                          <span className="tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="panel">
              <div className="card-header">
                <div>
                  <h3>Priority follow-ups</h3>
                  <p>Touch these accounts before the next meeting slips.</p>
                </div>
              </div>
              <div className="followup-list">
                {followUpQueue.map((organization) => (
                  <article className="followup-item" key={organization.id}>
                    <div>
                      <h4>{organization.name}</h4>
                      <p>
                        {organization.owner} · {organization.contacts[0]?.preferredChannel} · {organization.location}
                      </p>
                    </div>
                    <div>
                      <strong>{formatDate(organization.nextFollowUp)}</strong>
                      <button type="button" onClick={() => setSelectedId(organization.id)}>
                        Open
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="panel detail-panel">
            {selectedOrganization ? (
              <>
                <div className="card-header detail-header">
                  <div>
                    <p className="organization-type">{selectedOrganization.type}</p>
                    <h3>{selectedOrganization.name}</h3>
                    <p>{selectedOrganization.summary}</p>
                  </div>
                  <div className="detail-badges">
                    <span className="health-badge">Health {selectedOrganization.health}%</span>
                    <span className="priority-badge">{selectedOrganization.priority} priority</span>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-card">
                    <span>Owner</span>
                    <strong>{selectedOrganization.owner}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Stage</span>
                    <select value={selectedOrganization.stage} onChange={(event) => moveStage(event.target.value as PartnershipStage)}>
                      {stageOrder.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="detail-card">
                    <span>Next follow-up</span>
                    <strong>{formatDate(selectedOrganization.nextFollowUp)}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Website</span>
                    <strong>{selectedOrganization.website}</strong>
                  </div>
                </div>

                <div className="detail-actions">
                  <button type="button" className="primary-button" onClick={bumpFollowUp}>
                    Push follow-up one week
                  </button>
                  <button type="button" className="secondary-button" onClick={editingNoteId ? cancelEditingNote : () => setNoteDraft('')}>
                    Clear note
                  </button>
                </div>

                <section className="stack">
                  <div className="subsection-header">
                    <h4>Follow-up reminders</h4>
                    <span>{reminderDueSoon.length} due soon</span>
                  </div>
                  <div className="form-grid reminder-grid">
                    <label className="field-group">
                      <span>Reminder date</span>
                      <input type="date" value={reminderDateDraft} onChange={(event) => setReminderDateDraft(event.target.value)} />
                    </label>
                    <label className="field-group span-2">
                      <span>Reminder message</span>
                      <input
                        value={reminderMessageDraft}
                        onChange={(event) => setReminderMessageDraft(event.target.value)}
                        placeholder="What should happen next?"
                      />
                    </label>
                  </div>
                  <div className="detail-actions compact-actions">
                    <button type="button" className="primary-button" onClick={saveReminder}>
                      Save reminder
                    </button>
                    <button type="button" className="secondary-button" onClick={completeReminder}>
                      Mark done
                    </button>
                  </div>
                  <div className="reminder-list">
                    {reminderQueue.slice(0, 3).map((organization) => (
                      <article className="reminder-item" key={organization.id}>
                        <div>
                          <strong>{organization.name}</strong>
                          <p>{organization.reminderMessage}</p>
                        </div>
                        <div className="reminder-meta">
                          <span>{formatDate(organization.reminderDate)}</span>
                          <span className={`status-pill ${organization.reminderStatus === 'Open' ? 'open' : 'done'}`}>
                            {organization.reminderStatus}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="stack">
                  <div className="subsection-header">
                    <h4>Contacts</h4>
                    <span>{selectedOrganization.contacts.length} people</span>
                  </div>
                  <div className="contact-list">
                    {selectedOrganization.contacts.map((contact) => (
                      <article className="contact-card" key={contact.email}>
                        <strong>{contact.name}</strong>
                        <p>{contact.role}</p>
                        <span>{contact.email}</span>
                        <span>{contact.phone}</span>
                        <small>
                          Preferred via {contact.preferredChannel} · last touch {formatDate(contact.lastTouch)}
                        </small>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="stack">
                  <div className="subsection-header">
                    <h4>Recent meetings</h4>
                    <span>{selectedOrganization.meetings.length} logged</span>
                  </div>
                  <div className="timeline-list">
                    {selectedOrganization.meetings.map((meeting) => (
                      <article className="timeline-item" key={meeting.id}>
                        <div className="timeline-date">{formatDate(meeting.date)}</div>
                        <div>
                          <strong>{meeting.subject}</strong>
                          <p>{meeting.outcome}</p>
                          <small>Next step: {meeting.nextStep}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="stack">
                  <div className="subsection-header">
                    <h4>Notes</h4>
                    <span>{selectedOrganization.notes.length} entries</span>
                  </div>
                  <textarea
                    aria-label="Add a partnership note"
                    placeholder={editingNoteId ? 'Update the selected note.' : 'Capture the next step, objection, or decision here.'}
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                  />
                  <div className="detail-actions compact-actions">
                    <button type="button" className="primary-button" onClick={saveNote}>
                      {editingNoteId ? 'Update note' : 'Save note'}
                    </button>
                    {editingNoteId ? (
                      <button type="button" className="secondary-button" onClick={cancelEditingNote}>
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                  <div className="note-list">
                    {selectedOrganization.notes.map((note) => (
                      <article className="note-item" key={note.id}>
                        <div className="note-meta">
                          <strong>{note.author}</strong>
                          <span>{note.updatedAt ? 'Edited' : note.tag}</span>
                          <small>{formatDate(note.updatedAt ?? note.createdAt)}</small>
                        </div>
                        <p>{note.body}</p>
                        <div className="note-actions">
                          <button type="button" onClick={() => startEditingNote(note)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteNote(note.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div className="empty-state">
                <h3>No organization selected</h3>
                <p>Adjust the filters or clear the search to reopen the pipeline.</p>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
