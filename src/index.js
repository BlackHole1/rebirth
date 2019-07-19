const http = require('http');
const handleRequest = require('./lib/handleRequest');
const startChrome = require('./lib/startChrome');
const rerecord = require('./lib/rerecord');
const { PORT } = require('./lib/constants');
const weblog = require('./lib/weblog');

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  weblog.sendLog('server.start');
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

// 打开chrome浏览器
startChrome();

// 当接收到k8s发来的关闭请求时，做出处理
let status = false;
const exit = (message) => {
  if (status) return;
  weblog.sendLog('process.kill', {
    killMessage: message
  });
  status = true;
  rerecord(() => {
    weblog.sendAllLog(() => {
      process.exit();
    })
  });
};
process.once('exit', () => exit('exit'));
process.once('SIGTERM', () => exit('sigterm'));
process.on('message', message => {
  if (message === 'shutdown') {
    exit(message);
  }
});
