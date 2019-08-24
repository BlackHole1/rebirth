const { writeFileSync } = require('fs');
const { homedir } = require('os');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { completeModel } = require('../model');
const { exit } = require('../lib/exit');
const { WEBM_TO_MP4, MP4_TO_SILENT, MP4_TO_AAC } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { sourceFileName, partFileName, videoWidth, videoHeight, fileList } = req.body;
  let willDeleteFiles = [];

  const updateDB = s3URL => {
    return completeModel(s3URL)
      .then(result => {
        res.sendJson(result);
      })
      .catch(e => {
        servicesStatus.setMysqlError = true;
        weblog.sendLog('completeRecord.fail', {
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
            return utils.uploadFileToS3(outputFile, fileName, req.body);
          });
      };

      const uploadSourceWebmS3 = () => utils.uploadFileToS3(inputFile, `${sourceFileName}.webm`, req.body);
      const uploadSourceMP4S3 = () => utils.uploadFileToS3(outputFile, `${sourceFileName}.mp4`, req.body);
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
        utils.uploadFileToS3(filePath, name, req.body);
        willDeleteFiles.push(filePath);
      });
    })
    .then(() => utils.deleteFiles(willDeleteFiles, req.body))
    .then(() => exit('completeTask', false))
    .catch(() => {
      exit('completeFail', true);
    });

  res.sendJson({});
};

module.exports = completeRecordTask;
