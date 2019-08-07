const { CONTENTTYPE_TEXT } = require('./constants');
const getRecord = require('../controllers/getRecord');
const completeRecordTask = require('../controllers/completeRecordTask');
const recordFail = require('../controllers/recordFail');
const logHandle = require('../controllers/logHandle');

module.exports =  (req, res) => {
  const router = {
    '/': (req, res) => {
      res.writeHead(200, CONTENTTYPE_TEXT);
      res.end('');
    },
    '/getRecord': (req, res) => {
      getRecord(req, res)
    },
    '/completeRecordTask': (req, res) => {
      completeRecordTask(req, res);
    },
    '/recordFail': (req, res) => {
      recordFail(req, res);
    },
    '/logHandle': (req, res) => {
      logHandle(req, res);
    }
  };

  const routerController = router[req.pathname];
  typeof routerController !== 'undefined' && routerController(req, res);
};
