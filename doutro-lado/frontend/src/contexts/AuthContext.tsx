"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthProfile } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

type AuthState = {
  /** Raw Supabase session — contains access_token, refresh_token, etc. */
  session: Session | null;
  /** Raw Supabase user — from auth.users. */
  user: User | null;
  /** Our application profile from profiles table (role, preferences, etc.). */
  profile: AuthProfile | null;
  /** True while the initial session check is in flight. */
  isLoading: boolean;
  signOut: () => Promise<void>;
};

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

// =============================================================================
// Provider
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  async function fetchProfile(accessToken: string): Promise<AuthProfile | null> {
    try {
      const res = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const body = await res.json();
      return body.ok ? (body.data as AuthProfile) : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        setProfile(await fetchProfile(session.access_token));
      }
      setIsLoading(false);
    });

    // Subscribe to auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        setProfile(await fetchProfile(session.access_token));
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
