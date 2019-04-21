const mysql = require('promise-mysql');
const servicesStatus = require('./servicesStatus');
const { MYSQL_HOST, MYSQL_PORT, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE } = require('./constants');

const connection = () => {
 return mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  }).catch(e => {
    console.error(e);
    servicesStatus.setMysqlError = true;
  });
};

module.exports = connection();
