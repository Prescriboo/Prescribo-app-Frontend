// Type declarations for the Electron preload API
// See electron/preload.js for the actual implementation

interface ElectronWindowAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

interface ElectronUpdaterAPI {
  check: () => Promise<{ success: boolean; updateInfo: any; error?: string }>;
  install: () => Promise<void>;
  onChecking: (callback: (data: any) => void) => () => void;
  onAvailable: (callback: (data: { version: string; releaseDate: string }) => void) => () => void;
  onNotAvailable: (callback: (data: { version: string }) => void) => () => void;
  onProgress: (callback: (data: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => () => void;
  onDownloaded: (callback: (data: { version: string; releaseDate: string }) => void) => () => void;
  onError: (callback: (data: { message: string }) => void) => () => void;
}

interface ElectronAPI {
  getVersion: () => Promise<string>;
  quit: () => Promise<void>;
  getPlatform: () => Promise<string>;
  window: ElectronWindowAPI;
  api: {
    getUrl: () => Promise<string>;
    isReady: () => Promise<boolean>;
  };
  updater: ElectronUpdaterAPI;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
