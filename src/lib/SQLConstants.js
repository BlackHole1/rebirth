const { MYSQL_TABLE } = require('./constants');

// 获取要录制的任务
module.exports.getTasks = (num) => {
  return `SELECT t.* FROM ${MYSQL_TABLE} t WHERE status='waiting' and deleted=0 LIMIT ${num}`;
};

// 设置开始录制状态
module.exports.setTaskStatusIsRecording = (idList) => {
  return `UPDATE ${MYSQL_TABLE} SET status='recording' WHERE id in (${idList})`;
};

// 重新录制
module.exports.setTaskStatusIsWaiting = (idList) => {
  return `UPDATE ${MYSQL_TABLE} SET status='waiting' WHERE id in (${idList})`;
};

// 录制失败
module.exports.setTaskStatusIsFail = (id) => {
  return `UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE id='${id}'`;
};

// 完成录制
module.exports.setTaskStatusIsComplete = (s3URL, dbId) => {
  return `UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE id='${dbId}' and merge_result_url is null`;
};
