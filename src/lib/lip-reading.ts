export const VISEMES = [
  'AA', 'E', 'I', 'O', 'U', 'FV', 'L', 'M', 'NQ', 'PBG', 'sil', 'XX'
] as const;

export type Viseme = typeof VISEMES[number];

export const visemeToPhoneme: Record<Viseme, string> = {
  'AA': 'a',
  'E': 'e',
  'I': 'i',
  'O': 'o',
  'U': 'u',
  'FV': 'f v',
  'L': 'l',
  'M': 'm',
  'NQ': 'n ŋ k g',
  'PBG': 'p b g',
  'sil': '',
  'XX': '?'
};

import { loadFaceLandmarker, detectFace, landmarksToViseme } from './mediapipe-face';

export const detectViseme = async (video: HTMLVideoElement): Promise<Viseme> => {
  const landmarker = await loadFaceLandmarker();
  const results = await detectFace(landmarker, video);
  return landmarksToViseme(results) as Viseme;
};

export const visemesToText = (visemes: Viseme[]): string => {
  return visemes.map(v => visemeToPhoneme[v]).join(' ').replace(/ +/g, ' ').trim();
};
