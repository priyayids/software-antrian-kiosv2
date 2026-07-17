interface ResponsiveVoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onend?: () => void;
  onerror?: () => void;
}

interface ResponsiveVoice {
  speak(text: string, voice: string, options?: ResponsiveVoiceOptions): void;
  cancel(): void;
}

declare var responsiveVoice: ResponsiveVoice;
