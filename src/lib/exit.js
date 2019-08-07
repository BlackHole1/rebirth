const weblog = require('./weblog');
const rerecord = require('./rerecord');

// 当接收到k8s发来的关闭请求时，做出处理
let status = false;
module.exports.exit = (message, isRerecord) => {
  if (status) return;
  weblog.sendLog('process.kill', {
    killMessage: message
  });
  status = true;

  const sendLogAndExit = () => {
    weblog.sendAllLog(() => {
      process.exit();
    })
  };

  // 是否重录
  if (isRerecord) {
    rerecord(sendLogAndExit);
  } else {
    sendLogAndExit();
  }
};
