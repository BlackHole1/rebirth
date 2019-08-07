// 向服务获取要录制的网站
import { IRecord } from '../typing/request';
import { fetchPost } from './utils';

// 发送日志到server，由server转发到kibana
export const sendLog = (name: string, payload?: Record<string, any>, level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {
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
export const getRecordTasks = (): Promise<IRecord> => {
  return new Promise((resolve, reject) => {
    fetch(`${SERVER_URL}/getRecord`)
      .then(async resp => {
        const data: IRecord = await resp.json();
        sendLog('ajax.getRecordTasks', {
          getRecordTasks: data,
          respStatus: resp.ok
        });
        return resp.ok ? resolve(data) : reject(data);
      })
      .catch(e => reject(e));
  });
};

// 完成录制
export const completeRecordTask = (params: {
  sourceFileName: string;
  partFileName: string;
  videoWidth: number;
  videoHeight: number;
  fileList: Record<string, string>
}) => {
  fetchPost(`${SERVER_URL}/completeRecordTask`, params)
    .then(() => {
      sendLog('ajax.completeRecordTask', {
        completeRecordTask: params
      });
    })
    .catch(e => {
      sendLog('ajax.completeRecordTask.fail', {
        completeRecordTask: params,
        completeRecordTaskError: e.message
      }, 'error');
      console.error(e);
    });
};

// 录制失败
export const recordFail = () => {
  fetch(`${SERVER_URL}/recordFail`)
    .then(() => {
      sendLog('ajax.recordFail');
    })
    .catch(e => {
      sendLog('ajax.recordFail.fail', {
        recordFail: e.message
      }, 'error');
      console.error(e);
    });
};
