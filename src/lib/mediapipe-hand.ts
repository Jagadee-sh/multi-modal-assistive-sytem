import { HandLandmarker, FilesetResolver, HandLandmarkerOptions } from '@mediapipe/tasks-vision';
// Removed unused React hooks

let handLandmarker: HandLandmarker | null = null;

export const loadHandLandmarker = async () => {
  if (!handLandmarker) {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
      },
      runningMode: 'VIDEO',
      numHands: 2
    } as HandLandmarkerOptions);
  }
  return handLandmarker;
};

export const detectHands = async (handLandmarker: HandLandmarker, video: HTMLVideoElement): Promise<any[] | null> => {
  if (!handLandmarker) return null;
  const results = await handLandmarker.detectForVideo(video, performance.now());
  return results.landmarks || null;
};

export const landmarksToGesture = (landmarksList: any[] | null): string => {
  if (!landmarksList || landmarksList.length === 0) return '';

  const handLandmarks = landmarksList[0];
  if (!handLandmarks || handLandmarks.length === 0) return '';

  const thumbTip = handLandmarks[4];
  const indexTip = handLandmarks[8];
  const middleTip = handLandmarks[12];
  const ringTip = handLandmarks[16];
  const pinkyTip = handLandmarks[20];
  const wrist = handLandmarks[0];
  const indexMcp = handLandmarks[5];
  const middleMcp = handLandmarks[9];
  const ringMcp = handLandmarks[13];
  const pinkyMcp = handLandmarks[17];
  const thumbMcp = handLandmarks[2];
  const indexPip = handLandmarks[6];
  const middlePip = handLandmarks[10];
  const ringPip = handLandmarks[14];
  const pinkyPip = handLandmarks[18];

  // Helper function to check if finger is extended
  const isFingerExtended = (tip: any, mcp: any, pip: any) => {
    return tip.y < mcp.y - 0.08 && tip.y < pip.y - 0.04;
  };

  const isFingerCurled = (tip: any, mcp: any, pip: any) => {
    return tip.y > mcp.y + 0.04 && tip.y > pip.y + 0.02;
  };

  // ASL Letters and Numbers with high accuracy
  
  // A - Closed fist with thumb on side
  const thumbOnSide = Math.abs(thumbTip.x - indexMcp.x) < 0.08;
  const aGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbOnSide;
  if (aGesture) return 'A';

  // B - All fingers up, thumb tucked
  const thumbTucked = thumbTip.y > thumbMcp.y + 0.04;
  const bGesture = thumbTucked &&
                   isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerExtended(ringTip, ringMcp, ringPip) &&
                   isFingerExtended(pinkyTip, pinkyMcp, pinkyPip);
  if (bGesture) return 'B';

  // C - Curved hand like holding cup
  const cGesture = thumbTip.y < thumbMcp.y - 0.02 &&
                   indexTip.y > indexMcp.y + 0.02 &&
                   middleTip.y > middleMcp.y + 0.02 &&
                   ringTip.y > ringMcp.y + 0.02 &&
                   pinkyTip.y > pinkyMcp.y + 0.02 &&
                   Math.abs(indexTip.x - pinkyTip.x) > 0.15;
  if (cGesture) return 'C';

  // D - Index finger up, others curved, thumb extended
  const dGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (dGesture) return 'D';

  // E - Closed fist with thumb tucked
  const eGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y > thumbMcp.y + 0.04;
  if (eGesture) return 'E';

  // F - Thumb and index touch, others up
  const thumbIndexTouch = Math.abs(thumbTip.x - indexTip.x) < 0.06 &&
                         Math.abs(thumbTip.y - indexTip.y) < 0.06;
  const fGesture = thumbIndexTouch &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerExtended(ringTip, ringMcp, ringPip) &&
                   isFingerExtended(pinkyTip, pinkyMcp, pinkyPip);
  if (fGesture) return 'F';

  // G - Index finger pointing sideways
  const gGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   Math.abs(indexTip.y - indexMcp.y) < 0.1;
  if (gGesture) return 'G';

  // H - Index and middle pointing sideways
  const hGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   Math.abs(indexTip.y - indexMcp.y) < 0.1 &&
                   Math.abs(middleTip.y - middleMcp.y) < 0.1;
  if (hGesture) return 'H';

  // I - Pinky finger up only
  const iGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerExtended(pinkyTip, pinkyMcp, pinkyPip);
  if (iGesture) return 'I';

  // K - Index and middle up, thumb between
  const kGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < middleMcp.y - 0.02 &&
                   thumbTip.x > indexMcp.x - 0.05 && thumbTip.x < middleMcp.x + 0.05;
  if (kGesture) return 'K';

  // L - Thumb and index making L shape
  const lGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (lGesture) return 'L';

  // M - Three fingers down over thumb
  const mGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (mGesture) return 'M';

  // N - Two fingers down over thumb
  const nGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (nGesture) return 'N';

  // O - All fingertips touching thumb
  const allFingersNearThumb = Math.abs(thumbTip.x - indexTip.x) < 0.08 &&
                             Math.abs(thumbTip.x - middleTip.x) < 0.08 &&
                             Math.abs(thumbTip.x - ringTip.x) < 0.08 &&
                             Math.abs(thumbTip.x - pinkyTip.x) < 0.08;
  const oGesture = allFingersNearThumb;
  if (oGesture) return 'O';

  // P - Downward K shape
  const pGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < middleMcp.y - 0.02 &&
                   indexTip.y > indexMcp.y + 0.02;
  if (pGesture) return 'P';

  // Q - Downward G shape with thumb down
  const qGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y > thumbMcp.y + 0.04;
  if (qGesture) return 'Q';

  // R - Upward hook shape
  const rGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04 &&
                   indexTip.y < indexMcp.y - 0.08;
  if (rGesture) return 'R';

  // S - Thumb over fingers (fist with thumb on top)
  const sGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < indexTip.y - 0.02;
  if (sGesture) return 'S';

  // T - Thumb between index and middle
  const tGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04 &&
                   thumbTip.x > indexMcp.x - 0.05 && thumbTip.x < middleMcp.x + 0.05;
  if (tGesture) return 'T';

  // V - Peace sign
  const vGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip);
  if (vGesture) return 'V';

  // W - Three fingers up
  const wGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerExtended(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip);
  if (wGesture) return 'W';

  // X - Bent index finger
  const xGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (xGesture) return 'X';

  // Y - Thumb and pinky up
  const yGesture = isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerExtended(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (yGesture) return 'Y';

  // Numbers
  // Number 1 - Index finger up
  const oneGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                    isFingerCurled(middleTip, middleMcp, middlePip) &&
                    isFingerCurled(ringTip, ringMcp, ringPip) &&
                    isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                    thumbTip.y > thumbMcp.y + 0.04;
  if (oneGesture) return 'ONE';

  // Number 2 - Index and middle up
  const twoGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y > thumbMcp.y + 0.04;
  if (twoGesture) return 'TWO';

  // Number 3 - Three fingers up
  const threeGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                     isFingerExtended(middleTip, middleMcp, middlePip) &&
                     isFingerExtended(ringTip, ringMcp, ringPip) &&
                     isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                     thumbTip.y > thumbMcp.y + 0.04;
  if (threeGesture) return 'THREE';

  // Number 4 - Four fingers up
  const fourGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                    isFingerExtended(middleTip, middleMcp, middlePip) &&
                    isFingerExtended(ringTip, ringMcp, ringPip) &&
                    isFingerExtended(pinkyTip, pinkyMcp, pinkyPip) &&
                    thumbTip.y > thumbMcp.y + 0.04;
  if (fourGesture) return 'FOUR';

  // Number 5 - All fingers up
  const fiveGesture = isFingerExtended(indexTip, indexMcp, indexPip) &&
                    isFingerExtended(middleTip, middleMcp, middlePip) &&
                    isFingerExtended(ringTip, ringMcp, ringPip) &&
                    isFingerExtended(pinkyTip, pinkyMcp, pinkyPip) &&
                    thumbTip.y < thumbMcp.y - 0.04;
  if (fiveGesture) return 'FIVE';

  // Common gestures
  // Thumbs up
  const thumbsUp = thumbTip.y < wrist.y - 0.15 && 
                   isFingerCurled(indexTip, indexMcp, indexPip) &&
                   isFingerCurled(middleTip, middleMcp, middlePip) &&
                   isFingerCurled(ringTip, ringMcp, ringPip) &&
                   isFingerCurled(pinkyTip, pinkyMcp, pinkyPip);
  if (thumbsUp) return 'THUMBS_UP';

  // Thumbs down
  const thumbsDown = thumbTip.y > wrist.y + 0.15 && 
                     isFingerCurled(indexTip, indexMcp, indexPip) &&
                     isFingerCurled(middleTip, middleMcp, middlePip) &&
                     isFingerCurled(ringTip, ringMcp, ringPip) &&
                     isFingerCurled(pinkyTip, pinkyMcp, pinkyPip);
  if (thumbsDown) return 'THUMBS_DOWN';

  // Open palm (Hello/Goodbye)
  const openPalm = isFingerExtended(indexTip, indexMcp, indexPip) &&
                   isFingerExtended(middleTip, middleMcp, middlePip) &&
                   isFingerExtended(ringTip, ringMcp, ringPip) &&
                   isFingerExtended(pinkyTip, pinkyMcp, pinkyPip) &&
                   thumbTip.y < thumbMcp.y - 0.04;
  if (openPalm) return 'HELLO';

  // Fist (Stop)
  const fist = isFingerCurled(indexTip, indexMcp, indexPip) &&
               isFingerCurled(middleTip, middleMcp, middlePip) &&
               isFingerCurled(ringTip, ringMcp, ringPip) &&
               isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
               thumbTip.y > thumbMcp.y + 0.04;
  if (fist) return 'STOP';

  // Point
  const point = isFingerExtended(indexTip, indexMcp, indexPip) &&
                isFingerCurled(middleTip, middleMcp, middlePip) &&
                isFingerCurled(ringTip, ringMcp, ringPip) &&
                isFingerCurled(pinkyTip, pinkyMcp, pinkyPip) &&
                thumbTip.y > thumbMcp.y + 0.04;
  if (point) return 'POINT';

  return 'UNKNOWN';
};

export const detectTwoHandGesture = (landmarksList: any[] | null): string => {
  if (!landmarksList || landmarksList.length < 2) return '';

  const leftHand = landmarksList[0];
  const rightHand = landmarksList[1];
  
  if (!leftHand || !rightHand || leftHand.length === 0 || rightHand.length === 0) return '';

  // Check if both hands are near mouth area (for "thank you" gesture)
  const leftWrist = leftHand[0];
  const rightWrist = rightHand[0];
  const mouthAreaY = 0.4; // Approximate mouth area in normalized coordinates
  
  const bothHandsNearMouth = Math.abs(leftWrist.y - mouthAreaY) < 0.15 && 
                             Math.abs(rightWrist.y - mouthAreaY) < 0.15 &&
                             Math.abs(leftWrist.x - rightWrist.x) > 0.2; // Hands apart
  
  if (bothHandsNearMouth) return 'THANK_YOU';

  return 'UNKNOWN';
};

