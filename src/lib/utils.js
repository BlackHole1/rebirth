const { type } = require('os');
const { CHROME_PATH_LINUX, CHROME_PATH_MAC, USER_DATA_DIR_MAC, USER_DATA_DIR_LINUX } = require('./constants');

const ToString = val => typeof val === 'string' ? val : JSON.stringify(val);

module.exports.ToString = ToString;

module.exports.paramsToObj = params => {
  if (!params) return {};

  const result = {};
  params.split('&').forEach(p => {
    if (p.indexOf('=') === -1) {
      result[p] = undefined;
    } else {
      const [key, value] = p.split('=');
      result[key] = value;
    }
  });
  return result;
};

module.exports.log = (desc, info) => {
  console.log(`
/**
 * ${desc}
 *
 * ${ToString(info)}
 *
 */`);
};

const isMac = type() === 'Darwin';

module.exports.chromePath = isMac ? CHROME_PATH_MAC : CHROME_PATH_LINUX;

module.exports.userDataPath = isMac ? USER_DATA_DIR_MAC : USER_DATA_DIR_LINUX;
