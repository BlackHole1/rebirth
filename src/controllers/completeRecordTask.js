const { writeFileSync } = require('fs');
const { homedir } = require('os');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { completeModel } = require('../model');
const { exit } = require('../lib/exit');
const { WEBM_TO_MP4, MP4_TO_SILENT, MP4_TO_AAC, DB_SUB_S3_KEY } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { sourceFileName, partFileName, videoWidth, videoHeight } = req.body;
  const fileList = req.body.fileList || {};
  const files = {};
  Object.keys(fileList).forEach((name, index) => {
    files[`name${index}`] = name;
    files[`body${index}`] = req.body.fileList[name];
  });
  weblog.sendLog('complete.req.body', {
    sourceFileName,
    partFileName,
    videoWidth,
    videoHeight,
    files
  });

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

  const s3BaseDir = `h5_outputs/${utils.time()}/${DB_SUB_S3_KEY}`;
  utils.ffmpegHelper(`${sourceFileName}.webm`, `${sourceFileName}.mp4`, WEBM_TO_MP4(videoWidth, videoHeight), req.body)
    .then(({ inputFile, outputFile }) => {
      const convAndUpload = (fileName, ffmpegConfig) => {
        return utils.ffmpegHelper(`${sourceFileName}.mp4`, fileName, ffmpegConfig)
          .then(({ outputFile }) => utils.uploadFileToS3(outputFile, fileName, s3BaseDir));
      };

      if (partFileName === '') {
        return Promise.reject(new Error('part file name is empty'));
      }

      return Promise.all([
        convAndUpload(`${partFileName}.mp4`, MP4_TO_SILENT),
        convAndUpload(`${partFileName}.aac`, MP4_TO_AAC),
      ])
        .then(data => data[0]);
    })
    .then(updateDB)
    .then(() => {
      weblog.sendLog('writeFile', {
        filesNumber: Object.keys(fileList).length,
        filesListType: ({}).toString.call(req.body.fileList)
      });

      // 根据rebirth.generateFile接口保存的文件内容，批量写入文件、上传S3
      return Promise.all(Object.keys(fileList).map(name => {
        const filePath = `${homedir}/Downloads/${name}`;
        writeFileSync(filePath, fileList[name], 'utf-8');
        return utils.uploadFileToS3(filePath, name, s3BaseDir);
      }));
    })
    .then(() => exit('completeTask', false))
    .catch(() => {
      exit('completeFail', true);
    });

  res.sendJson({});
};

module.exports = completeRecordTask;
