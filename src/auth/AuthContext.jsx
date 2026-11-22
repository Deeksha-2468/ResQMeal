
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase.js";

const AuthContext = createContext(null);

const notConfigured = () => ({
  error: new Error("Supabase is not configured."),
});

// Prevent duplicate recovery-code exchanges in React StrictMode.
let recoveryCodeHandled = false;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession ?? null);
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;

    const code = new URLSearchParams(window.location.search).get("code");

    if (!code || recoveryCodeHandled) return undefined;

    recoveryCodeHandled = true;

    // Remove only the recovery code and preserve other URL information.
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    window.history.replaceState(null, "", url.toString());

    const exchange = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      setRecovery(!error);
    };

    exchange();

    return undefined;
  }, []);

  const value = useMemo(() => {
    const signIn = async (email, password) => {
      if (!supabaseConfigured) return notConfigured();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error ?? null };
    };

    const signUp = async (email, password) => {
      if (!supabaseConfigured) return notConfigured();

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      return { error: error ?? null };
    };

    const signOut = async () => {
      if (!supabaseConfigured) return notConfigured();

      const { error } = await supabase.auth.signOut();
      return { error: error ?? null };
    };

    const updatePassword = async (newPassword) => {
      if (!supabaseConfigured) return notConfigured();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error: error ?? null };
    };

    const sendPasswordReset = async (email) => {
      if (!supabaseConfigured) return notConfigured();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      return { error: error ?? null };
    };

    const exitRecovery = async () => {
      setRecovery(false);

      if (supabaseConfigured) {
        await supabase.auth.signOut();
      }
    };

    return {
      session,
      user: session?.user ?? null,
      loading,
      configured: supabaseConfigured,
      signIn,
      signUp,
      signOut,
      recovery,
      updatePassword,
      sendPasswordReset,
      exitRecovery,
    };
  }, [session, loading, recovery]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
