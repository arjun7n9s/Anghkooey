import { useEffect, useState } from "react";
import { Platform } from "react-native";

export function useConnectivity(): boolean {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    async function pingSupabase() {
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return;

      if (Platform.OS === "web" && typeof navigator !== "undefined" && !navigator.onLine) {
        setOffline(true);
        return;
      }

      try {
        // Reaching the server AT ALL means we're online — even a 401/404 counts.
        await fetch(`${url}/auth/v1/health`, {
          method: "GET",
          headers: { apikey: key },
        });
        setOffline(false);
      } catch {
        setOffline(Platform.OS === "web" ? !navigator.onLine : true);
      }
    }

    pingSupabase();
    const interval = setInterval(pingSupabase, 45000);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onOnline = () => {
        setOffline(false);
        pingSupabase();
      };
      const onOffline = () => setOffline(true);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      return () => {
        clearInterval(interval);
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }

    return () => clearInterval(interval);
  }, []);

  return offline;
}
