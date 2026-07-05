import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { api } from "./api";
import { supabase } from "./supabase";

type AuthState = {
  session: Session | null;
  loading: boolean;
  boxesReady: boolean;
  boxCount: number;
  setupError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshBoxes: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [boxesReady, setBoxesReady] = useState(false);
  const [boxCount, setBoxCount] = useState(0);
  const [setupError, setSetupError] = useState<string | null>(null);

  async function refreshBoxes() {
    setSetupError(null);
    try {
      const r = await api.ensureBoxes();
      setBoxCount(r.count);
      setBoxesReady(true);
    } catch (e) {
      setSetupError(e instanceof Error ? e.message : "Could not set up boxes");
      setBoxesReady(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 6000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setSession(data.session);
      })
      .catch((e) => {
        console.warn("[Anghkooey] getSession failed:", e);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setBoxesReady(false);
      setBoxCount(0);
      setSetupError(null);
      return;
    }
    refreshBoxes();
  }, [session?.access_token]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      boxesReady,
      boxCount,
      setupError,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshBoxes,
    }),
    [session, loading, boxesReady, boxCount, setupError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}
