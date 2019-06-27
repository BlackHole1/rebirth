const { parse } = require('url');
const routers = require('./routers');
const { CONTENTTYPE_JSON } = require('./constants');
const { ToString, paramsToObj, log } = require('./utils');
const servicesStatus = require('./servicesStatus');

module.exports = (req, res) => {
  const { pathname, query } = parse(req.url);
  req.pathname = pathname;
  req.query = paramsToObj(query);

  res.sendJson = (json, desc, info) => {
    const result = ToString(json);
    res.writeHead(200, CONTENTTYPE_JSON);
    res.end(result);

    if (desc !== undefined && info === undefined) {
      log(desc, {
        json
      });
    }

    if (info !== undefined) {
      log(`${desc} info`, {
        json,
        info
      });
    }
  };

  res.sendError = (message, error, details) => {
    servicesStatus.setMysqlError = true;

    const data = {
      message,
      error: ToString(error),
      details: ToString(details)
    };
    const result = JSON.stringify(data);
    res.writeHead(500, CONTENTTYPE_JSON);
    res.end(result);

    log('error', data);
  };

  routers(req, res);
};
