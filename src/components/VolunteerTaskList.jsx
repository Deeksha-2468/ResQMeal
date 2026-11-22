import EmptyState from "./EmptyState.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { formatPickup } from "../lib/claims.js";

const humanise = (value) => String(value ?? "").replace(/_/g, " ");

const valueOrDash = (value) => (value ? String(value) : "Not provided");

function allergenText(allergens) {
  if (Array.isArray(allergens)) return allergens.length ? allergens.join(", ") : "None listed";
  return allergens ? String(allergens) : "None listed";
}

// The next action depends on the list the task came from and its current status.
function nextAction(task, mode) {
  if (mode === "open") return { type: "accept", label: "Accept task" };
  if (task.status === "claimed") return { type: "collected", label: "Mark collected" };
  if (task.status === "collected") return { type: "delivered", label: "Mark delivered" };
  return null;
}

function PartyDetails({ heading, name, address, contactName, contactPhone }) {
  return (
    <div className="rm-party">
      <p className="rm-ngo-label">{heading}</p>
      <span>{valueOrDash(name)}</span>
      <span>Address: {valueOrDash(address)}</span>
      <span>Contact: {valueOrDash(contactName)}</span>
      <span>Phone: {valueOrDash(contactPhone)}</span>
    </div>
  );
}

export default function VolunteerTaskList({
  items,
  mode,
  onAction,
  busyId,
  error,
  emptyText,
  emptyMessage,
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyText} message={emptyMessage} />;
  }

  return (
    <>
      {error && (
        <p className="rm-field-error" role="alert">
          {error}
        </p>
      )}
      <ul className="rm-card-list rm-volunteer-tasks">
        {items.map((task) => {
          const action = nextAction(task, mode);
          const isBusy = busyId === task.id;
          return (
            <li key={task.id} className="rm-donation-item">
              <div className="status-row">
                <strong>{task.food_name}</strong>
                <StatusBadge status={task.status} />
              </div>
              <span className="hint">{humanise(task.category)}</span>
              <span>
                {task.quantity} {task.unit}
              </span>
              <span className="disclaimer">Pickup by: {formatPickup(task.pickup_by)}</span>
              <span>Storage: {humanise(task.storage_conditions)}</span>

              {mode === "mine" && (
                <>
                  <span>Allergens: {allergenText(task.allergens)}</span>
                  <span>Handling: {valueOrDash(task.handling_instructions)}</span>
                  <PartyDetails
                    heading="Collect from"
                    name={task.donor_name}
                    address={task.donor_address}
                    contactName={task.donor_contact_name}
                    contactPhone={task.donor_contact_phone}
                  />
                  <PartyDetails
                    heading="Deliver to"
                    name={task.receiver_name}
                    address={task.receiver_address}
                    contactName={task.receiver_contact_name}
                    contactPhone={task.receiver_contact_phone}
                  />
                </>
              )}

              {action && (
                <button
                  type="button"
                  className="btn rm-btn"
                  onClick={() => onAction(action.type, task.id)}
                  disabled={busyId !== null}
                  aria-label={`${action.label}: ${task.food_name}`}
                >
                  {isBusy ? "Saving..." : action.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
