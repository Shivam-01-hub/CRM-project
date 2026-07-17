type PartnershipStage = 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Active';

type StageFilter = 'All' | PartnershipStage;

type SidebarStats = {
  followUpsDue: number;
  activePartners: number;
  conversations: number;
};

type StageCount = {
  stage: PartnershipStage;
  count: number;
};

type FollowUpItem = {
  id: string;
  name: string;
  reminderMessage: string;
  nextFollowUp: string;
};

type SidebarProps = {
  stats: SidebarStats;
  stageCounts: StageCount[];
  stageFilter: StageFilter;
  totalOrganizations: number;
  followUpQueue: FollowUpItem[];
  stagePalette: Record<PartnershipStage, string>;
  onStageFilterChange: (stage: StageFilter) => void;
  onSelectOrganization: (organizationId: string) => void;
  formatDate: (value: string) => string;
};

function Sidebar({
  stats,
  stageCounts,
  stageFilter,
  totalOrganizations,
  followUpQueue,
  stagePalette,
  onStageFilterChange,
  onSelectOrganization,
  formatDate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand-row">
          <div className="brand-mark">P</div>
          <div>
            <p className="eyebrow">Internal CRM</p>
            <h1>Partnership OS</h1>
          </div>
        </div>
        <p className="sidebar-copy">Keep every university, mentor, startup founder, and partner in one disciplined operating system.</p>
      </div>

      <section className="sidebar-card hero-card">
        <div className="hero-metric">
          <strong>{stats.followUpsDue}</strong>
          <span>follow-ups due in the next 7 days</span>
        </div>
        <div className="hero-split">
          <div>
            <strong>{stats.activePartners}</strong>
            <span>active relationships</span>
          </div>
          <div>
            <strong>{stats.conversations}</strong>
            <span>meetings logged</span>
          </div>
        </div>
      </section>

      <section className="sidebar-card">
        <div className="card-header compact">
          <h2>Stage Mix</h2>
          <span>{totalOrganizations} accounts</span>
        </div>
        <div className="stage-list">
          {stageCounts.map((entry) => (
            <button
              className={`stage-row ${stageFilter === entry.stage ? 'active' : ''}`}
              key={entry.stage}
              type="button"
              onClick={() => onStageFilterChange(entry.stage)}
            >
              <span className="stage-dot" style={{ background: stagePalette[entry.stage] }} />
              <span>{entry.stage}</span>
              <strong>{entry.count}</strong>
            </button>
          ))}
          <button className={`stage-row ${stageFilter === 'All' ? 'active' : ''}`} type="button" onClick={() => onStageFilterChange('All')}>
            <span className="stage-dot all" />
            <span>All stages</span>
            <strong>{totalOrganizations}</strong>
          </button>
        </div>
      </section>

      <section className="sidebar-card">
        <div className="card-header compact">
          <h2>Reminder Queue</h2>
          <span>{followUpQueue.length} soon</span>
        </div>
        <div className="queue-list">
          {followUpQueue.slice(0, 4).map((organization) => (
            <button key={organization.id} type="button" className="queue-item" onClick={() => onSelectOrganization(organization.id)}>
              <div>
                <strong>{organization.name}</strong>
                <p>{organization.reminderMessage}</p>
              </div>
              <span>{formatDate(organization.nextFollowUp)}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
