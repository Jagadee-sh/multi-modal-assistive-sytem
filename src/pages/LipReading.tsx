import { Card, CardContent } from "@/components/ui/card";
import { Mic, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const LipReading = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lip Reading</h1>
        <p className="text-muted-foreground">AI-powered lip movement analysis for speech interpretation</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-lip-reading/10">
            <Mic className="h-10 w-10 text-lip-reading" />
          </div>
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold">Coming Soon</h2>
            <p className="max-w-md text-muted-foreground">
              This mode requires a cloud service to process webcam frames through AI vision models.
              Enable Cloud to unlock lip reading.
            </p>
          </div>
          <Button className="bg-lip-reading hover:bg-lip-reading/90" disabled>
            <Camera className="mr-2 h-4 w-4" /> Enable Webcam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LipReading;
