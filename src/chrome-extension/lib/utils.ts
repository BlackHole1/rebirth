export const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

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
