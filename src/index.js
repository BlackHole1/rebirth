const http = require('http');
const handleRequest = require('./lib/handleRequest');
const startChrome = require('./lib/startChrome');
const servicesStatus = require('./lib/servicesStatus');
const { PORT } = require('./lib/constants');
const { exit } = require('./lib/exit');
const weblog = require('./lib/weblog');

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

// 模仿k8s的存活指针
setInterval(() => {
  if (!servicesStatus.isNormal) {
    exit('serviceFail', true)
  }
}, 1000 * 5);
