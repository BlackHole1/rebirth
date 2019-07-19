const { parse } = require('url');
const routers = require('./routers');
const { CONTENTTYPE_JSON } = require('./constants');
const utils = require('./utils');

module.exports = (req, res) => {
  const { pathname, query } = parse(req.url);
  req.pathname = pathname;
  req.query = utils.paramsToObj(query);

  res.sendJson = (json) => {
    const result = utils.ToString(json);
    res.writeHead(200, CONTENTTYPE_JSON);
    res.end(result);
  };

  res.sendError = () => {
    res.writeHead(500, CONTENTTYPE_JSON);
    res.end('{}');
  };

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        routers(req, res);
      } catch (e) {}
    });
  } else {
    routers(req, res);
  }
};
