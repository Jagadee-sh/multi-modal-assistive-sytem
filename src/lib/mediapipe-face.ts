import { FaceLandmarker, FilesetResolver, FaceLandmarkerOptions } from '@mediapipe/tasks-vision';
// Removed unused React hooks


let faceLandmarker: FaceLandmarker | null = null;

export const loadFaceLandmarker = async () => {
  if (!faceLandmarker) {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
      },
      runningMode: 'VIDEO',
      numFaces: 1
    } as FaceLandmarkerOptions);
  }
  return faceLandmarker;
};

export const detectFace = async (faceLandmarker: FaceLandmarker, video: HTMLVideoElement): Promise<any[] | null> => {
  if (!faceLandmarker) return null;
  const results = await faceLandmarker.detectForVideo(video, performance.now());
  return results.faceLandmarks || null;
};

export const landmarksToViseme = (landmarksList: any[] | null): string => {
  if (!landmarksList || landmarksList.length === 0) return 'sil';

  const faceLandmarks = landmarksList[0]; // Direct array of face landmarks
  if (!faceLandmarks || faceLandmarks.length === 0) return 'sil';

  // Mouth region indices from MediaPipe FaceMesh (lips)
  const upperLipTop = faceLandmarks[13]; // Upper lip inner top
  const lowerLipBottom = faceLandmarks[14]; // Lower lip inner bottom
  const leftLipCorner = faceLandmarks[61]; // Left lip corner
  const rightLipCorner = faceLandmarks[291]; // Right lip corner
  
  const mouthOpenness = lowerLipBottom.y - upperLipTop.y;
  const mouthWidth = Math.abs(rightLipCorner.x - leftLipCorner.x);

  if (mouthOpenness > 0.06) return 'AA';
  if (mouthOpenness > 0.04) return 'O';
  if (mouthOpenness > 0.02) return 'E';
  if (mouthWidth > 0.08) return 'FV';
  return 'M'; // Closed
};

