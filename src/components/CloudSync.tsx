import { useEffect } from "react";
import { getState, replaceState, sanitizeState, subscribeAppState, type AppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/** Keeps this device's offline-first state backed up to the signed-in user's Supabase row. */
export function CloudSync() {
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let userId: string | null = null;
    let ready = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const save = async (state: AppState, owner: string) => {
      const { error } = await client.from("user_app_state").upsert(
        { user_id: owner, data: state, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
      if (error) console.error("Could not sync attendance data:", error.message);
    };

    const hydrate = async (owner: string) => {
      ready = false;
      const { data, error } = await client
        .from("user_app_state")
        .select("data")
        .eq("user_id", owner)
        .maybeSingle();
      if (disposed || userId !== owner) return;
      if (error) {
        console.error("Could not load attendance data:", error.message);
        return;
      }
      if (data?.data) {
        const remote = sanitizeState(data.data);
        if (remote && JSON.stringify(remote) !== JSON.stringify(getState())) replaceState(remote);
      } else {
        // First sign-in: seed the account with the data already on this device.
        await save(getState(), owner);
      }
      if (!disposed && userId === owner) ready = true;
    };

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user.id ?? null;
      if (nextId === userId) return;
      userId = nextId;
      ready = false;
      if (timer) clearTimeout(timer);
      if (nextId) void hydrate(nextId);
    });

    const unsubscribe = subscribeAppState(() => {
      if (!ready || !userId) return;
      if (timer) clearTimeout(timer);
      const owner = userId;
      timer = setTimeout(() => {
        if (ready && userId === owner) void save(getState(), owner);
      }, 500);
    });

    const channel = client
      .channel("user-app-state-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_app_state" },
        (payload) => {
          if (!ready || !userId || payload.new["user_id"] !== userId) return;
          const remote = sanitizeState(payload.new["data"]);
          if (remote && JSON.stringify(remote) !== JSON.stringify(getState())) replaceState(remote);
        },
      )
      .subscribe();

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      unsubscribe();
      authListener.subscription.unsubscribe();
      void client.removeChannel(channel);
    };
  }, []);

  return null;
}
