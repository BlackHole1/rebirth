interface Window {
  rebirth: {
    [key: string]: () => void;
  };
}

declare var AWS: any;

declare var SERVER_URL: string;
declare var UPLOAD_FAIL_RETRY_NUMBER: string;

declare var AWS_ACCESS_KEY_ID: string;
declare var AWS_SECRET_ACCESS_KEY: string;
declare var AWS_REGION: string;
declare var AWS_BUCKET: string;
