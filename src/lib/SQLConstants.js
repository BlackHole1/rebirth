const { MYSQL_TABLE, DB_ID } = require('./constants');

// 设置开始录制状态
module.exports.setTaskStatusIsRecording = () => {
  return `UPDATE ${MYSQL_TABLE} SET status='recording', updated_by='rebirth' WHERE id='${DB_ID}'`;
};

// 重新录制
module.exports.setTaskStatusIsWaiting = () => {
  return `UPDATE ${MYSQL_TABLE} SET status='waiting', updated_by='rebirth' WHERE id='${DB_ID}'`;
};

// 录制失败
module.exports.setTaskStatusIsFail = () => {
  return `UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE id='${DB_ID}'`;
};

// 完成录制
module.exports.setTaskStatusIsComplete = (s3URL) => {
  return `UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE id='${DB_ID}'`;
};
