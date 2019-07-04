const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { webmToMP4, uploadWebmToS3, deleteFiles } = require('../lib/utils');
const { MYSQL_TABLE } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { hash, fileName, width, height } = req.query;
  let willDeleteFiles = [];

  const updateDB = s3URL => {
    mysqlService.getConnection()
      .then(async conn => {
        const result = await conn.query(`UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE task_hash='${hash}' and merge_result_url is null`);
        conn.release();
        recordTasks.completeTask = hash;

        res.sendJson(result , 'completeRecordTask', {
          hash: hash,
          s3URL: s3URL,
          sql: `UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE task_hash='${hash}' and merge_result_url is null`
        });
      })
      .catch(e => {
        servicesStatus.setMysqlError = true;
        res.sendError(
          'update fail',
          e,
          {
            sql: `UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE task_hash='${hash}' and merge_result_url is null`
          }
        );
      });
  };

  webmToMP4(fileName, width, height)
    .then(({ inputFile, outputFile }) => {
      willDeleteFiles = willDeleteFiles.concat(inputFile, outputFile);
      return uploadWebmToS3(outputFile, fileName)
    })
    .then(updateDB)
    .then(() => deleteFiles(willDeleteFiles))
    .catch(() => {});

  res.sendJson({});
};

module.exports = completeRecordTask;
