const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const { exit } = require('../lib/exit');
const recordFail = require('../controllers/recordFail');
const { waitingModelByPage } = require('../model');
const { REPEAT, MAX_REPEAT } = require('../lib/constants');

const rerecordTask = (req, res) => {
  if (REPEAT >= MAX_REPEAT) {
    weblog.sendLog('repeat.exhausted');
    recordFail(req, res);
    return;
  }
  waitingModelByPage()
    .then(() => {
      weblog.sendLog('rerecordTask.success');
      res.sendJson({});
      exit('rerecordTask', false);
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      weblog.sendLog('rerecordTask.fail', {
        rerecordTaskFailMessage: e.message,
        rerecordTaskFailStack: e.stack || ''
      }, 'error');
      res.sendError();
    })
};

module.exports = rerecordTask;
