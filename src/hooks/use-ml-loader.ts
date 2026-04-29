import { useState, useEffect } from 'react';
import { loadHandLandmarker } from '../lib/mediapipe-hand';
import { loadFaceLandmarker } from '../lib/mediapipe-face';

export const useMLLoader = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timeout for model loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Model loading timeout')), 30000);
        });

        await Promise.race([
          Promise.all([
            loadHandLandmarker(),
            loadFaceLandmarker()
          ]),
          timeoutPromise
        ]);
        
        setModelsLoaded(true);
        console.log('ML models loaded successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'ML models load failed';
        console.error('ML model loading error:', errorMessage);
        setError(errorMessage);
        
        // Retry logic for network issues
        if (retryCount < 3 && errorMessage.includes('network') || errorMessage.includes('timeout')) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => loadModels(), 2000 * (retryCount + 1));
        }
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, [retryCount]);

  return { modelsLoaded, loading, error, retryCount };
};

