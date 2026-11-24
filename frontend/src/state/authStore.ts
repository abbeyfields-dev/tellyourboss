import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../api/types';

const SESSION_KEY = '@bossorater/session-v1';

export type Session = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.user?.id || !parsed.user.email || !parsed.accessToken || !parsed.refreshToken) {
      return null;
    }
    return parsed as Session;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Keep the in-memory session even if local storage is unavailable.
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // Sign-out should still proceed if local storage is unavailable.
  }
}

/** Restore the cached session. Token validity is checked on the next real API call. */
export async function restoreSession(): Promise<Session | null> {
  return loadSession();
}
