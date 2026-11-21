import PageHeader from "../components/PageHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const LIFECYCLE = ["posted", "claimed", "collected", "delivered"];

export default function NgoDashboard() {
  return (
    <>
      <PageHeader title="NGO / Community Kitchen dashboard" accent="accent-ngo" />

      <section className="page-section">
        <h2>Available donations</h2>
        <EmptyState
          title="No donations available"
          message="Surplus food posted by nearby restaurants will appear here."
        />
      </section>

      <section className="page-section">
        <h2>Recommended for you</h2>
        <EmptyState
          title="No recommendations yet"
          message="Matching explanations come in Milestone 3."
        />
      </section>

      <section className="page-section">
        <h2>Collections and deliveries</h2>
        <EmptyState
          title="No collections yet"
          message="Claimed and collected donations will be tracked here."
        />
      </section>

      <section className="page-section">
        <h2>Lifecycle preview</h2>
        <div className="status-row">
          {LIFECYCLE.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>
    </>
  );
}
