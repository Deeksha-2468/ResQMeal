import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function AuthPanel() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isSignUp = mode === "signup";

  const validate = () => {
    const next = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    return next;
  };

  const switchMode = () => {
    setMode(isSignUp ? "signin" : "signup");
    setErrors({});
    setFormError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const action = isSignUp ? signUp : signIn;
    const { error } = await action(email.trim(), password);
    if (!mountedRef.current) return;
    setSubmitting(false);

    if (error) {
      setFormError(error.message || "Something went wrong. Please try again.");
      return;
    }
    if (isSignUp) {
      setNotice(
        "Account created. If email confirmation is enabled, confirm your email and then sign in."
      );
      setMode("signin");
      setPassword("");
    }
  };

  return (
    <section className="rm-auth-panel" aria-labelledby="auth-panel-title">
      <h2 id="auth-panel-title">{isSignUp ? "Create restaurant account" : "Restaurant sign in"}</h2>
      <p className="disclaimer">
        This account is for demo use only. Use synthetic data only. Do not enter real personal or
        business information.
      </p>

      <form className="rm-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field rm-field-wide">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "auth-email-error" : undefined}
            disabled={submitting}
          />
          {errors.email && (
            <span id="auth-email-error" className="rm-field-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-field rm-field-wide">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "auth-password-error" : undefined}
            disabled={submitting}
          />
          {errors.password && (
            <span id="auth-password-error" className="rm-field-error">
              {errors.password}
            </span>
          )}
        </div>

        {formError && (
          <p className="rm-field-wide rm-field-error" role="alert">
            {formError}
          </p>
        )}
        {notice && (
          <p className="rm-field-wide rm-form-success" role="status">
            {notice}
          </p>
        )}

        <div className="rm-field-wide">
          <button type="submit" className="btn rm-btn" disabled={submitting}>
            {submitting
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </div>
      </form>

      <p className="hint">
        {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
        <button type="button" className="rm-link-button" onClick={switchMode} disabled={submitting}>
          {isSignUp ? "Sign in instead" : "Create an account"}
        </button>
      </p>
    </section>
  );
}
