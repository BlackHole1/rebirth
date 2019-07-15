interface Window {
  rebirth: {
    [key: string]: (...args: any[]) => void;
    stop: (sourceFileName: string, partFileName: string) => void
    generateFile: (fileName: string, content: string) => void;
  };
}

declare var SERVER_URL: string;
