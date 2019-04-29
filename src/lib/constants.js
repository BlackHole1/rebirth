module.exports.PORT = 80;

module.exports.CONTENTTYPE_TEXT = {'Content-Type': 'text/plain'};
module.exports.CONTENTTYPE_JSON = {'Content-Type': 'application/json'};

module.exports.MYSQL_HOST = process.env.MYSQL_HOST;
module.exports.MYSQL_PORT = process.env.MYSQL_PORT;
module.exports.MYSQL_USERNAME = process.env.MYSQL_USERNAME;
module.exports.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
module.exports.MYSQL_DATABASE = process.env.MYSQL_DATABASE;
module.exports.MYSQL_TABLE = process.env.MYSQL_TABLE;

module.exports.CHROME_PATH_MAC = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
module.exports.CHROME_PATH_LINUX = '/usr/bin/google-chrome-stable';

module.exports.USER_DATA_DIR_MAC = '/tmp/rebirth';
module.exports.USER_DATA_DIR_LINUX = '/root/test';
