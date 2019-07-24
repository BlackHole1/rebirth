import { getRecordTasks, sendLog } from './lib/ajax';
import { IRecord } from './typing/request';
import tabs from './lib/tabs';
import { RecordNumber } from './lib/constants';
import recordingQueue from './lib/recordingQueue';
import actions from './lib/recording';
import { IData } from './typing/background';
import { randomNumber } from './lib/utils';

// 获取需要录制的网站以及打开
const getRecordTasksAndStartTab = (num: number = RecordNumber) => {
  getRecordTasks(num)
    .then((data: IRecord) => {
      if (data.length === 0) {
        return;
      }

      data.forEach(record => {
        chrome.tabs.create({
          url: record.material_url
        }, tab => {
          const id = tab.id;
          tabs.setDbId(id, record.id);
          tabs.setAction(id, 'waiting');
          tabs.setSubS3Key(id, record.sub_s3_key);
          sendLog('openURL', {
            dbId: record.id,
            recordInfo: record
          });
        });
      });
    })
    .catch(e => {
      sendLog('getRecordTasks.fail', {
        getRecordTasksFail: e
      }, 'error');
    });
};

// 为了防止多个容器同时请求数据库(高并发的情况下)，数据还未及时更新造成的多个容器录制同一个网站的情况。
setTimeout(() => {
  getRecordTasksAndStartTab();

  // 每隔 随机后的1分钟~3分钟 请求一次
  setInterval(() => {
    const getFreeNumber = tabs.getFreeNumber();

    if (getFreeNumber === 0) return;
    getRecordTasksAndStartTab(getFreeNumber);
  }, randomNumber(1000 * 60, 3000 * 60));
}, randomNumber(1000, 3000 * 10));

// 轮询tab页，chrome会对非激活的tab也进行一个资源压缩
const getTabs = () => new Promise((resolve) => {
  chrome.tabs.query({}, (tabs) => {
    resolve(tabs.map(tab => tab.id));
  });
});

// 轮询激活标签页
const pollActiveTab = (tabs: number[]) => new Promise(resolve => {
  const tabLength = tabs.length;
  let tabIndex = 0;

  if (tabLength === 1) {
    return resolve();
  }

  // 激活下一个标签页
  const next = (fun: () => void) =>  {
    setTimeout(() => {
      recordingQueue.enqueue(() => {
        fun();
      });
    }, 2000);
  };

  // 激活标签页
  const activeTab = () => {
    chrome.tabs.update(tabs[tabIndex], {
      active: true
    }, () => {
      recordingQueue.complete();
      setTimeout(() => {
        tabIndex++;
        if (tabIndex === tabLength) {
          return resolve();
        }
        next(activeTab);
      }, 2000);
    });
  };
  next(activeTab);
});

// 开始循环激活
(function poll() {
  getTabs().then(pollActiveTab).then(poll).catch(() => {});
})();

// 监听网页消息
chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((data: IData) => {
    const currentTabId = port.sender.tab.id;
    const params = [ currentTabId, tabs.getMediaRecorder(currentTabId) ];

    if ([ 'start', 'stop', 'pause', 'resume', 'fail', 'generateFile', 'setVideoBounds' ].includes(data.action)) {
      sendLog(`${data.action}.action`, {
        [`${data.action}ActionInfo`]: data,
        dbId: tabs.getDbId(currentTabId)
      });
    }

    if ([ 'pause', 'resume', 'fail' ].includes(data.action)) {
      actions[data.action](...params);
    }

    if (data.action === 'start') {
      recordingQueue.enqueue(() => {
        actions.start(currentTabId, data.pageWidth, data.pageHeight);
      });
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
  });
});
