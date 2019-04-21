const { parse } = require('url');
const routers = require('./routers');
const { CONTENTTYPE_JSON } = require('./constants');
const { ToString, paramsToObj } = require('./utils');
const servicesStatus = require('./servicesStatus');

module.exports = (req, res) => {
  const { pathname, query } = parse(req.url);
  req.pathname = pathname;
  req.query = paramsToObj(query);

  res.sendJson = json => {
    const result = ToString(json);
    res.writeHead(200, CONTENTTYPE_JSON);
    res.end(result);
  };

  res.sendError = (message, error, details) => {
    servicesStatus.setMysqlError = true;
    res.writeHead(500, CONTENTTYPE_JSON);
    res.end(JSON.stringify({
      message,
      error: ToString(error),
      details: ToString(details)
    }));
  };

  routers(req, res);
};
