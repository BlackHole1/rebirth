import { sendLog } from './ajax';

// 生成范围内的随机数字
export const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// 把对象里的数组转成对象形式
export const arrayToObject = (obj: Record<string, any>) => {
  const replacer = (key: string, value: any) => {
    if (({}).toString.call(value) === '[object Array]') {
      return Object.assign({}, value);
    }
    return value;
  };

  const result = JSON.stringify(obj, replacer);
  try {
    return JSON.parse(result);
  } catch (e) {
    return result;
  }
};

// 检测文件是否下载完成
export const fileDownloadDone = (filenameRegex: string, dbId: number) => {
  sendLog('checkFileDownload', {
    dbId,
    filenameRegex
  });
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      sendLog('checkFileDownload.timeout', {
        dbId,
        filenameRegex
      }, 'warn');
      resolve();
    }, 1000 * 30);

    const searchFilename = (filenameRegex: string) => {
      chrome.downloads.search({
        filenameRegex: filenameRegex
      }, downloadItem => {
        if (downloadItem.length !== 0 && downloadItem[0].state === 'complete') {
          clearTimeout(timeoutId);
          setTimeout(() => {
            sendLog('checkFileDownload.done', {
              dbId,
              filenameRegex,
              downloadInfo: downloadItem[0]
            });
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

// 生成a-zA-Z0-9随机数
export const makeID = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// 封装post请求的fetch
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
