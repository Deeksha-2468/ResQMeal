import PageHeader from "../components/PageHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function VolunteerDashboard() {
  return (
    <>
      <PageHeader title="Volunteer dashboard" accent="accent-volunteer" />

      <section className="page-section">
        <h2>Assigned pickups</h2>
        <EmptyState
          title="No assigned pickups"
          message="Pickups assigned to you will be listed here."
        />
      </section>

      <section className="page-section">
        <h2>Available pickup tasks</h2>
        <EmptyState
          title="No open tasks"
          message="Pickup and delivery tasks needing a volunteer will appear here."
        />
      </section>

      <section className="page-section">
        <h2>Completed pickups</h2>
        <EmptyState
          title="No completed pickups"
          message="Your finished pickups and deliveries will be recorded here."
        />
      </section>
    </>
  );
}
