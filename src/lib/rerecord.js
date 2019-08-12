const weblog = require('./weblog');
const { waitingModel } = require('../model');

module.exports = (cb) => {

  weblog.sendLog('reRecode.ready');

  waitingModel()
    .then(() => {
      weblog.sendLog('reRecode.success');
      cb();
    })
    .catch(e => {
      weblog.sendLog('reRecode.fail', {
        reRecodeFailMessage: e.message,
        reRecodeFailStack: e.stack || ''
      }, 'error');
      cb();
    });
};
