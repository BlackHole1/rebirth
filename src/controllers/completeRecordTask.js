const { writeFileSync } = require('fs');
const { homedir } = require('os');
const mysqlService = require('../lib/mysql');
const rerecord = require('../lib/rerecord');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { setTaskStatusIsComplete } = require('../lib/SQLConstants');
const { WEBM_TO_MP4, MP4_TO_SILENT, MP4_TO_AAC } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { dbId, sourceFileName, partFileName, subS3Key, videoWidth, videoHeight, fileList } = req.body;
  let willDeleteFiles = [];

  const updateDB = s3URL => {
    mysqlService.getConnection()
      .then(async conn => {
        const result = await utils.SQLHandle(conn, setTaskStatusIsComplete, 'setTaskStatusIsComplete')(s3URL, dbId);
        conn.release();
        recordTasks.completeTask = dbId;

        res.sendJson(result);
      })
      .catch(e => {
        servicesStatus.setMysqlError = true;
        weblog.sendLog('completeRecord.fail', {
          dbId,
          completeRecordFailMessage: e.message,
          completeRecordFailStack: e.stack || ''
        }, 'error');
        res.sendError();
      });
  };

  utils.ffmpegHelper(`${sourceFileName}.webm`, `${sourceFileName}.mp4`, WEBM_TO_MP4(videoWidth, videoHeight), req.body)
    .then(({ inputFile, outputFile }) => {
      willDeleteFiles.push(inputFile, outputFile);

      const convAndUpload = (fileName, ffmpegConfig) => {
        return utils.ffmpegHelper(`${sourceFileName}.mp4`, fileName, ffmpegConfig, req.body)
          .then(({ outputFile }) => {
            willDeleteFiles.push(outputFile);
            return utils.uploadFileToS3(outputFile, fileName, subS3Key, req.body);
          });
      };

      const uploadSourceWebmS3 = () => utils.uploadFileToS3(inputFile, `${sourceFileName}.webm`, subS3Key, req.body);
      const uploadSourceMP4S3 = () => utils.uploadFileToS3(outputFile, `${sourceFileName}.mp4`, subS3Key, req.body);
      const uploadFileToS3 = () => uploadSourceWebmS3().then(uploadSourceMP4S3);

      if (partFileName === '') {
        return uploadFileToS3();
      }

      return Promise.all([
        convAndUpload(`${partFileName}.mp4`, MP4_TO_SILENT),
        convAndUpload(`${partFileName}.aac`, MP4_TO_AAC),
      ])
        .then(uploadFileToS3)
    })
    .then(updateDB)
    .then(() => {
      // 根据rebirth.generateFile接口保存的文件内容，批量写入文件、上传S3
      Object.keys(fileList).forEach(name => {
        const filePath = `${homedir}/Downloads/${name}`;
        writeFileSync(filePath, fileList[name], 'utf-8');
        utils.uploadFileToS3(filePath, name, subS3Key, req.body);
        willDeleteFiles.push(filePath);
      });
    })
    .then(() => utils.deleteFiles(willDeleteFiles, req.body))
    .catch(() => {
      rerecord(dbId);
    });

  res.sendJson({});
};

module.exports = completeRecordTask;
