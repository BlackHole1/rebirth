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
    this.chromeClose = val;
  }

  get getChromeError () {
    return this.chromeError;
  }

  set setChromeError (val) {
    this.chromeError = val;
  }

  get getMysqlError () {
    return this.mysqlError;
  }

  set setMysqlError (val) {
    this.mysqlError = val;
  }

  get getChromeRemoteDebugError () {
    return this.chromeRemoteDebugError;
  }

  set setChromeRemoteDebugError (val) {
    this.chromeRemoteDebugError = val;
  }

  get getChromeCrash () {
    return this.chromeCrash;
  }

  set setChromeCrash (val) {
    return this.chromeCrash = val;
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
