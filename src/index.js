const http = require('http');
const handleRequest = require('./lib/handleRequest');
const startChrome = require('./lib/startChrome');
const servicesStatus = require('./lib/servicesStatus');
const { PORT } = require('./lib/constants');
const { exit } = require('./lib/exit');
const weblog = require('./lib/weblog');
const { recordFailModel } = require('./model');

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  weblog.sendLog('server.start');
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

// 打开chrome浏览器
startChrome();

// 任何非自己意愿退出的，全部重录
process.once('exit', () => exit('exit', true));
process.once('SIGTERM', () => exit('sigterm', true));
process.on('message', message => {
  if (message === 'shutdown') {
    exit(message, true);
  }
});

// 2个小时内，必须录制结束，否则录制失败。此函数没有清除操作，因为录制完成后容器将会被删除，清除代码也没有必要写了
setTimeout(() => {
  weblog.sendLog('waitingTimeout');
  const exitHandle = () => exit('waitingTimeout', false);
  recordFailModel().then(exitHandle).catch(exitHandle)
}, 1000 * 60 * 60 * 2);

// 模仿k8s的存活指针
setInterval(() => {
  if (!servicesStatus.isNormal) {
    exit('serviceFail', true)
  }
}, 1000 * 5);
