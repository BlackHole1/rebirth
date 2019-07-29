module.exports.PORT = 80;

module.exports.CONTENTTYPE_TEXT = {'Content-Type': 'text/plain'};
module.exports.CONTENTTYPE_JSON = {'Content-Type': 'application/json'};

module.exports.MYSQL_HOST = process.env.MYSQL_HOST;
module.exports.MYSQL_PORT = process.env.MYSQL_PORT;
module.exports.MYSQL_USERNAME = process.env.MYSQL_USERNAME;
module.exports.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
module.exports.MYSQL_DATABASE = process.env.MYSQL_DATABASE;
module.exports.MYSQL_TABLE = process.env.MYSQL_TABLE;

module.exports.AWS_BUCKET = process.env.AWS_BUCKET;
module.exports.AWS_REGION = process.env.AWS_REGION;
module.exports.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
module.exports.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// dev alpha beta staging production（dev为本地调试的环境）
module.exports.ENV = process.env.CI_ENVIRONMENT_SLUG || 'dev';
module.exports.KIBANA_URL = process.env.KIBANA_URL || 'https://collector.alo7.com/1';
module.exports.KIBANA_TOKEN = process.env.KIBANA_TOKEN || '6w72FEE5C73Me7octwQD2Lom';

module.exports.CHROME_PATH_MAC = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
module.exports.CHROME_PATH_LINUX = '/usr/bin/google-chrome-stable';

module.exports.USER_DATA_DIR_MAC = '/tmp/rebirth';
module.exports.USER_DATA_DIR_LINUX = '/root/test';

module.exports.WEBM_TO_MP4 = (videoWidth, videoHeight) => {
  const params = [
    '-fflags +genpts',  // 因为webm的比特率不稳定，所以利用这个参数，生成稳定的mp4，否则会出现aac和mp4无法对应上的问题
    '-max_muxing_queue_size 99999',  // 缓存大小，如果是默认的话，因为视频过大，会导致转码失败
    '-r 15',  // FPS，录制的FPS是30
    '-crf 30', // 视频清晰度，值越低越清晰，但是一般来说18是人眼可观察到的，低于18，人是区分不了的。还会增加最终视频的大小
  ];
  if (Number(videoWidth) !== 0 && Number(videoHeight) !== 0) {
    params.push(`-filter:v crop=${videoWidth}:${videoHeight}:0:0`); // 截取视频宽高
  }

  return params;
};
module.exports.MP4_TO_SILENT = [
  '-an',
  '-vcodec copy'
];
module.exports.MP4_TO_AAC = [
  '-vn',
  '-acodec libfdk_aac',
  '-b:a 200k',
  '-af aresample=async=1'
];
