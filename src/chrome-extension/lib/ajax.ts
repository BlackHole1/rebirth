// 向服务获取要录制的网站
import { IRecord } from '../typing/request';

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
export const completeRecordTask = (hash: string, fileName: string, subS3Key: string, width: number, height: number) => {
  fetch(`${SERVER_URL}/completeRecordTask?hash=${hash}&fileName=${fileName}&subS3Key=${subS3Key}&width=${width}&height=${height}`)
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
