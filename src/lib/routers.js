const { CONTENTTYPE_TEXT } = require('./constants');
const servicesStatus = require('./servicesStatus');
const getRecord = require('../controllers/getRecord');
const completeRecordTask = require('../controllers/completeRecordTask');
const recordFail = require('../controllers/recordFail');

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
    '/liveness': (req, res) => {
      const statusCode = servicesStatus.isNormal ? 200 : 500;
      res.writeHead(statusCode, CONTENTTYPE_TEXT);
      res.end('');
    }
  };

  const routerController = router[req.pathname];
  typeof routerController !== 'undefined' && routerController(req, res);
};
