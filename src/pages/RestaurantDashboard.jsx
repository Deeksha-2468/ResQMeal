import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AuthPanel from "../components/AuthPanel.jsx";
import DonationForm from "../components/DonationForm.jsx";
import DonationList from "../components/DonationList.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function RestaurantDashboard() {
  const { user, loading, configured, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError("");
    const { error } = await signOut();
    setSigningOut(false);
    if (error) setSignOutError(error.message || "Sign out failed. Please try again.");
  };

  return (
    <>
      <PageHeader title="Restaurant dashboard" accent="accent-restaurant" />

      {!configured ? (
        <section className="page-section">
          <p className="note" role="alert">
            Supabase is not configured in this environment. Set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY, then restart the dev server, to post and view donations.
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
          <section className="page-section rm-stack">
            <div className="status-row">
              <span>
                Signed in as <strong>{user.email}</strong>
              </span>
              <button
                type="button"
                className="btn btn-secondary rm-btn"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
            {signOutError && (
              <p className="rm-field-error" role="alert">
                {signOutError}
              </p>
            )}
          </section>

          <section className="page-section">
            <h2>Post donation</h2>
            <DonationForm onSaved={() => setRefreshKey((k) => k + 1)} />
          </section>

          <section className="page-section">
            <h2>Active donations</h2>
            <DonationList refreshKey={refreshKey} />
          </section>

          <section className="page-section">
            <h2>Donation history</h2>
            <p className="hint">
              All of your donations are listed under Active donations above. Completed and expired
              donations will be separated here in a later milestone.
            </p>
          </section>
        </>
      )}
    </>
  );
}
