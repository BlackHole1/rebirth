// 录制配置
export const captureConfig = (width: number, height: number) => ({
  video: true,
  audio: true,
  videoConstraints: {
    mandatory: {
      minWidth: width,
      minHeight: height,
      maxWidth: width,
      maxHeight: height,
      maxFrameRate: 30,
      minFrameRate: 30,
    }
  }
});

// mediaRecorder配置
export const mediaRecorderOptions = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: 'video/webm;codecs=vp9'
};

// Blob配置（虽然可以使用video/mp4，但是视频的质量极差）
export const blobOptions = {
  type: 'video/webm'
};
