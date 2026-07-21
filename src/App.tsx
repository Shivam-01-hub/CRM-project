import { type FormEvent, useEffect, useMemo, useState } from 'react';
import seedOrganizationsData from './data/seed-organizations.json';
import AuthScreen from './components/AuthScreen';
import DashboardHeader from './components/DashboardHeader';
import Sidebar from './components/Sidebar';
import { AddPartnerForm, createDefaultNewPartnerDraft } from './components/AddPartnerForm';
import { PipelineList } from './components/PipelineList';
import { FollowUpQueue } from './components/FollowUpQueue';
import { DetailPanel } from './components/DetailPanel';
import { apiRequest } from './lib/api';
import { stageOrder, stagePalette, formatDate, toDateInputValue, toIsoFromDateInput, addDays, createId, getToday } from './lib/helpers';
import type {
  Organization,
  NewPartnerDraft,
  PartnershipStage,
  Priority,
  Note,
  AuthSession,
  ReminderItem,
  AuthMode,
} from './types/crm';

type SeedOrganization = Omit<Organization, 'reminderDate' | 'reminderMessage' | 'reminderStatus'>;

type AuthResponse = {
  user: AuthSession;
  accessToken: string;
};

const storageKey = 'partnership-crm-organizations-v2';
const authStorageKey = 'partnership-crm-access-token';

const initialOrganizations = seedOrganizationsData as SeedOrganization[];

const seedOrganizations: Organization[] = initialOrganizations.map((org) => ({
  ...org,
  reminderDate: org.nextFollowUp,
  reminderMessage: `Follow up with ${org.name}.`,
  reminderStatus: 'Open',
}));

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(authStorageKey);
  });
  const [authUser, setAuthUser] = useState<AuthSession | null>(null);

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    if (typeof window === 'undefined') return seedOrganizations;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return seedOrganizations;
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
    if (typeof window === 'undefined') return;

    if (authToken) {
      window.localStorage.setItem(authStorageKey, authToken);
    } else {
      window.localStorage.removeItem(authStorageKey);
    }
  }, [authToken]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(organizations));
    }
  }, [organizations]);

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
      // If backend is unavailable, auto-activate demo mode
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('Unable to reach the API') || msg.includes('500') || msg.includes('fetch')) {
        setAuthUser({ id: 'demo-user', name: authName.trim() || 'Demo User', email: authEmail.trim() || 'demo@crm.com', role: 'admin' });
        setAuthToken('demo-token');
        setAuthError('');
      } else {
        setAuthError(msg || 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedId) ?? organizations[0],
    [organizations, selectedId],
  );

  const visibleOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((org) => {
      const stageMatches = stageFilter === 'All' || org.stage === stageFilter;
      const queryMatches =
        query.length === 0 ||
        [org.name, org.type, org.owner, org.location, org.summary, ...org.tags].join(' ').toLowerCase().includes(query);

      return stageMatches && queryMatches;
    });
  }, [organizations, search, stageFilter]);

  useEffect(() => {
    if (visibleOrganizations.length === 0) return;
    const selectedVisible = visibleOrganizations.some((org) => org.id === selectedId);
    if (!selectedVisible) {
      setSelectedId(visibleOrganizations[0].id);
    }
  }, [selectedId, visibleOrganizations]);

  useEffect(() => {
    if (!selectedOrganization) return;
    setReminderDateDraft(toDateInputValue(selectedOrganization.reminderDate));
    setReminderMessageDraft(selectedOrganization.reminderMessage);
    setEditingNoteId(null);
  }, [selectedOrganization?.id, selectedOrganization?.reminderDate, selectedOrganization?.reminderMessage]);

  const stats = useMemo(() => {
    const followUpsDue = organizations.filter((org) => new Date(org.nextFollowUp) <= new Date()).length;
    const activePartners = organizations.filter((org) => org.stage === 'Active').length;
    const conversations = organizations.reduce((count, org) => count + org.meetings.length, 0);
    const notes = organizations.reduce((count, org) => count + org.notes.length, 0);
    const averageHealth = organizations.reduce((sum, org) => sum + org.health, 0) / organizations.length;

    return { followUpsDue, activePartners, conversations, notes, averageHealth };
  }, [organizations]);

  const stageCounts = useMemo(
    () =>
      stageOrder.map((stage) => ({
        stage,
        count: organizations.filter((org) => org.stage === stage).length,
      })),
    [organizations],
  );

  const followUpQueue = useMemo(
    () =>
      [...organizations]
        .filter(
          (org) =>
            org.reminderStatus === 'Open' &&
            new Date(org.reminderDate).getTime() <= new Date(addDays(getToday(), 7)).getTime(),
        )
        .sort((left, right) => new Date(left.reminderDate).getTime() - new Date(right.reminderDate).getTime()),
    [organizations],
  );

  const reminderQueue = useMemo(
    () =>
      [...organizations]
        .filter((org) => org.reminderStatus === 'Open')
        .sort((left, right) => new Date(left.reminderDate).getTime() - new Date(right.reminderDate).getTime()),
    [organizations],
  );

  const reminderDueSoon = useMemo(
    () =>
      reminderQueue.filter(
        (org) => new Date(org.reminderDate).getTime() <= new Date(addDays(getToday(), 7)).getTime(),
      ),
    [reminderQueue],
  );

  const updateOrganization = (orgId: string, updater: (org: Organization) => Organization) => {
    setOrganizations((current) =>
      current.map((org) => (org.id === orgId ? updater(org) : org)),
    );
  };

  const createPartner = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPartnerDraft.name.trim() || !newPartnerDraft.owner.trim()) return;

    const reminderDate = newPartnerDraft.reminderDate || toDateInputValue(addDays(getToday(), 7));
    const nextFollowUp = toIsoFromDateInput(reminderDate);
    const org: Organization = {
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
      lastTouch: getToday(),
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
          lastTouch: getToday(),
        },
      ],
      meetings: [],
      notes: [
        {
          id: createId(),
          author: 'System',
          body: 'New partner created from the intake form.',
          createdAt: getToday(),
          tag: 'Created',
        },
      ],
      tags: [newPartnerDraft.type, 'New partner'],
    };

    setOrganizations((current) => [org, ...current]);
    setSelectedId(org.id);
    setSearch('');
    setStageFilter('All');
    setNewPartnerDraft(createDefaultNewPartnerDraft());
  };

  const saveNote = () => {
    const content = noteDraft.trim();
    if (!content || !selectedOrganization) return;

    if (editingNoteId) {
      updateOrganization(selectedOrganization.id, (org) => ({
        ...org,
        lastTouch: getToday(),
        notes: org.notes.map((note) =>
          note.id === editingNoteId ? { ...note, body: content, updatedAt: getToday() } : note,
        ),
      }));
      setEditingNoteId(null);
      setNoteDraft('');
      return;
    }

    updateOrganization(selectedOrganization.id, (org) => ({
      ...org,
      lastTouch: getToday(),
      notes: [
        {
          id: crypto.randomUUID(),
          author: 'Founder',
          body: content,
          createdAt: getToday(),
          tag: 'Note',
        },
        ...org.notes,
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
    if (!selectedOrganization) return;

    updateOrganization(selectedOrganization.id, (org) => ({
      ...org,
      lastTouch: getToday(),
      notes: org.notes.filter((note) => note.id !== noteId),
    }));

    if (editingNoteId === noteId) {
      cancelEditingNote();
    }
  };

  const moveStage = (nextStage: PartnershipStage) => {
    if (!selectedOrganization) return;

    updateOrganization(selectedOrganization.id, (org) => ({
      ...org,
      stage: nextStage,
      lastTouch: getToday(),
      notes: [
        {
          id: crypto.randomUUID(),
          author: 'System',
          body: `Moved partnership stage from ${org.stage} to ${nextStage}.`,
          createdAt: getToday(),
          tag: 'Status',
        },
        ...org.notes,
      ],
    }));
  };

  const bumpFollowUp = () => {
    if (!selectedOrganization) return;

    updateOrganization(selectedOrganization.id, (org) => ({
      ...org,
      nextFollowUp: addDays(getToday(), 7),
      reminderDate: addDays(getToday(), 7),
      reminderMessage: `Follow up with ${org.name} after the current step.`,
      reminderStatus: 'Open',
      lastTouch: getToday(),
      notes: [
        {
          id: crypto.randomUUID(),
          author: 'System',
          body: 'Follow-up pushed one week out after completing the current step.',
          createdAt: getToday(),
          tag: 'Follow-up',
        },
        ...org.notes,
      ],
    }));
  };

  const saveReminder = () => {
    if (!selectedOrganization || !reminderDateDraft) return;

    updateOrganization(selectedOrganization.id, (org) => ({
      ...org,
      nextFollowUp: toIsoFromDateInput(reminderDateDraft),
      reminderDate: toIsoFromDateInput(reminderDateDraft),
      reminderMessage: reminderMessageDraft.trim() || org.reminderMessage,
      reminderStatus: 'Open',
      lastTouch: getToday(),
      notes: [
        {
          id: createId(),
          author: 'System',
          body: `Reminder set for ${formatDate(toIsoFromDateInput(reminderDateDraft))}: ${
            reminderMessageDraft.trim() || org.reminderMessage
          }`,
          createdAt: getToday(),
          tag: 'Reminder',
        },
        ...org.notes,
      ],
    }));
  };

  const completeReminder = () => {
    if (!selectedOrganization) return;

    updateOrganization(selectedOrganization.id, (org) => ({
      ...org,
      reminderStatus: 'Done',
      nextFollowUp: addDays(getToday(), 14),
      lastTouch: getToday(),
      notes: [
        {
          id: createId(),
          author: 'System',
          body: 'Reminder marked complete and pushed into the next follow-up cycle.',
          createdAt: getToday(),
          tag: 'Reminder',
        },
        ...org.notes,
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
      <>
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
        <div style={{ textAlign: 'center', marginTop: '-60px' }}>
          <button
            type="button"
            className="secondary-button"
            style={{ fontSize: '0.85rem', padding: '8px 20px' }}
            onClick={() => {
              setAuthUser({ id: 'demo-user', name: 'Demo User', email: 'demo@crm.com', role: 'admin' });
              setAuthToken('demo-token');
              setAuthLoading(false);
              setAuthError('');
            }}
          >
            Continue as Guest (Offline Demo)
          </button>
        </div>
      </>
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
            <AddPartnerForm
              draft={newPartnerDraft}
              onChange={setNewPartnerDraft}
              onSubmit={createPartner}
              onReset={() => setNewPartnerDraft(createDefaultNewPartnerDraft())}
            />

            <PipelineList
              organizations={visibleOrganizations}
              selectedOrganization={selectedOrganization}
              onSelect={setSelectedId}
            />

            <FollowUpQueue
              followUpQueue={followUpQueue}
              onSelect={setSelectedId}
            />
          </div>

          <DetailPanel
            organization={selectedOrganization}
            noteDraft={noteDraft}
            editingNoteId={editingNoteId}
            reminderDateDraft={reminderDateDraft}
            reminderMessageDraft={reminderMessageDraft}
            reminderDueSoon={reminderDueSoon}
            reminderQueue={reminderQueue}
            onNoteDraftChange={setNoteDraft}
            onSaveNote={saveNote}
            onStartEditNote={startEditingNote}
            onCancelEditNote={cancelEditingNote}
            onDeleteNote={deleteNote}
            onMoveStage={moveStage}
            onBumpFollowUp={bumpFollowUp}
            onReminderDateChange={setReminderDateDraft}
            onReminderMessageChange={setReminderMessageDraft}
            onSaveReminder={saveReminder}
            onCompleteReminder={completeReminder}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

