const { type, homedir } = require('os');
const rimraf = require('rimraf');
const ffmpeg = require('fluent-ffmpeg');
const s3 = require('@auth0/s3');
const {
  CHROME_PATH_LINUX,
  CHROME_PATH_MAC,
  USER_DATA_DIR_MAC,
  USER_DATA_DIR_LINUX,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} = require('./constants');

const ToString = val => typeof val === 'string' ? val : JSON.stringify(val);

const paramsToObj = params => {
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
};

const log = (desc, info) => {
  console.log(JSON.stringify({
    desc,
    ...info
  }, null, '  '), '\n');
};

const ffmpegHelper = (inputName, outputName, ffmpegParams) => new Promise((resolve, reject) => {
  const baseFile = `${homedir}/Downloads/`;
  const inputFile = baseFile + inputName;
  const outputFile = baseFile + outputName;

  ffmpeg(inputFile)
    .on('start', function(commandLine) {
      log('ffmpeg start', {
        'ffmpeg command': commandLine
      });
    })
    .on('error', function(err) {
      log('ffmpeg error', {
        inputFile,
        outputFile,
        err: err.message
      });
      reject();
    })
    .on('end', function() {
      log('ffmpeg end', {
        inputFile,
        outputFile,
      });
      resolve({
        inputFile,
        outputFile
      });
    })
    .outputOptions(ffmpegParams)
    .save(outputFile);
});

const client = s3.createClient({
  s3Options: {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});
const uploadWebmToS3 = (localFilePath, fileName, subS3Key) => new Promise(resolve => {
  const date = new Date();
  const path = `h5_outputs/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${subS3Key}/${fileName}`;
  const params = {
    localFile: localFilePath,
    s3Params: {
      Bucket: AWS_BUCKET,
      Key: path,
    }
  };
  const uploader = client.uploadFile(params);
  uploader.on('fileOpened', () => {
    log('ready upload: file open', {
      localFilePath
    });
  });
  uploader.on('fileClosed', () => {
    log('ready upload: file closed', {
      localFilePath
    });
  });
  uploader.on('error', err => {
    log('upload s3 fail', {
      localFilePath,
      message: err.message,
      stack: err.stack
    });
  });
  uploader.on('end', () => {
    const s3URL = `https://s3.${AWS_REGION}.amazonaws.com.cn/${AWS_BUCKET}/${path}`;
    log('upload s3 success', {
      localFilePath,
      s3URL
    });
    resolve(s3URL);
  });
});

const deleteFiles = fileList => {
  return Promise.all(fileList.map(file => new Promise(resolve => {
    rimraf(file, (e) => {
      if (e) {
        log('delete file fail', {
          error: e
        });
        resolve();
      } else {
        log('delete file success', {
          file
        });
        resolve();
      }
    })
  })))
};

const isMac = type() === 'Darwin';

module.exports.ToString = ToString;
module.exports.paramsToObj = paramsToObj;
module.exports.log = log;
module.exports.ffmpegHelper = ffmpegHelper;
module.exports.uploadWebmToS3 = uploadWebmToS3;
module.exports.deleteFiles = deleteFiles;
module.exports.chromePath = isMac ? CHROME_PATH_MAC : CHROME_PATH_LINUX;
module.exports.userDataPath = isMac ? USER_DATA_DIR_MAC : USER_DATA_DIR_LINUX;
