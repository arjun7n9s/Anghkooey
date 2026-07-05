import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { api } from "./api";
import { supabase } from "./supabase";

type AuthState = {
  session: Session | null;
  loading: boolean;
  displayName: string;
  email: string;
  boxesReady: boolean;
  boxCount: number;
  setupError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
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

  const email = session?.user?.email ?? "";
  const metaName =
    (session?.user?.user_metadata?.display_name as string | undefined) ??
    (session?.user?.user_metadata?.name as string | undefined) ??
    "";
  const displayName = metaName || (email ? email.split("@")[0] : "");

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      displayName,
      email,
      boxesReady,
      boxCount,
      setupError,
      signIn: async (mail, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
        if (error) throw error;
      },
      signUp: async (mail, password, name) => {
        const { error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: name ? { data: { display_name: name.trim() } } : undefined,
        });
        if (error) throw error;
        if (name?.trim()) {
          const { data: userData } = await supabase.auth.getUser();
          const uid = userData.user?.id;
          if (uid) {
            await supabase
              .from("profiles")
              .upsert({ id: uid, display_name: name.trim() })
              .then(() => undefined, () => undefined);
          }
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshBoxes,
    }),
    [session, loading, displayName, email, boxesReady, boxCount, setupError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}
