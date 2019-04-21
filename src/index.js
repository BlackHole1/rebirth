const http = require('http');
const handleRequest = require('./lib/handleRequest');
const startChrome = require('./lib/startChrome');
const rerecord = require('./lib/rerecord');
const { PORT } = require('./lib/constants');

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

// 打开chrome浏览器
startChrome();

// 当接收到k8s发来的关闭请求时，做出处理
console.log(process.pid);
let status = false;
const exit = () => {
  if (status) return;
  status = true;
  rerecord();
};
process.once('exit', exit);
process.once('SIGINT', exit);
process.once('SIGTERM', exit);
process.on('message', message => {
  if (message === 'shutdown') {
    exit();
  }
});
