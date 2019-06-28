export const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// 检测文件是否下载完成
export const fileDownloadDone = (filenameRegex: string) => new Promise((resolve => {
  const searchFilename = (filenameRegex: string) => {
    chrome.downloads.search({
      filenameRegex: filenameRegex
    }, downloadItem => {
      if (downloadItem.length !== 0 && downloadItem[0].state === 'complete') {
        setTimeout(resolve, 1000); // 这里加延迟，是因为我还是不太放心，加个延迟保证文件确实下载好了
      } else {
        searchFilename(filenameRegex);
      }
    });
  };
  searchFilename(filenameRegex);
}));

// 调整网页窗口大小
export const adjustmentPageSize = (tabId: number, width: number, height: number) => {
  chrome.debugger.attach({ tabId }, '1.3', () => {
    if (chrome.runtime.lastError) {
      return;
    }

    chrome.debugger.sendCommand({ tabId }, 'Emulation.setDeviceMetricsOverride', {
      mobile: true,
      width,
      height,
      deviceScaleFactor: 0.0,
    });
  });
};
