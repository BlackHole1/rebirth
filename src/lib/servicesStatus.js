class ServicesStatus {
  constructor() {
    this.chromeClose = false;
    this.chromeError = false;
    this.mysqlError = false;
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

  get isNormal () {
    return [this.getChromeClose, this.getChromeError, this.getMysqlError].every(val => !val)
  }
}

module.exports = new ServicesStatus();
