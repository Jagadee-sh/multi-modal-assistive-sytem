import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Copy, Trash2, Mic } from 'lucide-react';
import { useWebcam } from '@/hooks/useWebcam';
import { useMLLoader } from '@/hooks/use-ml-loader';
import { detectViseme, visemesToText, type Viseme } from '@/lib/lip-reading';
import { useToast } from '@/hooks/use-toast';

const LipReading = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectedVisemes, setDetectedVisemes] = useState<Viseme[]>([]);
  const [detectedText, setDetectedText] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const { videoRef, startWebcam, stopWebcam, isLoading, error, stream } = useWebcam();
  const { toast } = useToast();
  const { modelsLoaded, loading: mlLoading, error: mlError } = useMLLoader();

  const trackActivity = (mode: string, text: string) => {
    try {
      const activity = {
        id: Date.now().toString(),
        mode,
        text: text.slice(0, 100), // Limit text length
        time: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      // Get existing activity
      const existingActivity = JSON.parse(localStorage.getItem('mmacs-activity') || '[]');
      const updatedActivity = [activity, ...existingActivity.slice(0, 49)]; // Keep last 50 activities
      localStorage.setItem('mmacs-activity', JSON.stringify(updatedActivity));
      
      // Update stats
      const stats = JSON.parse(localStorage.getItem('mmacs-stats') || '{}');
      const modeKey = mode.toLowerCase().replace(' ', '') + 'Count';
      stats[modeKey] = (stats[modeKey] || 0) + 1;
      stats.totalTranslations = (stats.totalTranslations || 0) + 1;
      localStorage.setItem('mmacs-stats', JSON.stringify(stats));
    } catch (error) {
      console.log('Error tracking activity:', error);
    }
  };

  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    try {
      const viseme = await detectViseme(videoRef.current);
      setDetectedVisemes((prev) => {
        const newVisemes = [viseme, ...prev.slice(0, 19)];
        const text = visemesToText(newVisemes);
        setDetectedText(prev => {
          const newText = text;
          // Limit text length to prevent memory issues
          return newText.length > 500 ? newText.slice(-500) : newText;
        });
        return newVisemes;
      });
    } catch (e) {
      console.log('Lip detection error:', e);
    }

    // Add throttling to reduce CPU usage
    setTimeout(() => {
      requestAnimationFrame(detectLoop);
    }, 150);
  }, [isDetecting, videoRef]);

  const speak = () => {
    if (detectedText.trim()) {
      const utterance = new SpeechSynthesisUtterance(detectedText);
      speechSynthesis.speak(utterance);
      // Track activity for dashboard
      trackActivity('Lip Reading', detectedText);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(detectedText);
    toast({ title: 'Copied to clipboard' });
  };

  const clearText = () => {
    setDetectedText('');
    setDetectedVisemes([]);
  };

  useEffect(() => {
    let rafId: number;
    if (isDetecting) {
      rafId = requestAnimationFrame(detectLoop);
    }
    return () => cancelAnimationFrame(rafId);
  }, [detectLoop, isDetecting]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lip Reading</h1>
        <p className="text-muted-foreground">Speak clearly - AI analyzes lip movements for text conversion</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Webcam */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Lip Detection</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="relative w-full max-w-md aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full rounded-lg object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full rounded-lg"
                width={640}
                height={480}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={startWebcam} disabled={!!stream} className="bg-purple-600 hover:bg-purple-700">
                <Mic className="mr-2 h-4 w-4" /> {stream ? 'Camera Active' : 'Start Webcam'}
              </Button>
              <Button onClick={() => setIsDetecting(!isDetecting)} disabled={!stream || mlLoading || !modelsLoaded}>
                {isDetecting ? 'Pause Detection' : 'Start Detection'}
              </Button>
              <Button onClick={stopWebcam} variant="destructive" disabled={!stream}>
                Stop Camera
              </Button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            {mlLoading && <p className="text-blue-600 text-sm">Loading ML models...</p>}
            {mlError && <p className="text-destructive text-sm">ML Error: {mlError}</p>}
            {!modelsLoaded && <p className="text-muted-foreground text-sm">Models loading for accurate detection...</p>}
          </CardContent>
        </Card>

        {/* Recent Visemes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Visemes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs font-mono">
              {detectedVisemes.slice(0, 10).map((v, i) => (
                <span key={i} className="px-1 py-0.5 bg-secondary rounded text-muted-foreground">
                  {v}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output */}
      <Card className="mt-8">
        <CardHeader className="flex items-center justify-between pb-3">
          <CardTitle>Recognized Speech</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={speak}>
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={copyText}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearText}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="min-h-[100px] p-6 rounded-lg border-2 border-dashed border-muted bg-secondary text-xl font-medium">
            {detectedText || <span className="text-muted-foreground italic">Speak and watch text appear...</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LipReading;
