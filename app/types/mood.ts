export type MoodType = 'happy' | 'sad' | 'energetic' | 'relaxed' | 'focused' | 'romantic' | 'angry';

export const moodEmojis: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  energetic: '⚡️',
  relaxed: '😌',
  focused: '🎯',
  romantic: '❤️',
  angry: '😠'
};

export const moodDescriptions: Record<MoodType, string> = {
  happy: 'Feeling joyful and content',
  sad: 'Feeling down or melancholic',
  energetic: 'Full of energy and excitement',
  relaxed: 'Calm and at peace',
  focused: 'Concentrated and determined',
  romantic: 'In a loving or sentimental mood',
  angry: 'Feeling frustrated or upset'
}; 