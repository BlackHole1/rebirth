// 录制配置
export const captureConfig = {
  video: true,
  audio: true,
  videoConstraints: {
    mandatory: {
      minWidth: 1920,
      minHeight: 1080,
      maxWidth: 1920,
      maxHeight: 1080,
      maxFrameRate: 30,
      minFrameRate: 30,
    }
  }
};

// mediaRecorder配置
export const mediaRecorderOptions = {
  videoBitsPerSecond: 2500000,
  mimeType: 'video/webm;codecs=vp9'
};

// Blob配置
export const blobOptions = {
  type: 'video/webm'
};
