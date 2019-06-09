import { IS3UplodData } from '../typing/aws';
import { completeRecordTask } from './ajax';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const S3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: AWS_BUCKET
  }
});

const retryMap: { [key in string]: number } = {};

const uploadWebmToS3 = (blob: any, name: string, hash: string) => {
  const date = new Date();
  const path = `h5_outputs/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${name}.webm`;

  S3.upload({
    Key: path,
    Body: blob,
    Bucket: AWS_BUCKET,
    ContentType: 'video/webm'
  }, (err: Error, data: IS3UplodData) => {
    if (!err) {
      completeRecordTask(hash, data.Location);
      return;
    }

    if (retryMap[hash] === undefined) {
      retryMap[hash] = 0;
    }

    retryMap[hash] =+ 1;

    if (retryMap[hash] <= Number(UPLOAD_FAIL_RETRY_NUMBER)) {
      uploadWebmToS3(blob, name, hash);
    }
  });
};

export default uploadWebmToS3;
