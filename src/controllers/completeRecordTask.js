const { writeFileSync } = require('fs');
const { homedir } = require('os');
const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { ffmpegHelper, uploadFileToS3, deleteFiles } = require('../lib/utils');
const { MYSQL_TABLE, WEBM_TO_MP4, MP4_TO_SILENT, MP4_TO_AAC } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { hash, sourceFileName, partFileName, subS3Key, videoWidth, videoHeight, fileList } = req.body;
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

  ffmpegHelper(`${sourceFileName}.webm`, `${sourceFileName}.mp4`, WEBM_TO_MP4(videoWidth, videoHeight))
    .then(({ inputFile, outputFile }) => {
      willDeleteFiles.push(inputFile, outputFile);

      const convAndUpload = (fileName, ffmpegConfig) => {
        return ffmpegHelper(`${sourceFileName}.mp4`, fileName, ffmpegConfig)
          .then(({ outputFile }) => {
            willDeleteFiles.push(outputFile);
            return uploadFileToS3(outputFile, fileName, subS3Key);
          });
      };

      const uploadS3 = () => uploadFileToS3(outputFile, `${sourceFileName}.mp4`, subS3Key);

      if (partFileName === '') {
        return uploadS3();
      }

      return Promise.all([
        convAndUpload(`${partFileName}.mp4`, MP4_TO_SILENT),
        convAndUpload(`${partFileName}.aac`, MP4_TO_AAC),
      ])
        .then(uploadS3)
    })
    .then(updateDB)
    .then(() => {
      // 根据rebirth.generateFile接口保存的文件内容，批量写入文件、上传S3
      Object.keys(fileList).forEach(name => {
        const filePath = `${homedir}/Downloads/${name}`;
        writeFileSync(filePath, fileList[name], 'utf-8');
        uploadFileToS3(filePath, name, subS3Key);
        willDeleteFiles.push(filePath);
      });
    })
    .then(() => deleteFiles(willDeleteFiles))
    .catch(() => {});

  res.sendJson({});
};

module.exports = completeRecordTask;
