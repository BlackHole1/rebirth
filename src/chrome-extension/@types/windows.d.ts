interface Window {
  rebirth: {
    [key: string]: (...args: any[]) => void;
    stop: (fileName: string) => void
    generateFile: (fileName: string, content: string) => void;
  };
}

declare var SERVER_URL: string;
