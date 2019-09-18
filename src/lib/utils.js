const { type, homedir } = require('os');
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

  // 转为string
  ToString (val) {
    return typeof val === 'string' ? val : JSON.stringify(val);
  }

  // 日期格式化
  time() {
    const paddingZero = val => {
      return (val < 10) ? `0${val}` : val;
    };

    const date = new Date();
    const year = date.getFullYear();
    const month = paddingZero(date.getMonth() + 1);
    const day = paddingZero(date.getDate());

    return `${year}/${month}/${day}`;
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
  ffmpegHelper (inputName, outputName, ffmpegParams) {
    return new Promise((resolve, reject) => {
      const baseFile = `${homedir}/Downloads/`;
      const inputFile = baseFile + inputName;
      const outputFile = baseFile + outputName;

      const logBase = {
        ffmpegInputFile: inputName,
        ffmpegOutputFile: outputName,
      };

      ffmpeg(inputFile)
        .on('start', (commandLine) => {
          weblog.sendLog('ffmpeg.start', {
            ffmpegCommand: commandLine,
          });
        })
        .on('error', (err) => {
          weblog.sendLog('ffmpeg.error', {
            ...logBase,
            ffmpegErr: err.message,
          });
          reject();
        })
        .on('end', function() {
          weblog.sendLog('ffmpeg.end', logBase);
          resolve({
            inputFile,
            outputFile
          });
        })
        .outputOptions(ffmpegParams)
        .save(outputFile);
    });
  }

  // 上传文件到s3
  uploadFileToS3 (localFilePath, fileName) {
    return new Promise(resolve => {
      const baseLogData = {
        uploadFileName: fileName,
        uploadLocalFilePath: localFilePath,
      };

      const path = `h5_outputs/${this.time()}/${DB_SUB_S3_KEY}/${fileName.substring(8)}`;
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
