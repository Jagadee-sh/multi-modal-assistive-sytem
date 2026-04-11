import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Hand, Camera, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';
import { useWebcam } from '@/hooks/useWebcam';
import { useMLLoader } from '@/hooks/use-ml-loader';
import { detectGesture, GESTURE_MEANINGS, GESTURE_VOICES, type DetectedGesture } from '@/lib/sign-language';
import { useToast } from '@/hooks/use-toast';

const SignLanguage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGesture, setCurrentGesture] = useState<DetectedGesture | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastSpokenGesture, setLastSpokenGesture] = useState<string>('');
  const { videoRef, stream, startWebcam, stopWebcam, error: cameraError } = useWebcam();
  const { toast } = useToast();
  const { modelsLoaded, loading: mlLoading, error: mlError } = useMLLoader();

  const trackActivity = (mode: string, text: string) => {
    try {
      const activity = {
        id: Date.now().toString(),
        mode,
        text: text.slice(0, 100),
        time: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      const existingActivity = JSON.parse(localStorage.getItem('mmacs-activity') || '[]');
      const updatedActivity = [activity, ...existingActivity.slice(0, 49)];
      localStorage.setItem('mmacs-activity', JSON.stringify(updatedActivity));
      
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
    if (!videoRef.current || !canvasRef.current || !stream || !isDetecting) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    
    // Draw video frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -1280, 0, 1280, 720);
    ctx.restore();

    try {
      const detection = await detectGesture(video);
      
      if (detection.confidence > 0.8 && detection.gesture !== 'UNKNOWN') {
        setCurrentGesture(detection);
        
        // Only speak if this gesture hasn't been spoken recently
        if (detection.gesture !== lastSpokenGesture) {
          // Stop any ongoing speech to prevent overlapping
          speechSynthesis.cancel();
          
          // Speak the result
          const utterance = new SpeechSynthesisUtterance(detection.voiceText);
          speechSynthesis.speak(utterance);
          
          // Track activity
          trackActivity('Sign Language', detection.meaning);
          
          // Update last spoken gesture immediately
          setLastSpokenGesture(detection.gesture);
          
          // Reset after 3 seconds to allow speaking the same gesture again
          setTimeout(() => {
            setLastSpokenGesture('');
          }, 3000);
        }
      } else {
        setCurrentGesture(null);
      }
    } catch (e) {
      console.log('Detection error:', e);
    }

    // Continue detection loop with throttling
    setTimeout(() => {
      requestAnimationFrame(detectLoop);
    }, 300);
  }, [videoRef, stream, isDetecting, lastSpokenGesture]);

  const startDetection = () => {
    setIsDetecting(true);
    setLastSpokenGesture('');
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setCurrentGesture(null);
    setLastSpokenGesture('');
  };

  // Start/stop detection loop
  useEffect(() => {
    if (isDetecting) {
      detectLoop();
    }
  }, [detectLoop, isDetecting]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sign Language Recognition</h1>
        <p className="text-muted-foreground">Show your hand gestures - AI will automatically recognize and speak the meaning</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Detection Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {isDetecting ? 'Automatic Detection Active' : 'Gesture Detection'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-6">
            <div className="relative w-full max-w-2xl aspect-video">
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
                width={1280}
                height={720}
              />
              
              {/* Current Gesture Indicator */}
              {currentGesture && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">{currentGesture.meaning}</span>
                </div>
              )}
              
              {/* Detection Status */}
              {isDetecting && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm">Detecting</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <Button onClick={startWebcam} disabled={!!stream} className="bg-green-600 hover:bg-green-700">
                <Camera className="mr-2 h-4 w-4" />
                {stream ? 'Camera Active' : 'Start Camera'}
              </Button>
              
              <Button 
                onClick={isDetecting ? stopDetection : startDetection} 
                disabled={!stream || mlLoading || !modelsLoaded}
                className={isDetecting ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isDetecting ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Detection
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Detection
                  </>
                )}
              </Button>
              
              <Button onClick={stopWebcam} variant="destructive" disabled={!stream}>
                Stop Camera
              </Button>
            </div>

            {/* Status Messages */}
            <div className="text-center space-y-2">
              {cameraError && <p className="text-destructive text-sm">{cameraError}</p>}
              {mlLoading && <p className="text-blue-600 text-sm">Loading ML models...</p>}
              {mlError && <p className="text-destructive text-sm">ML Error: {mlError}</p>}
              {!modelsLoaded && <p className="text-muted-foreground text-sm">Models loading for accurate detection...</p>}
              {isDetecting && (
                <p className="text-green-600 text-sm">
                  {currentGesture ? `Detected: ${currentGesture.meaning}` : 'Show a gesture to detect...'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gesture Guide */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>ASL Gestures (30+ Signs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">A</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter A</div>
                    <div className="text-sm text-muted-foreground">Closed fist, thumb on side</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">B</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter B</div>
                    <div className="text-sm text-muted-foreground">All fingers up, thumb tucked</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">C</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter C</div>
                    <div className="text-sm text-muted-foreground">Curved hand like cup</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">D</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter D</div>
                    <div className="text-sm text-muted-foreground">Index up, thumb extended</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">E</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter E</div>
                    <div className="text-sm text-muted-foreground">Closed fist, thumb tucked</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">F</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter F</div>
                    <div className="text-sm text-muted-foreground">Thumb and index touch</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">G</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter G</div>
                    <div className="text-sm text-muted-foreground">Index pointing sideways</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">H</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter H</div>
                    <div className="text-sm text-muted-foreground">Index and middle sideways</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">I</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter I</div>
                    <div className="text-sm text-muted-foreground">Pinky finger up only</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">K</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter K</div>
                    <div className="text-sm text-muted-foreground">Index and middle up, thumb between</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">L</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter L</div>
                    <div className="text-sm text-muted-foreground">Thumb and index L shape</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">M</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter M</div>
                    <div className="text-sm text-muted-foreground">Three fingers over thumb</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">N</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter N</div>
                    <div className="text-sm text-muted-foreground">Two fingers over thumb</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">O</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter O</div>
                    <div className="text-sm text-muted-foreground">All fingertips touching thumb</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">P</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter P</div>
                    <div className="text-sm text-muted-foreground">Downward K shape</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">Q</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter Q</div>
                    <div className="text-sm text-muted-foreground">Downward G with thumb down</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">R</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter R</div>
                    <div className="text-sm text-muted-foreground">Upward hook shape</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">S</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter S</div>
                    <div className="text-sm text-muted-foreground">Thumb over fingers</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">T</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter T</div>
                    <div className="text-sm text-muted-foreground">Thumb between index and middle</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">V</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter V</div>
                    <div className="text-sm text-muted-foreground">Peace sign</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">W</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter W</div>
                    <div className="text-sm text-muted-foreground">Three fingers up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">X</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter X</div>
                    <div className="text-sm text-muted-foreground">Bent index finger</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">Y</span>
                  <div className="flex-1">
                    <div className="font-medium">Letter Y</div>
                    <div className="text-sm text-muted-foreground">Thumb and pinky up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">1</span>
                  <div className="flex-1">
                    <div className="font-medium">Number One</div>
                    <div className="text-sm text-muted-foreground">Index finger up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">2</span>
                  <div className="flex-1">
                    <div className="font-medium">Number Two</div>
                    <div className="text-sm text-muted-foreground">Index and middle up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">3</span>
                  <div className="flex-1">
                    <div className="font-medium">Number Three</div>
                    <div className="text-sm text-muted-foreground">Three fingers up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">4</span>
                  <div className="flex-1">
                    <div className="font-medium">Number Four</div>
                    <div className="text-sm text-muted-foreground">Four fingers up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">5</span>
                  <div className="flex-1">
                    <div className="font-medium">Number Five</div>
                    <div className="text-sm text-muted-foreground">All fingers up</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">{'\ud83d\udc4d'}</span>
                  <div className="flex-1">
                    <div className="font-medium">Thumbs Up</div>
                    <div className="text-sm text-muted-foreground">Says: OK</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">{'\ud83d\udc4e'}</span>
                  <div className="flex-1">
                    <div className="font-medium">Thumbs Down</div>
                    <div className="text-sm text-muted-foreground">Says: No</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">{'\ud83d\udd90\ufe0f'}</span>
                  <div className="flex-1">
                    <div className="font-medium">Hello</div>
                    <div className="text-sm text-muted-foreground">Open palm wave</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">{'\u270a'}</span>
                  <div className="flex-1">
                    <div className="font-medium">Stop</div>
                    <div className="text-sm text-muted-foreground">Closed fist</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">{'\ud83d\udc49'}</span>
                  <div className="flex-1">
                    <div className="font-medium">Point</div>
                    <div className="text-sm text-muted-foreground">Index finger pointing</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded bg-secondary">
                  <span className="text-2xl">{'\ud83d\ude4f'}</span>
                  <div className="flex-1">
                    <div className="font-medium">Thank You</div>
                    <div className="text-sm text-muted-foreground">Both hands near mouth</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold mb-2">1</div>
              <div className="font-medium">Start Camera</div>
              <div className="text-sm text-muted-foreground">Enable webcam access</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold mb-2">2</div>
              <div className="font-medium">Start Detection</div>
              <div className="text-sm text-muted-foreground">Automatic gesture recognition</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold mb-2">3</div>
              <div className="font-medium">Show Gestures</div>
              <div className="text-sm text-muted-foreground">AI speaks each gesture once</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Smart Detection:</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Each gesture is spoken only once. Change to a different gesture, then back to speak it again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignLanguage;
