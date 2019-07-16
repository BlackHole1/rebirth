import tabs from './tabs';
import recordingQueue from './recordingQueue';
import { captureConfig, mediaRecorderOptions, blobOptions } from './config';
import { completeRecordTask, recordFail } from './ajax';
import { fileDownloadDone } from './utils';

// 开始录屏
const start = (id: number, pageWidth: number, pageHeight: number): void => {
  tabs.setAction(id, 'start');

  // 切换标签到触发start动作的标签页，因为tabCapture.capture是在当前Tab触发
  chrome.tabs.update(id, {
    active: true
  });

  // 开始进行录屏，加上ts-ignore，是因为@types/chrome package还没更新，导致其类型是错误的
  // @ts-ignore
  chrome.tabCapture.capture(captureConfig(pageWidth, pageHeight), stream => {
    recordingQueue.complete();
    if (stream === null) {
      chrome.tabs.sendMessage(id, {
        error: chrome.runtime.lastError
      });
      return false;
    }

    const recordedBlobs: BlobPart[] = [];
    const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

    mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const hash = tabs.getHash(id);
      const sourceFileName = tabs.getSourceFileName(id);
      const partFileName = tabs.getPartFileName(id);
      const superBuffer = new Blob(recordedBlobs, blobOptions);

      // 不用chrome.downloads.download来下载，是因为这个API存在BUG，对Blob支持不太好
      // 详情见：https://bugs.chromium.org/p/chromium/issues/detail?id=892133#makechanges
      const link = document.createElement('a');
      link.href = URL.createObjectURL(superBuffer);
      link.setAttribute('download', `${sourceFileName}.webm`);
      link.click();

      fileDownloadDone(sourceFileName)
        .then(() => {
          const videoWidth = tabs.getVideoWidth(id);
          const videoHeight = tabs.getVideoHeight(id);
          completeRecordTask({
            hash,
            sourceFileName,
            partFileName,
            subS3Key: tabs.getSubS3Key(id),
            fileList: tabs.getFileList(id),
            videoWidth: videoWidth === 0 ? pageWidth : videoWidth,
            videoHeight: videoHeight === 0 ? pageHeight: videoHeight
          });
        })
        .catch(() => {});

      setTimeout(() => {
        chrome.tabs.remove(id);
      }, 2000);
    };

    tabs.setMediaRecorder(id, mediaRecorder);
    mediaRecorder.start();
  });
};

// 暂停录屏
const pause = (id: number, mediaRecorder: MediaRecorder): void => {
  tabs.setAction(id, 'pause');
  mediaRecorder.pause();
};

// 恢复录屏
const resume = (id: number, mediaRecorder: MediaRecorder): void => {
  tabs.setAction(id, 'resume');
  mediaRecorder.resume();
};

// 停止录屏，停止后的下载操作在start方法里
const stop = (id: number, mediaRecorder: MediaRecorder, sourceFileName: string, partFileName: string): void => {
  tabs.setAction(id, 'stop');
  tabs.setSourceFileName(id, sourceFileName);
  tabs.setPartFileName(id, partFileName);
  mediaRecorder.stop();

  // mediaRecorder.stop()只是停止录制，但是其stream还没有被关闭，所以需要获取其录制的所有stream，并逐个关闭
  mediaRecorder.stream.getTracks().forEach(track => {
    track.stop();
  });
};

// 录制失败
const fail = (id: number): void => {
  recordFail(tabs.getHash(id));
  setTimeout(() => {
    chrome.tabs.remove(id);
  }, 2000);

  // 失败者不配拥有姓名
  tabs.deleteTab(id);
};

const actions: { [keys: string]: Function } = {
  start,
  pause,
  resume,
  stop,
  fail
};

export default actions;
