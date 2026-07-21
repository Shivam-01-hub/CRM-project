import type { FollowUpItem } from '../types/crm';
import { formatDate } from '../lib/helpers';

type FollowUpQueueProps = {
  followUpQueue: FollowUpItem[];
  onSelect: (id: string) => void;
};

export function FollowUpQueue({ followUpQueue, onSelect }: FollowUpQueueProps) {
  if (followUpQueue.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <div className="card-header">
        <div>
          <h3>Priority follow-ups</h3>
          <p>Touch these accounts before the next meeting slips.</p>
        </div>
      </div>
      <div className="followup-list">
        {followUpQueue.map((org) => (
          <article className="followup-item" key={org.id}>
            <div>
              <h4>{org.name}</h4>
              <p>{org.reminderMessage}</p>
            </div>
            <div>
              <strong>{formatDate(org.nextFollowUp)}</strong>
              <button type="button" onClick={() => onSelect(org.id)}>
                Open
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

