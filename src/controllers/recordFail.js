const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const { recordFailModel } = require('../model');
const { exit } = require('../lib/exit');

// 录制失败
const recordFail = (req, res) => {
  recordFailModel()
    .then(result => {
      res.sendJson(result);
    })
    .then(() => exit('callRecordFailAPI', false))
    .catch(e => {
      servicesStatus.setMysqlError = true;
      weblog.sendLog('recordFail.fail', {
        recordFailMessage: e.message,
        recordFailStack: e.stack || ''
      }, 'error');
      res.sendError();
    });
};

module.exports = recordFail;
