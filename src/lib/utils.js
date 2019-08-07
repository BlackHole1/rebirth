const { type, homedir } = require('os');
const rimraf = require('rimraf');
const ffmpeg = require('fluent-ffmpeg');
const s3 = require('@auth0/s3');
const weblog = require('./weblog');
const {
  CHROME_PATH_LINUX,
  CHROME_PATH_MAC,
  USER_DATA_DIR_MAC,
  USER_DATA_DIR_LINUX,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  DB_SUB_S3_KEY,
} = require('./constants');

class Utils {
  constructor () {
    this.client = s3.createClient({
      s3Options: {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    })
  }

  ToString (val) {
    return typeof val === 'string' ? val : JSON.stringify(val);
  }

  // 把对象里的数组转成对象形式
  arrayToObject (obj) {
    const replacer = (key, value) => {
      if (({}).toString.call(value) === '[object Array]') {
        return Object.assign({}, value);
      }
      return value;
    };

    const result = JSON.stringify(obj, replacer);
    try {
      return JSON.parse(result);
    } catch (e) {
      return result;
    }
  }

  // url参数转对象
  paramsToObj (params) {
    if (!params) return {};

    const result = {};
    params.split('&').forEach(p => {
      if (p.indexOf('=') === -1) {
        result[p] = undefined;
      } else {
        const [key, value] = p.split('=');
        result[key] = value;
      }
    });
    return result;
  }

  // ffmpeg处理函数
  ffmpegHelper (inputName, outputName, ffmpegParams, ffmpegOtherInfo) {
    return new Promise((resolve, reject) => {
      const baseFile = `${homedir}/Downloads/`;
      const inputFile = baseFile + inputName;
      const outputFile = baseFile + outputName;

      ffmpeg(inputFile)
        .on('start', (commandLine) => {
          weblog.sendLog('ffmpeg.start', {
            ffmpegCommand: commandLine,
            ffmpegOtherInfo
          });
        })
        .on('error', (err) => {
          weblog.sendLog('ffmpeg.error', {
            ffmpegInputFile: inputName,
            ffmpegOutputFile: outputName,
            ffmpegErr: err.message,
            ffmpegOtherInfo
          });
          reject();
        })
        .on('end', function() {
          weblog.sendLog('ffmpeg.end', {
            ffmpegInputFile: inputName,
            ffmpegOutputFile: outputName,
            ffmpegOtherInfo
          });
          resolve({
            inputFile,
            outputFile
          });
        })
        .outputOptions(ffmpegParams)
        .save(outputFile);
    });
  }

  uploadFileToS3 (localFilePath, fileName, uploadFileOtherInfo) {
    return new Promise(resolve => {
      const baseLogData = {
        uploadFileName: fileName,
        uploadLocalFilePath: localFilePath,
        uploadFileOtherInfo
      };

      const date = new Date();
      const path = `h5_outputs/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${DB_SUB_S3_KEY}/${fileName.substring(8)}`;
      const params = {
        localFile: localFilePath,
        s3Params: {
          Bucket: AWS_BUCKET,
          Key: path,
        }
      };
      const uploader = this.client.uploadFile(params);
      uploader.on('fileOpened', () => {
        weblog.sendLog('uploadFile.open', baseLogData);
      });
      uploader.on('fileClosed', () => {
        weblog.sendLog('uploadFile.closed', baseLogData);
      });
      uploader.on('error', err => {
        weblog.sendLog('uploadFile.fail', {
          ...baseLogData,
          uploadFailMessage: err.message,
          uploadFailStack: err.stack || '',
        }, 'error');
      });
      uploader.on('end', () => {
        const s3URL = `https://s3.${AWS_REGION}.amazonaws.com.cn/${AWS_BUCKET}/${path}`;
        weblog.sendLog('uploadFile.end', {
          ...baseLogData,
          uploadFileS3URL: s3URL,
        });
        resolve(s3URL);
      });
    })
  }

  deleteFiles (fileList, deleteFilesOtherInfo) {
    return Promise.all(fileList.map(file => new Promise(resolve => {
      const baseLogData = {
        deleteFilesOtherInfo,
        deleteFile: file
      };

      rimraf(file, (e) => {
        if (e) {
          weblog.sendLog('deleteFile.fail', {
            ...baseLogData,
            deleteFileFail: e
          }, 'error');
        } else {
          weblog.sendLog('deleteFile.success', baseLogData);
        }
        resolve();
      })
    })))
  }

  // 执行SQL语句，并发送相关日志
  SQLHandle (conn, sql, name) {
    return async (...params) => {
      const SQLQuery = sql(...params);
      const result = await conn.query(SQLQuery);
      weblog.sendLog(name, {
        [name]: this.arrayToObject(result),
        SQLQuery
      });
      return result;
    }
  }

  isMac () {
    return type() === 'Darwin';
  }

  chromePath () {
    return this.isMac() ? CHROME_PATH_MAC : CHROME_PATH_LINUX;
  }

  userDataPath () {
    return this.isMac() ? USER_DATA_DIR_MAC : USER_DATA_DIR_LINUX;
  }
}

module.exports = new Utils();
