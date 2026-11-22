import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AuthPanel from "../components/AuthPanel.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import NgoDonationList from "../components/NgoDonationList.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  listAvailableDonations,
  listMyClaims,
  claimDonation,
  formatPickup,
} from "../lib/claims.js";
import { rankDonations } from "../lib/matching.js";

const CLAIM_RACE_MESSAGE =
  "That donation was just claimed by someone else or expired. The list has been refreshed.";

export default function NgoDashboard() {
  const { user, loading, configured } = useAuth();
  const userId = user?.id;
  const [available, setAvailable] = useState([]);
  const [claims, setClaims] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [claimError, setClaimError] = useState("");

  const loadLists = useCallback(async () => {
    if (!userId) return;
    setListsLoading(true);
    setLoadError("");
    try {
      const [open, mine] = await Promise.all([listAvailableDonations(), listMyClaims(userId)]);
      setAvailable(rankDonations(open));
      setClaims(mine);
    } catch (err) {
      setLoadError(err.message || "Donations could not be loaded.");
    } finally {
      setListsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleClaim = async (donationId) => {
    setClaimingId(donationId);
    setClaimError("");
    try {
      await claimDonation(donationId);
    } catch (err) {
      const message = String(err?.message ?? "");
      setClaimError(
        message.includes("no longer available")
          ? CLAIM_RACE_MESSAGE
          : message || "Claim failed. Please try again.",
      );
    } finally {
      setClaimingId(null);
    }
    await loadLists();
  };

  return (
    <>
      <PageHeader title="NGO / Community Kitchen dashboard" accent="accent-ngo" />

      {!configured ? (
        <section className="page-section">
          <p className="note" role="alert">
            Supabase is not configured in this environment. Set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY, then restart the dev server, to find and claim donations.
          </p>
        </section>
      ) : loading ? (
        <section className="page-section">
          <p className="hint" role="status">Checking your session...</p>
        </section>
      ) : !user ? (
        <section className="page-section">
          <AuthPanel />
        </section>
      ) : (
        <>
          <section className="page-section">
            <h2>Available donations</h2>
            {loadError && (
              <p className="rm-field-error" role="alert">
                {loadError}
              </p>
            )}
            {listsLoading ? (
              <p className="hint" role="status">Loading available donations...</p>
            ) : (
              <NgoDonationList
                items={available}
                onClaim={handleClaim}
                claimingId={claimingId}
                error={claimError}
                emptyText="No available donations right now"
              />
            )}
          </section>

          <section className="page-section">
            <h2>My claims</h2>
            {listsLoading ? (
              <p className="hint" role="status">Loading your claims...</p>
            ) : claims.length === 0 ? (
              <EmptyState title="No claims yet" message="Donations you claim will be listed here." />
            ) : (
              <ul className="rm-card-list">
                {claims.map((claim) => (
                  <li key={claim.id} className="rm-donation-item">
                    <div className="status-row">
                      <strong>{claim.food_name}</strong>
                      <StatusBadge status={claim.status} />
                    </div>
                    <span className="disclaimer">Pickup by: {formatPickup(claim.pickup_by)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
