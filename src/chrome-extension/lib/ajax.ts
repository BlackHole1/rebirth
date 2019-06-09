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
export const completeRecordTask = (hash: string, s3URL: string) => {
  fetch(`${SERVER_URL}/completeRecordTask?hash=${hash}&s3URL=${s3URL}`)
    .catch(e => {
      console.error(e);
    });
};
