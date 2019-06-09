import { getRecordTasks } from './lib/ajax';
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
          tabs.setAction(id, 'waiting');
          tabs.setHash(id, record.task_hash);
        });
      });
    })
    .catch(e => {
      console.error(e);
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

// 监听网页消息
chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((data: IData) => {
    if ([ 'start', 'pause', 'resume', 'stop' ].includes(data.action)) {
      const fun = () => {
        const currentTabId = port.sender.tab.id;
        const lastParams = data.action === 'start' ? data.filename : tabs.getMediaRecorder(currentTabId);
        actions[data.action](currentTabId, lastParams);
      };

      // 如果队列为空，则直接运行
      if (recordingQueue.isEmpty()) {
        fun();
      } else {
        // 加入录屏队列，等待上一次录屏开始后，在被运行
        recordingQueue.enqueue(fun);
      }
    }
  });
});
