import { useState, useEffect } from 'react';
import { loadHandLandmarker } from '../lib/mediapipe-hand';
import { loadFaceLandmarker } from '../lib/mediapipe-face';

export const useMLLoader = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadHandLandmarker(),
          loadFaceLandmarker()
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ML models load failed');
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  return { modelsLoaded, loading, error };
};

