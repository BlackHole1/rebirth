const { writeFileSync } = require('fs');
const { homedir } = require('os');
const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { webmToMP4, uploadWebmToS3, deleteFiles } = require('../lib/utils');
const { MYSQL_TABLE } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { hash, fileName, subS3Key, width, height, fileList } = req.body;
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

      // 根据rebirth.generateFile接口保存的文件内容，批量写入文件、上传S3
      Object.keys(fileList).forEach(name => {
        const filePath = `${homedir}/Downloads/${name}`;
        writeFileSync(filePath, fileList[name], 'utf-8');
        uploadWebmToS3(filePath, name, subS3Key);
        willDeleteFiles.push(filePath);
      });
      return uploadWebmToS3(outputFile, `${fileName}.mp4`, subS3Key)
    })
    .then(updateDB)
    .then(() => deleteFiles(willDeleteFiles))
    .catch(() => {});

  res.sendJson({});
};

module.exports = completeRecordTask;
