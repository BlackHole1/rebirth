export const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// 检测文件是否下载完成
export const fileDownloadDone = (filenameRegex: string) => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve();
    }, 1000 * 30);

    const searchFilename = (filenameRegex: string) => {
      chrome.downloads.search({
        filenameRegex: filenameRegex
      }, downloadItem => {
        if (downloadItem.length !== 0 && downloadItem[0].state === 'complete') {
          clearTimeout(timeoutId);
          setTimeout(() => {
            resolve();
          }, 1000 * 3); // 这里加延迟，是因为我还是不太放心，加个延迟保证文件确实下载好了
        } else {
          searchFilename(filenameRegex);
        }
      });
    };
    searchFilename(filenameRegex);
  });
};

export const fetchPost = (url: string, data: Record<string, any>) => {
  return fetch(url, {
    body: JSON.stringify(data),
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json'
    },
    mode: 'cors',
    credentials: 'include'
  });
};
