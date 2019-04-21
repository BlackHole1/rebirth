// 向服务获取要录制的网站
export const getRecordTasks = (num: number) => {
  return new Promise((resolve, reject) => {
    fetch(`${SERVER_URL}/getRecord?num=${num}`)
      .then(async resp => {
        const data = await resp.json();
        return resp.ok ? resolve(data) : reject(data);
      })
      .catch(e => reject(e));
  });
};

// 完成录制
export const completeRecordTask = (hash: string) => {
  fetch(`${SERVER_URL}/completeRecordTask?hash=${hash}`)
    .catch(() => {});
};
