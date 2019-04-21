const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');

// 完成录制（删除数据）
const completeRecordTask = (req, res) => {
  const { hash } = req.query;
  mysqlService.then(async conn => {
    const result = await conn.query('DELETE FROM record WHERE hash=?', [ hash ]);
    recordTasks.completeTask = hash;
    res.sendJson(result);
  }).catch(e => {
    res.sendError(
      'delete fail',
      e,
      `DELETE FROM record WHERE hash=${hash}`
    );
  });
};

module.exports = completeRecordTask;
