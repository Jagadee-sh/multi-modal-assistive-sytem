export const MORSE_CODE_MAP: Record<string, string> = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
  "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
  "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
  ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
  "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y",
  "--..": "Z",
  "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4",
  ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9",
  ".-.-.-": ".", "--..--": ",", "..--..": "?", ".----.": "'",
  "-.-.--": "!", "-..-.": "/", "-.--.": "(", "-.--.-": ")",
  ".-...": "&", "---...": ":", "-.-.-.": ";", "-...-": "=",
  ".-.-.": "+", "-....-": "-", "..--.-": "_", ".-..-.": '"',
  "...-..-": "$", ".--.-.": "@",
};

export const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([k, v]) => [v, k])
);

export function decodeMorse(morseString: string): string {
  return morseString
    .trim()
    .split("   ") // word gap
    .map((word) =>
      word
        .split(" ")
        .map((char) => MORSE_CODE_MAP[char] || "")
        .join("")
    )
    .join(" ");
}

// Timing thresholds (ms)
export const DOT_THRESHOLD = 200; // press shorter = dot, longer = dash
export const CHAR_GAP = 500;     // gap between chars
export const WORD_GAP = 1200;    // gap between words

export function playBeep(duration: number, frequency = 600) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  gain.gain.value = 0.3;
  osc.start();
  osc.stop(ctx.currentTime + duration / 1000);
}
