// 向服务获取要录制的网站
import { IRecord } from '../typing/request';
import { arrayToObject, fetchPost } from './utils';

// 发送日志到server，由server转发到kibana
export const sendLog = (name: string, payload: Record<string, any>, level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {
  fetchPost(`${SERVER_URL}/logHandle`, {
    name: `browser.${name}`,
    payload,
    level
  })
    .catch(e => {
      console.error(e);
    });
};

// 获取录制任务
export const getRecordTasks = (num: number): Promise<IRecord> => {
  return new Promise((resolve, reject) => {
    fetch(`${SERVER_URL}/getRecord?num=${num}`)
      .then(async resp => {
        const data: IRecord = await resp.json();
        sendLog('ajax.getRecordTasks', {
          tasksNum: num,
          tasksList: arrayToObject(data),
          respStatus: resp.ok
        });
        return resp.ok ? resolve(data) : reject(data);
      })
      .catch(e => reject(e));
  });
};

// 完成录制
export const completeRecordTask = (params: {
  dbId: number;
  sourceFileName: string;
  partFileName: string;
  subS3Key: string;
  videoWidth: number;
  videoHeight: number;
  fileList: Record<string, string>
}) => {
  fetchPost(`${SERVER_URL}/completeRecordTask`, params)
    .then(() => {
      sendLog('ajax.completeRecordTask', {
        dbId: params.dbId,
        completeRecordTask: params
      });
    })
    .catch(e => {
      sendLog('ajax.completeRecordTask.fail', {
        dbId: params.dbId,
        completeRecordTask: params,
        completeRecordTaskError: e.message
      }, 'error');
      console.error(e);
    });
};

// 录制失败
export const recordFail = (id: number) => {
  fetch(`${SERVER_URL}/recordFail?id=${id}`)
    .then(() => {
      sendLog('ajax.recordFail', {
        dbId: id
      });
    })
    .catch(e => {
      sendLog('ajax.recordFail.fail', {
        dbId: id,
        recordFail: e.message
      }, 'error');
      console.error(e);
    });
};
