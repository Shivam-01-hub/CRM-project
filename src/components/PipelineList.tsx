import type { Organization } from '../types/crm';
import { formatDate } from '../lib/helpers';

type PipelineListProps = {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onSelect: (id: string) => void;
};

export function PipelineList({ organizations, selectedOrganization, onSelect }: PipelineListProps) {
  return (
    <section className="panel">
      <div className="card-header">
        <div>
          <h3>Pipeline</h3>
          <p>{organizations.length} visible organizations after filtering</p>
        </div>
        <span className="ghost-badge">Sorts by priority and health</span>
      </div>
      <div className="organization-list">
        {organizations.map((org) => {
          const selected = org.id === selectedOrganization?.id;
          return (
            <button
              key={org.id}
              type="button"
              className={`organization-card ${selected ? 'selected' : ''}`}
              onClick={() => onSelect(org.id)}
            >
              <div className="organization-card-top">
                <div>
                  <p className="organization-type">{org.type}</p>
                  <h4>{org.name}</h4>
                </div>
                <span className="health-score">{org.health}%</span>
              </div>
              <p className="organization-summary">{org.summary}</p>
              <div className="organization-meta">
                <span>{org.owner}</span>
                <span>{formatDate(org.nextFollowUp)}</span>
              </div>
              <div className="tag-row">
                {org.tags.map((tag) => (
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
  );
}

