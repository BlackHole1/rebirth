const mysql = require('promise-mysql');
const { MYSQL_HOST, MYSQL_PORT, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE } = require('./constants');

module.exports = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 5
});
