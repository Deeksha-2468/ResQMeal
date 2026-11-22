import EmptyState from "./EmptyState.jsx";
import { formatPickup } from "../lib/claims.js";

const humanise = (value) => String(value ?? "").replace(/_/g, " ");

function allergenText(allergens) {
  if (Array.isArray(allergens)) return allergens.length ? allergens.join(", ") : "None listed";
  return allergens ? String(allergens) : "None listed";
}

export default function NgoDonationList({ items, onClaim, claimingId, error, emptyText }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyText}
        message="Surplus food posted by restaurants will appear here."
      />
    );
  }

  return (
    <>
      {error && (
        <p className="rm-field-error" role="alert">
          {error}
        </p>
      )}
      <ul className="rm-card-list">
        {items.map(({ donation, reasons }, index) => {
          const isClaiming = claimingId === donation.id;
          return (
            <li key={donation.id} className="rm-donation-item">
              {index === 0 && <span className="rm-ngo-badge">Recommended</span>}
              <div className="status-row">
                <strong>{donation.food_name}</strong>
                <span className="hint">{humanise(donation.category)}</span>
              </div>
              <span>
                {donation.quantity} {donation.unit}
              </span>
              <span className="disclaimer">Pickup by: {formatPickup(donation.pickup_by)}</span>
              <span>Storage: {humanise(donation.storage_conditions)}</span>
              <span>Allergens: {allergenText(donation.allergens)}</span>
              <div>
                <p className="rm-ngo-label">Why recommended</p>
                <ul>
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="btn rm-btn"
                onClick={() => onClaim(donation.id)}
                disabled={claimingId !== null}
                aria-label={`Claim donation: ${donation.food_name}`}
              >
                {isClaiming ? "Claiming..." : "Claim donation"}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
