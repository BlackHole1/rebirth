import { IData } from './typing/background';

(function checkChromeCrash () {
  if (typeof chrome.runtime.id === 'undefined') {
    fetch(`${SERVER_URL}/crash?source=extension`, {
      method: 'PUT'
    });
    return;
  }

  // 每隔3秒钟检测一次
  setTimeout(checkChromeCrash, 1000 * 3);
})();

window.onload = () => {
  const injectedScript = document.createElement('script');
  injectedScript.src = chrome.extension.getURL('injected.js');
  (document.head || document.documentElement).appendChild(injectedScript);
};

if (typeof chrome.runtime.id !== 'undefined') {
  // 处理插件消息
  chrome.runtime.onMessage.addListener(msg => {
    if (({}).toString.call(msg) !== '[object Object]') {
      return;
    }

    // 有错误时
    if (msg.error) {
      console.error(`[rebirth plugin]: ${JSON.stringify(msg.error)}`);
      return;
    }
  });

  // 把网页消息的消息，转发给插件进行处理
  const port = chrome.runtime.connect(chrome.runtime.id);
  window.addEventListener("message", (event: { data: IData }) => {
    if(Object.keys(event.data).length === 0) return;

    if (event.data.action) {
      port.postMessage(event.data);
    }
  }, false);
}
