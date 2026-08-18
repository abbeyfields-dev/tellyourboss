import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tellyourboss/rating-state-v1';

export type RatingState = {
  completed: number;
  lastOverall: number | null;
  lastArchetype: string | null;
};

const DEFAULT_STATE: RatingState = {
  completed: 0,
  lastOverall: null,
  lastArchetype: null,
};

export async function loadRatingState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<RatingState>;
    return {
      completed: typeof parsed.completed === 'number' ? parsed.completed : 0,
      lastOverall: typeof parsed.lastOverall === 'number' ? parsed.lastOverall : null,
      lastArchetype: typeof parsed.lastArchetype === 'string' ? parsed.lastArchetype : null,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function saveRatingState(state: RatingState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordCompletedRating(
  state: RatingState,
  overall: number,
  archetype: string,
): RatingState {
  return {
    completed: state.completed + 1,
    lastOverall: overall,
    lastArchetype: archetype,
  };
}
