import { Card, CardContent } from "@/components/ui/card";
import { Hand, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const SignLanguage = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sign Language Recognition</h1>
        <p className="text-muted-foreground">AI-powered hand gesture recognition from your webcam</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sign-language/10">
            <Hand className="h-10 w-10 text-sign-language" />
          </div>
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold">Coming Soon</h2>
            <p className="max-w-md text-muted-foreground">
              This mode requires a cloud service to process webcam frames through AI vision models.
              Enable Cloud to unlock sign language recognition.
            </p>
          </div>
          <Button className="bg-sign-language hover:bg-sign-language/90" disabled>
            <Camera className="mr-2 h-4 w-4" /> Enable Webcam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignLanguage;
