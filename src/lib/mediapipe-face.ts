import { FaceLandmarker, FilesetResolver, FaceLandmarkerOptions } from '@mediapipe/tasks-vision';
// Removed unused React hooks


let faceLandmarker: FaceLandmarker | null = null;

export const loadFaceLandmarker = async () => {
  if (!faceLandmarker) {
    try {
      // Try multiple CDN sources for better reliability
      const wasmSources = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        'https://unpkg.com/@mediapipe/tasks-vision@latest/wasm',
        'https://cdn.skypack.dev/@mediapipe/tasks-vision@latest/wasm'
      ];
      
      const modelSources = [
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        'https://cdn.jsdelivr.net/npm/@mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      ];
      
      let vision = null;
      let lastError = null;
      
      // Try different WASM sources
      for (const wasmSource of wasmSources) {
        try {
          console.log(`Trying WASM source: ${wasmSource}`);
          vision = await FilesetResolver.forVisionTasks(wasmSource);
          break;
        } catch (error) {
          console.warn(`WASM source failed: ${wasmSource}`, error);
          lastError = error;
        }
      }
      
      if (!vision) {
        throw lastError || new Error('Failed to load MediaPipe WASM from any source');
      }
      
      // Try different model sources
      let modelLoaded = false;
      for (const modelSource of modelSources) {
        try {
          console.log(`Trying model source: ${modelSource}`);
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelSource,
              delegate: 'GPU' // Try GPU acceleration first
            },
            runningMode: 'VIDEO',
            numFaces: 1
          } as FaceLandmarkerOptions);
          modelLoaded = true;
          break;
        } catch (error) {
          console.warn(`Model source failed: ${modelSource}`, error);
          lastError = error;
          
          // Fallback to CPU if GPU fails
          try {
            faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelSource,
                delegate: 'CPU'
              },
              runningMode: 'VIDEO',
              numFaces: 1
            } as FaceLandmarkerOptions);
            modelLoaded = true;
            break;
          } catch (cpuError) {
            console.warn(`CPU fallback also failed: ${modelSource}`, cpuError);
          }
        }
      }
      
      if (!modelLoaded) {
        throw lastError || new Error('Failed to load face landmark model from any source');
      }
      
      console.log('Face landmark model loaded successfully');
    } catch (error) {
      console.error('Failed to load face landmark model:', error);
      throw error;
    }
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

