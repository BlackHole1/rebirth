const mysqlService = require('../lib/mysql');
const utils =  require('../lib/utils');
const weblog = require('../lib/weblog');
const {
  setTaskStatusIsFail,
  setTaskStatusIsRecording,
  setTaskStatusIsComplete,
  setTaskStatusIsWaiting,
  setTaskStatusIsWaitingByPage,
} = require('../lib/SQLConstants');

// 把数据库操作进一步封装
const baseModel = (sql, sqlName) => {
  return mysqlService.getConnection()
    .then(async conn => {
      const result = await conn.query(sql);
      conn.release();

      weblog.sendLog(sqlName, {
        [sqlName]: utils.arrayToObject(result),
        SQLQuery: sql
      });
      return result;
    });
};

// 更新数据状态为录制失败
const recordFailModel = () => {
  return baseModel(setTaskStatusIsFail(), 'setTaskStatusIsFail');
};

// 更新数据状态为正在录制
const recordModel = () => {
  return baseModel(setTaskStatusIsRecording(), 'setTaskStatusIsRecording');
};

// 更新数据状态为录制完成
const completeModel = s3URL => {
  return baseModel(setTaskStatusIsComplete(s3URL), 'setTaskStatusIsComplete');
};

// 更新数据状态为等待录制(重录，非网页要求)
const waitingModel = () => {
  return baseModel(setTaskStatusIsWaiting(), 'setTaskStatusIsWaiting');
};

// 更新数据状态为等待录制(重录，由网页要求进行重新录制)
const waitingModelByPage = () => {
  return baseModel(setTaskStatusIsWaitingByPage(), 'setTaskStatusIsWaitingByPage');
};

module.exports.recordFailModel = recordFailModel;
module.exports.recordModel = recordModel;
module.exports.completeModel = completeModel;
module.exports.waitingModel = waitingModel;
module.exports.waitingModelByPage = waitingModelByPage;
