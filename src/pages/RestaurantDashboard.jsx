import PageHeader from "../components/PageHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function RestaurantDashboard() {
  return (
    <>
      <PageHeader title="Restaurant dashboard" accent="accent-restaurant" />

      <section className="page-section">
        <h2>Post surplus food</h2>
        <fieldset disabled>
          <div className="form-field">
            <label htmlFor="resto-item">Food item</label>
            <input id="resto-item" type="text" placeholder="e.g. Vegetable biryani, 10 portions" />
          </div>
          <div className="form-field">
            <label htmlFor="resto-pickup">Pickup window</label>
            <input id="resto-pickup" type="text" placeholder="e.g. 9:00 PM – 10:00 PM" />
          </div>
          <button type="button" className="btn" disabled>
            Post donation
          </button>
        </fieldset>
        <p className="hint">Donation form arrives in Milestone 2.</p>
      </section>

      <section className="page-section">
        <h2>Active donations</h2>
        <EmptyState
          title="No active donations"
          message="Donations you post will appear here."
        />
      </section>

      <section className="page-section">
        <h2>Donation history</h2>
        <EmptyState
          title="No past donations"
          message="Completed and expired donations will be listed here."
        />
      </section>
    </>
  );
}
