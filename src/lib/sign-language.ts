export const SIGN_GESTURES = {
  'FIST': '✊',
  'OPEN': '✋',
  'OK': '👌',
  'THUMBS_UP': '👍',
  'PEACE': '✌️',
  'POINT': '👉',
  'HELLO': '👋',
  'THANK_YOU': '🙏',
  'PLEASE': '🙌',
  'YES': '👍',
  'NO': '👎',
  'A': '🤘',
  'B': '✋',
  'C': '�',
} as Record<string, string>;

export const GESTURE_MEANINGS = {
  'A': 'Letter A',
  'B': 'Letter B',
  'C': 'Letter C',
  'D': 'Letter D',
  'E': 'Letter E',
  'F': 'Letter F',
  'G': 'Letter G',
  'H': 'Letter H',
  'I': 'Letter I',
  'K': 'Letter K',
  'L': 'Letter L',
  'M': 'Letter M',
  'N': 'Letter N',
  'O': 'Letter O',
  'P': 'Letter P',
  'Q': 'Letter Q',
  'R': 'Letter R',
  'S': 'Letter S',
  'T': 'Letter T',
  'V': 'Letter V',
  'W': 'Letter W',
  'X': 'Letter X',
  'Y': 'Letter Y',
  'ONE': 'Number One',
  'TWO': 'Number Two',
  'THREE': 'Number Three',
  'FOUR': 'Number Four',
  'FIVE': 'Number Five',
  'THUMBS_UP': 'OK',
  'THUMBS_DOWN': 'No',
  'HELLO': 'Hello',
  'STOP': 'Stop',
  'POINT': 'Look here',
  'THANK_YOU': 'Thank you',
} as Record<string, string>;

export const GESTURE_VOICES = {
  'A': 'A',
  'B': 'B',
  'C': 'C',
  'D': 'D',
  'E': 'E',
  'F': 'F',
  'G': 'G',
  'H': 'H',
  'I': 'I',
  'K': 'K',
  'L': 'L',
  'M': 'M',
  'N': 'N',
  'O': 'O',
  'P': 'P',
  'Q': 'Q',
  'R': 'R',
  'S': 'S',
  'T': 'T',
  'V': 'V',
  'W': 'W',
  'X': 'X',
  'Y': 'Y',
  'ONE': 'One',
  'TWO': 'Two',
  'THREE': 'Three',
  'FOUR': 'Four',
  'FIVE': 'Five',
  'THUMBS_UP': 'OK',
  'THUMBS_DOWN': 'No',
  'HELLO': 'Hello',
  'STOP': 'Stop',
  'POINT': 'Look here',
  'THANK_YOU': 'Thank you very much',
} as Record<string, string>;

export type DetectedGesture = {
  gesture: string;
  confidence: number;
  meaning: string;
  voiceText: string;
};

import { loadHandLandmarker, detectHands, landmarksToGesture, detectTwoHandGesture } from './mediapipe-hand';

export const detectGesture = async (video: HTMLVideoElement): Promise<DetectedGesture> => {
  const landmarker = await loadHandLandmarker();
  const results = await detectHands(landmarker, video);
  
  let gesture = 'UNKNOWN';
  
  if (results && results.length >= 2) {
    // Check for two-hand gestures first
    gesture = detectTwoHandGesture(results);
    if (gesture === 'UNKNOWN') {
      // Fall back to single-hand gesture
      gesture = landmarksToGesture(results);
    }
  } else if (results && results.length > 0) {
    gesture = landmarksToGesture(results);
  }
  
  const meaning = GESTURE_MEANINGS[gesture] || gesture;
  const voiceText = GESTURE_VOICES[gesture] || gesture;
  
  return {
    gesture,
    meaning,
    voiceText,
    confidence: gesture === 'UNKNOWN' ? 0.3 : 0.9
  };
};
