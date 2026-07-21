import { type FormEvent } from 'react';
import type { NewPartnerDraft, OrganizationType, Priority } from '../types/crm';
import { toDateInputValue, addDays, today } from '../lib/helpers';

type AddPartnerFormProps = {
  draft: NewPartnerDraft;
  onChange: (draft: NewPartnerDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function AddPartnerForm({ draft, onChange, onSubmit, onReset }: AddPartnerFormProps) {
  return (
    <section className="panel form-panel">
      <div className="card-header">
        <div>
          <h3>Add new partner</h3>
          <p>Create a new relationship and seed its first reminder.</p>
        </div>
        <span className="ghost-badge">Local data</span>
      </div>

      <form className="partner-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="field-group">
            <span>Organization name</span>
            <input
              required
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              placeholder="Skyline University"
            />
          </label>
          <label className="field-group">
            <span>Type</span>
            <select
              value={draft.type}
              onChange={(e) => onChange({ ...draft, type: e.target.value as OrganizationType })}
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
              value={draft.owner}
              onChange={(e) => onChange({ ...draft, owner: e.target.value })}
              placeholder="Ava"
            />
          </label>
          <label className="field-group">
            <span>Priority</span>
            <select
              value={draft.priority}
              onChange={(e) => onChange({ ...draft, priority: e.target.value as Priority })}
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
              value={draft.website}
              onChange={(e) => onChange({ ...draft, website: e.target.value })}
              placeholder="partner.org"
            />
          </label>
          <label className="field-group">
            <span>Location</span>
            <input
              value={draft.location}
              onChange={(e) => onChange({ ...draft, location: e.target.value })}
              placeholder="Remote"
            />
          </label>
        </div>

        <label className="field-group">
          <span>Summary</span>
          <textarea
            rows={3}
            value={draft.summary}
            onChange={(e) => onChange({ ...draft, summary: e.target.value })}
            placeholder="Why this partner matters and what value you are trying to create."
          />
        </label>

        <div className="form-grid">
          <label className="field-group">
            <span>Contact name</span>
            <input
              value={draft.contactName}
              onChange={(e) => onChange({ ...draft, contactName: e.target.value })}
              placeholder="Primary contact"
            />
          </label>
          <label className="field-group">
            <span>Contact role</span>
            <input
              value={draft.contactRole}
              onChange={(e) => onChange({ ...draft, contactRole: e.target.value })}
              placeholder="Partnership lead"
            />
          </label>
          <label className="field-group">
            <span>Contact email</span>
            <input
              value={draft.contactEmail}
              onChange={(e) => onChange({ ...draft, contactEmail: e.target.value })}
              placeholder="person@company.com"
            />
          </label>
          <label className="field-group">
            <span>Contact phone</span>
            <input
              value={draft.contactPhone}
              onChange={(e) => onChange({ ...draft, contactPhone: e.target.value })}
              placeholder="(555) 555-0123"
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="field-group">
            <span>Reminder date</span>
            <input
              type="date"
              value={draft.reminderDate}
              onChange={(e) => onChange({ ...draft, reminderDate: e.target.value })}
            />
          </label>
          <label className="field-group span-2">
            <span>Reminder message</span>
            <input
              value={draft.reminderMessage}
              onChange={(e) => onChange({ ...draft, reminderMessage: e.target.value })}
              placeholder="Follow up after the intro call."
            />
          </label>
        </div>

        <div className="detail-actions">
          <button type="submit" className="primary-button">
            Add new partner
          </button>
          <button type="button" className="secondary-button" onClick={onReset}>
            Reset form
          </button>
        </div>
      </form>
    </section>
  );
}

export function createDefaultNewPartnerDraft(): NewPartnerDraft {
  return {
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
  };
}

