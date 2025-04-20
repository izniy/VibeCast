import { MoodType } from '@/types/mood';
import { moodAffirmations } from '@/types/affirmations';

// Track last shown indices per mood in the current session
const sessionIndices: Record<MoodType, number> = {
  happy: -1,
  sad: -1,
  energetic: -1,
  relaxed: -1,
  focused: -1,
  romantic: -1,
  angry: -1,
};

/**
 * Get a rotated affirmation for the given mood, ensuring variety in the rotation
 * @param mood The current mood
 * @param timestamp Optional timestamp to influence rotation (defaults to current time)
 * @returns A different affirmation each time for the same mood
 */
export function getRotatedAffirmation(mood: MoodType, timestamp: number = Date.now()): string {
  const affirmations = moodAffirmations[mood];
  if (!affirmations || affirmations.length === 0) {
    return "You're doing great. Stay present.";
  }

  // Get the current day number (0-365)
  const dayOfYear = Math.floor(timestamp / (24 * 60 * 60 * 1000));
  
  // Increment the session index for this mood
  sessionIndices[mood] = (sessionIndices[mood] + 1) % affirmations.length;
  
  // Combine day and session index to get a varied but stable index for the day
  const combinedIndex = (dayOfYear + sessionIndices[mood]) % affirmations.length;
  
  return affirmations[combinedIndex];
}

/**
 * Get a stable index for the current day, useful for consistent daily rotations
 * @returns A number that changes daily but remains stable within the day
 */
export function getDailyAffirmationIndex(): number {
  const today = new Date();
  return today.getDate() + today.getMonth() * 31;
} 