const os = require('os');
const git = require('git-rev-sync');
const { WebLog } = require('weblog');
const { WebLogPluginKibana } = require('weblog-plugin-kibana');
const { version } = require('../package');
const { ENV, KIBANA_TOKEN, KIBANA_URL } = require('./constants');

const getGitHash = () => {
  // 在集群里是没有.git目录的
  try {
    return git.short()
  } catch (e) {
    return process.env.CI_COMMIT_SHORT_SHA || 'nohash';
  }
};

class Log {
  constructor () {
    this.weblog = new WebLog({
      env: ENV,
      deviceName: os.hostname(),
      deviceModel: os.type(),
      machineId: os.hostname(), // 不想在引用额外的包来获取machineId了，就用名字来拿就好
      app: {
        name: 'rebirth',
        version: version,
        type: 'pc',
        channel: 'gitlab',
        build: getGitHash()
      }
    });

    this.weblog.setSendStrategy({
      sendMode: 'delay',
      cacheSpace: 5
    });

    this.weblog.setPlugins({
      kibana: new WebLogPluginKibana({
        url: KIBANA_URL,
        token: KIBANA_TOKEN,
      })
    });
  }

  sendLog (name, payload = {}, level = 'info') {
    this.weblog.event(name, '', payload, level);
  }

  sendAllLog (cb) {
    this.weblog.sendAll(cb);
  }
}

module.exports = new Log();

