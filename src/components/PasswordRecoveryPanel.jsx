import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const MIN_PASSWORD_LENGTH = 6;

export default function PasswordRecoveryPanel() {
  const { updatePassword, exitRecovery } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (confirmPassword !== newPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(newPassword);
    if (!mountedRef.current) return;
    setSubmitting(false);

    if (error) {
      setFormError(error.message || "Could not update password. Please try again.");
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setDone(true);
  };

  if (done) {
    return (
      <section className="rm-auth-panel" aria-labelledby="recovery-title">
        <h2 id="recovery-title">Password updated</h2>
        <p className="rm-field-wide rm-form-success" role="status">
          Your password has been updated. Sign in with your new password.
        </p>
        <div className="rm-field-wide">
          <button type="button" className="btn rm-btn" onClick={exitRecovery}>
            Back to sign in
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rm-auth-panel" aria-labelledby="recovery-title">
      <h2 id="recovery-title">Set a new password</h2>

      <form className="rm-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field rm-field-wide">
          <label htmlFor="recovery-password">New password</label>
          <input
            id="recovery-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-field rm-field-wide">
          <label htmlFor="recovery-confirm">Confirm new password</label>
          <input
            id="recovery-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        {formError && (
          <p className="rm-field-wide rm-field-error" role="alert">
            {formError}
          </p>
        )}

        <div className="rm-field-wide">
          <button type="submit" className="btn rm-btn" disabled={submitting}>
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </div>
      </form>

      <p className="hint">
        <button type="button" className="rm-link-button" onClick={exitRecovery} disabled={submitting}>
          Back to sign in
        </button>
      </p>
    </section>
  );
}
