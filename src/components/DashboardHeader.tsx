type DashboardHeaderProps = {
  search: string;
  stageFilter: string;
  followUpsDue: number;
  conversations: number;
  notes: number;
  averageHealth: number;
  userName: string;
  userRole: 'admin' | 'user';
  onSearchChange: (value: string) => void;
  onSignOut: () => void;
};

function DashboardHeader({
  search,
  stageFilter,
  followUpsDue,
  conversations,
  notes,
  averageHealth,
  userName,
  userRole,
  onSearchChange,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Startup partnership team</p>
          <h2>Track relationships, not spreadsheets.</h2>
          <p className="subtle-copy">Search conversations, inspect the pipeline, and keep next steps visible for the whole team.</p>
        </div>
        <div className="search-panel">
          <div className="account-chip">
            <span>
              {userName} · {userRole}
            </span>
            <button type="button" className="secondary-button" onClick={onSignOut}>
              Sign out
            </button>
          </div>
          <label>
            <span>Search organizations</span>
            <input
              aria-label="Search organizations"
              placeholder="University, founder, mentor, or partner"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <div className="filter-pill">Filter: {stageFilter}</div>
        </div>
      </header>

      <section className="stats-grid">
        <article className="metric-card">
          <span>Follow-up risk</span>
          <strong>{followUpsDue}</strong>
          <p>Relationships with actions due now or within the week.</p>
        </article>
        <article className="metric-card">
          <span>Partner health</span>
          <strong>{Math.round(averageHealth)}%</strong>
          <p>Average relationship score across the active pipeline.</p>
        </article>
        <article className="metric-card">
          <span>Meetings logged</span>
          <strong>{conversations}</strong>
          <p>Conversations captured with context and next steps.</p>
        </article>
        <article className="metric-card">
          <span>Notes captured</span>
          <strong>{notes}</strong>
          <p>Decision history available for every relationship.</p>
        </article>
      </section>
    </>
  );
}

export default DashboardHeader;
