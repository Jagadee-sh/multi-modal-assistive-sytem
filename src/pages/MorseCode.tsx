import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Trash2, Copy } from "lucide-react";
import { MORSE_CODE_MAP, DOT_THRESHOLD, CHAR_GAP, WORD_GAP, playBeep, decodeMorse } from "@/lib/morse";
import { useToast } from "@/hooks/use-toast";

const MorseCode = () => {
  const [currentMorse, setCurrentMorse] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [morseDisplay, setMorseDisplay] = useState<string[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const pressStart = useRef(0);
  const charTimeout = useRef<ReturnType<typeof setTimeout>>();
  const wordTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { toast } = useToast();

  const addSymbol = useCallback((symbol: "." | "-") => {
    setCurrentMorse((prev) => prev + symbol);
    setMorseDisplay((prev) => [...prev, symbol]);
  }, []);

  const finalizeChar = useCallback(() => {
    setCurrentMorse((prev) => {
      if (!prev) return prev;
      const char = MORSE_CODE_MAP[prev] || "?";
      setDecodedText((t) => t + char);
      setMorseDisplay((d) => [...d, " "]);
      return "";
    });
  }, []);

  const finalizeWord = useCallback(() => {
    setDecodedText((t) => (t.endsWith(" ") ? t : t + " "));
    setMorseDisplay((d) => [...d, "   "]);
  }, []);

  const handlePressStart = useCallback(() => {
    clearTimeout(charTimeout.current);
    clearTimeout(wordTimeout.current);
    pressStart.current = Date.now();
    setIsPressed(true);
  }, []);

  const handlePressEnd = useCallback(() => {
    if (!pressStart.current) return;
    const duration = Date.now() - pressStart.current;
    const symbol = duration < DOT_THRESHOLD ? "." : "-";
    addSymbol(symbol);
    playBeep(symbol === "." ? 80 : 250);
    setIsPressed(false);

    charTimeout.current = setTimeout(finalizeChar, CHAR_GAP);
    wordTimeout.current = setTimeout(finalizeWord, WORD_GAP);
  }, [addSymbol, finalizeChar, finalizeWord]);

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        handlePressStart();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handlePressEnd();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handlePressStart, handlePressEnd]);

  const speak = () => {
    if (!decodedText.trim()) return;
    const utter = new SpeechSynthesisUtterance(decodedText);
    speechSynthesis.speak(utter);
  };

  const clear = () => {
    setCurrentMorse("");
    setDecodedText("");
    setMorseDisplay([]);
  };

  const copy = () => {
    navigator.clipboard.writeText(decodedText);
    toast({ title: "Copied to clipboard" });
  };

  const referenceEntries = Object.entries(MORSE_CODE_MAP).slice(0, 36);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Morse Code Input</h1>
        <p className="text-muted-foreground">Tap the button or press spacebar — short press = dot, long press = dash</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tap button */}
          <Card>
            <CardContent className="flex flex-col items-center gap-6 p-8">
              <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={() => isPressed && handlePressEnd()}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                className={`h-40 w-40 rounded-full border-4 transition-all select-none text-2xl font-bold ${
                  isPressed
                    ? "scale-95 border-morse-code bg-morse-code text-morse-code-foreground shadow-lg"
                    : "border-morse-code/40 bg-card text-morse-code hover:border-morse-code/70"
                }`}
              >
                {isPressed ? "—" : "TAP"}
              </button>
              <p className="text-sm text-muted-foreground text-center">
                Short tap = <span className="font-mono font-bold">•</span> (dot) &nbsp;|&nbsp; Long tap = <span className="font-mono font-bold">—</span> (dash)
              </p>
            </CardContent>
          </Card>

          {/* Morse display */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Morse Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[60px] rounded-lg bg-secondary p-4 font-mono text-2xl tracking-widest">
                {morseDisplay.map((s, i) => (
                  <span key={i} className={s === "." ? "text-morse-code animate-pulse-dot inline-block" : ""}>
                    {s === "." ? "•" : s === "-" ? "—" : s === "   " ? "\u00A0\u00A0" : "\u00A0"}
                  </span>
                ))}
                {currentMorse && <span className="text-morse-code opacity-50">|</span>}
              </div>
            </CardContent>
          </Card>

          {/* Decoded text */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Decoded Text</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={speak} title="Read aloud">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={copy} title="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={clear} title="Clear">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[80px] rounded-lg bg-secondary p-4 text-xl font-medium">
                {decodedText || <span className="text-muted-foreground">Start tapping to see decoded text...</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reference chart */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reference Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {referenceEntries.map(([morse, char]) => (
                <div key={morse} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-secondary">
                  <span className="w-6 font-bold">{char}</span>
                  <span className="font-mono text-muted-foreground tracking-wider">
                    {morse.replace(/\./g, "•").replace(/-/g, "—")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MorseCode;
