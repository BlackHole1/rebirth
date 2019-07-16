interface Window {
  rebirth: {
    [key: string]: (...args: any[]) => void;
    stop: ({ originFileName, transformFileName }: { transformFileName?: string; originFileName?: string }) => void
    generateFile: (fileName: string, content: string) => void;
    setVideoBounds: ({ width, height }: { width: number, height: number }) => void;
  };
}

declare var SERVER_URL: string;
