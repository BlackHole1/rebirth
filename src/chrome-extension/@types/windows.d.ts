interface Window {
  rebirth: {
    [key: string]: (fileName?: string) => void;
  };
}

declare var SERVER_URL: string;
