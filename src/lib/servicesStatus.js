const weblog = require('./weblog');

class ServicesStatus {
  constructor() {
    this.chromeClose = false;
    this.chromeError = false;
    this.mysqlError = false;
    this.chromeRemoteDebugError = false;
    this.chromeCrash = false;
  }

  get getChromeClose () {
    return this.chromeClose;
  }

  set setChromeClose (val) {
    weblog.sendLog('servicesStatus.chromeClose', {
      servicesStatus_chromeClose: val
    });
    this.chromeClose = val;
  }

  get getChromeError () {
    return this.chromeError;
  }

  set setChromeError (val) {
    weblog.sendLog('servicesStatus.chromeError', {
      servicesStatus_chromeError: val
    });
    this.chromeError = val;
  }

  get getMysqlError () {
    return this.mysqlError;
  }

  set setMysqlError (val) {
    weblog.sendLog('servicesStatus.mysqlError', {
      servicesStatus_mysqlError: val
    });
    this.mysqlError = val;
  }

  get getChromeRemoteDebugError () {
    return this.chromeRemoteDebugError;
  }

  set setChromeRemoteDebugError (val) {
    weblog.sendLog('servicesStatus.chromeRemoteDebugError', {
      servicesStatus_chromeRemoteDebugError: val
    });
    this.chromeRemoteDebugError = val;
  }

  get getChromeCrash () {
    return this.chromeCrash;
  }

  set setChromeCrash (val) {
    weblog.sendLog('servicesStatus.chromeCrash', {
      servicesStatus_chromeCrash: val
    });
    this.chromeCrash = val;
  }

  get isNormal () {
    return [
      this.getChromeClose,
      this.getChromeError,
      this.getMysqlError,
      this.getChromeRemoteDebugError,
      this.getChromeCrash
    ].every(val => !val)
  }
}

module.exports = new ServicesStatus();
