import type { Organization, Note, PartnershipStage, ReminderItem } from '../types/crm';
import { formatDate, stageOrder } from '../lib/helpers';

type DetailPanelProps = {
  organization: Organization | null;
  noteDraft: string;
  editingNoteId: string | null;
  reminderDateDraft: string;
  reminderMessageDraft: string;
  reminderDueSoon: ReminderItem[];
  reminderQueue: ReminderItem[];
  onNoteDraftChange: (value: string) => void;
  onSaveNote: () => void;
  onStartEditNote: (note: Note) => void;
  onCancelEditNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onMoveStage: (stage: PartnershipStage) => void;
  onBumpFollowUp: () => void;
  onReminderDateChange: (value: string) => void;
  onReminderMessageChange: (value: string) => void;
  onSaveReminder: () => void;
  onCompleteReminder: () => void;
};

export function DetailPanel({
  organization,
  noteDraft,
  editingNoteId,
  reminderDateDraft,
  reminderMessageDraft,
  reminderDueSoon,
  reminderQueue,
  onNoteDraftChange,
  onSaveNote,
  onStartEditNote,
  onCancelEditNote,
  onDeleteNote,
  onMoveStage,
  onBumpFollowUp,
  onReminderDateChange,
  onReminderMessageChange,
  onSaveReminder,
  onCompleteReminder,
}: DetailPanelProps) {
  if (!organization) {
    return (
      <section className="panel detail-panel">
        <div className="empty-state">
          <h3>No organization selected</h3>
          <p>Adjust the filters or clear the search to reopen the pipeline.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      <div className="card-header detail-header">
        <div>
          <p className="organization-type">{organization.type}</p>
          <h3>{organization.name}</h3>
          <p>{organization.summary}</p>
        </div>
        <div className="detail-badges">
          <span className="health-badge">Health {organization.health}%</span>
          <span className="priority-badge">{organization.priority} priority</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <span>Owner</span>
          <strong>{organization.owner}</strong>
        </div>
        <div className="detail-card">
          <span>Stage</span>
          <select
            value={organization.stage}
            onChange={(e) => onMoveStage(e.target.value as PartnershipStage)}
          >
            {stageOrder.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
        <div className="detail-card">
          <span>Next follow-up</span>
          <strong>{formatDate(organization.nextFollowUp)}</strong>
        </div>
        <div className="detail-card">
          <span>Website</span>
          <strong>{organization.website}</strong>
        </div>
      </div>

      <div className="detail-actions">
        <button type="button" className="primary-button" onClick={onBumpFollowUp}>
          Push follow-up one week
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={editingNoteId ? onCancelEditNote : () => onNoteDraftChange('')}
        >
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
            <input
              type="date"
              value={reminderDateDraft}
              onChange={(e) => onReminderDateChange(e.target.value)}
            />
          </label>
          <label className="field-group span-2">
            <span>Reminder message</span>
            <input
              value={reminderMessageDraft}
              onChange={(e) => onReminderMessageChange(e.target.value)}
              placeholder="What should happen next?"
            />
          </label>
        </div>
        <div className="detail-actions compact-actions">
          <button type="button" className="primary-button" onClick={onSaveReminder}>
            Save reminder
          </button>
          <button type="button" className="secondary-button" onClick={onCompleteReminder}>
            Mark done
          </button>
        </div>
        <div className="reminder-list">
          {reminderQueue.slice(0, 3).map((item) => (
            <article className="reminder-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.reminderMessage}</p>
              </div>
              <div className="reminder-meta">
                <span>{formatDate(item.reminderDate)}</span>
                <span className={`status-pill ${item.reminderStatus === 'Open' ? 'open' : 'done'}`}>
                  {item.reminderStatus}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contacts */}
      <section className="stack">
        <div className="subsection-header">
          <h4>Contacts</h4>
          <span>{organization.contacts.length} people</span>
        </div>
        <div className="contact-list">
          {organization.contacts.map((contact) => (
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

      {/* Meetings */}
      <section className="stack">
        <div className="subsection-header">
          <h4>Recent meetings</h4>
          <span>{organization.meetings.length} logged</span>
        </div>
        <div className="timeline-list">
          {organization.meetings.map((meeting) => (
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

      {/* Notes */}
      <section className="stack">
        <div className="subsection-header">
          <h4>Notes</h4>
          <span>{organization.notes.length} entries</span>
        </div>
        <textarea
          aria-label="Add a partnership note"
          placeholder={
            editingNoteId ? 'Update the selected note.' : 'Capture the next step, objection, or decision here.'
          }
          value={noteDraft}
          onChange={(e) => onNoteDraftChange(e.target.value)}
        />
        <div className="detail-actions compact-actions">
          <button type="button" className="primary-button" onClick={onSaveNote}>
            {editingNoteId ? 'Update note' : 'Save note'}
          </button>
          {editingNoteId ? (
            <button type="button" className="secondary-button" onClick={onCancelEditNote}>
              Cancel edit
            </button>
          ) : null}
        </div>
        <div className="note-list">
          {organization.notes.map((note) => (
            <article className="note-item" key={note.id}>
              <div className="note-meta">
                <strong>{note.author}</strong>
                <span>{note.updatedAt ? 'Edited' : note.tag}</span>
                <small>{formatDate(note.updatedAt ?? note.createdAt)}</small>
              </div>
              <p>{note.body}</p>
              <div className="note-actions">
                <button type="button" onClick={() => onStartEditNote(note)}>
                  Edit
                </button>
                <button type="button" onClick={() => onDeleteNote(note.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

