import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const SettingsPage = () => {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your MMACS experience</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Output Preferences</CardTitle>
            <CardDescription>Configure how results are presented</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="tts">Text-to-Speech</Label>
              <Switch id="tts" checked={ttsEnabled} onCheckedChange={setTtsEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="audio">Audio Feedback (Morse)</Label>
              <Switch id="audio" checked={audioFeedback} onCheckedChange={setAudioFeedback} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lang">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accessibility</CardTitle>
            <CardDescription>Adjust display for better readability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="contrast">High Contrast Mode</Label>
              <Switch id="contrast" checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fontsize">Font Size</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
