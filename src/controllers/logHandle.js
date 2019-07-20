const weblog = require('../lib/weblog');

const logHandle = (req, res) => {
  const { name, payload, level } = req.body;
  weblog.sendLog(name, payload, level);

  res.sendJson({});
};

module.exports = logHandle;
