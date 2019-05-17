const { parse } = require('url');
const routers = require('./routers');
const { CONTENTTYPE_JSON } = require('./constants');
const { ToString, paramsToObj } = require('./utils');
const servicesStatus = require('./servicesStatus');

module.exports = (req, res) => {
  const { pathname, query } = parse(req.url);
  req.pathname = pathname;
  req.query = paramsToObj(query);

  res.sendJson = (json, desc, info) => {
    const result = ToString(json);
    res.writeHead(200, CONTENTTYPE_JSON);
    res.end(result);

    if (desc !== undefined) {
      console.log(`=============${desc}=============`);
      console.log(result);
    }

    if (info !== undefined) {
      console.log(`=============${desc} info=============`);
      console.log(ToString(info));
    }
  };

  res.sendError = (message, error, details) => {
    servicesStatus.setMysqlError = true;

    const result = JSON.stringify({
      message,
      error: ToString(error),
      details: ToString(details)
    });
    res.writeHead(500, CONTENTTYPE_JSON);
    res.end(result);

    console.log('-------------error-------------');
    console.log(result);
  };

  routers(req, res);
};
