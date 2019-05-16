import tabs from './tabs';
import recordingQueue from './recordingQueue';
import { captureConfig, mediaRecorderOptions, blobOptions } from './config';
import { completeRecordTask } from './ajax';
import uploadWebmToS3 from './uploadWebmToS3';

// 开始录屏
const start = (id: number, filename: string): void => {
  tabs.setAction(id, 'start');

  // 切换标签到触发start动作的标签页，因为tabCapture.capture是在当前Tab触发
  chrome.tabs.update(id, {
    active: true
  });

  // 开始进行录屏，加上ts-ignore，是因为@types/chrome package还没更新，导致其类型是错误的
  // @ts-ignore
  chrome.tabCapture.capture(captureConfig, stream => {
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
      const superBuffer = new Blob(recordedBlobs, blobOptions);
      uploadWebmToS3(superBuffer, filename, tabs.getHash(id));

      const link = document.createElement('a');
      link.href = URL.createObjectURL(superBuffer);
      link.setAttribute('download', `${filename}.webm`);
      link.click();

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
const stop = (id: number, mediaRecorder: MediaRecorder): void => {
  tabs.setAction(id, 'stop');
  completeRecordTask(tabs.getHash(id));
  mediaRecorder.stop();

  // mediaRecorder.stop()只是停止录制，但是其stream还没有被关闭，所以需要获取其录制的所有stream，并逐个关闭
  mediaRecorder.stream.getTracks().forEach(track => {
    track.stop();
  });
};

const actions: { [keys: string]: Function } = {
  start,
  pause,
  resume,
  stop
};

export default actions;
