import { getRecordTasks, sendLog } from './lib/ajax';
import { IRecord } from './typing/request';
import tabs from './lib/tabs';
import actions from './lib/recording';
import { IData } from './typing/background';

// 获取需要录制的网站以及打开
const getRecordTasksAndStartTab = () => {
  getRecordTasks()
    .then((data: IRecord) => {
      chrome.tabs.create({
        url: data.material_url
      }, tab => {
        const id = tab.id;

        // 5分钟内必须调用init函数，不然录制状态则为失败
        const initTimeoutId = setTimeout(() => {
          sendLog('initTimeout');
          actions.rerecord(id);
        }, 1000 * 60 * 5);

        tabs.setDbId(id, data.id);
        tabs.setAction(id, 'waiting');
        // @ts-ignore
        tabs.setInitTimeoutId(id, initTimeoutId);
        sendLog('openURL', {
          recordInfo: data
        });
      });
    })
    .catch(e => {
      sendLog('getRecordTasks.fail', {
        getRecordTasksFail: e
      }, 'error');
    });
};

// 确保各方面都准备好了
setTimeout(() => {
  getRecordTasksAndStartTab();
}, 1000 * 3);

// 监听网页消息
chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((data: IData) => {
    const currentTabId = port.sender.tab.id;
    const params = [ currentTabId, tabs.getMediaRecorder(currentTabId) ];

    if ([ 'start', 'stop', 'pause', 'resume', 'fail', 'generateFile', 'setVideoBounds', 'init', 'rerecord' ].includes(data.action)) {
      sendLog(`${data.action}.action`, {
        [`${data.action}ActionInfo`]: data,
      });
    }

    if ([ 'pause', 'resume', 'fail', 'rerecord' ].includes(data.action)) {
      actions[data.action](...params);
    }

    if (data.action === 'start') {
      actions.start(currentTabId, data.pageWidth, data.pageHeight);
    }

    if (data.action === 'stop') {
      actions.stop(...params, data.sourceFileName, data.partFileName);
    }

    if (data.action === 'generateFile') {
      tabs.addFile(currentTabId, {
        name: data.fileName,
        content: data.content
      });
    }

    if (data.action === 'setVideoBounds') {
      tabs.setVideoWidth(currentTabId, data.videoWidth);
      tabs.setVideoHeight(currentTabId, data.videoHeight);
    }

    if (data.action === 'ready') {
      port.postMessage({
        type: 'ready',
        info: {
          dbId: tabs.getDbId(currentTabId),
        }
      });
    }

    if (data.action === 'init') {
      clearTimeout(tabs.getInitTimeoutId(currentTabId));
    }
  });
});
