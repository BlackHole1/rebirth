// 向服务获取要录制的网站
import { IRecord } from '../typing/request';
import { fetchPost } from './utils';

export const getRecordTasks = (num: number): Promise<IRecord> => {
  return new Promise((resolve, reject) => {
    fetch(`${SERVER_URL}/getRecord?num=${num}`)
      .then(async resp => {
        const data: IRecord = await resp.json();
        return resp.ok ? resolve(data) : reject(data);
      })
      .catch(e => reject(e));
  });
};

// 完成录制
export const completeRecordTask = (params: {
  hash: string;
  sourceFileName: string;
  partFileName: string;
  subS3Key: string;
  videoWidth: number;
  videoHeight: number;
  fileList: Record<string, string>
}) => {
  fetchPost(`${SERVER_URL}/completeRecordTask`, params)
    .catch(e => {
      console.error(e);
    });
};

// 录制失败
export const recordFail = (hash: string) => {
  fetch(`${SERVER_URL}/recordFail?hash=${hash}`)
    .catch(e => {
      console.error(e);
    });
};
