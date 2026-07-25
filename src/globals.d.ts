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

interface USBEndpoint {
  endpointNumber: number;
  direction: 'in' | 'out';
  type: string;
  packetSize: number;
}

interface USBAlternateInterface {
  endpoints: USBEndpoint[];
}

interface USBInterface {
  alternate: USBAlternateInterface;
}

interface USBConfiguration {
  interfaces: USBInterface[];
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: string;
}

interface USBDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  opened: boolean;
  configuration?: USBConfiguration;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configNum: number): Promise<void>;
  claimInterface(ifaceNum: number): Promise<void>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
}

interface Navigator {
  usb: {
    requestDevice(options: { filters: Array<Record<string, unknown>> }): Promise<USBDevice>;
    getDevices(): Promise<USBDevice[]>;
  };
}
