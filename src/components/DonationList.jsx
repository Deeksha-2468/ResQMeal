import { useEffect, useState } from "react";
import { listMyDonations } from "../lib/donations.js";
import { UNIT_OPTIONS } from "../lib/donationValidation.js";
import StatusBadge from "./StatusBadge.jsx";
import EmptyState from "./EmptyState.jsx";

const unitLabel = (value) => UNIT_OPTIONS.find((o) => o.value === value)?.label ?? value;

const formatDateTime = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? String(iso ?? "") : date.toLocaleString();
};

export default function DonationList({ refreshKey }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    listMyDonations().then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) {
        setError(loadError.message || "Your donations could not be loaded.");
        setDonations([]);
      } else {
        setDonations(data ?? []);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (loading) {
    return <p className="hint" role="status">Loading your donations...</p>;
  }

  if (error) {
    return (
      <p className="rm-field-error" role="alert">
        {error}
      </p>
    );
  }

  if (donations.length === 0) {
    return (
      <EmptyState
        title="No donations yet"
        message="Post your first surplus donation above."
      />
    );
  }

  const now = Date.now();

  return (
    <ul className="rm-card-list">
      {donations.map((donation) => {
        const pickupTime = new Date(donation.pickup_by).getTime();
        const pickupPassed = !Number.isNaN(pickupTime) && pickupTime < now;
        return (
          <li key={donation.id} className="rm-donation-item">
            <div className="status-row">
              <strong>{donation.food_name}</strong>
              <StatusBadge status={donation.status} />
            </div>
            <span>
              {donation.quantity} {unitLabel(donation.unit)}
            </span>
            <span className="disclaimer">Pickup by: {formatDateTime(donation.pickup_by)}</span>
            {pickupPassed && <span className="rm-note-passed">Pickup window passed</span>}
          </li>
        );
      })}
    </ul>
  );
}
