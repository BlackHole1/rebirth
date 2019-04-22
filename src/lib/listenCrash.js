const http =  require('http');
const WebSocket = require('ws');
const servicesStatus =  require('./servicesStatus');

module.exports = () => {
  const wsList = {};
  let crashStaus = false;

  const getWsList = () => {
    return new Promise((resolve) => {
      http.get('http://127.0.0.1:9222/json', res => {
        res.addListener('data', data => {
          try {
            const result = JSON.parse(data.toString());
            const tempWsList = {};

            result.forEach(info => {
              if (typeof wsList[info.id] === 'undefined') {
                tempWsList[info.id] = info.webSocketDebuggerUrl;
                wsList[info.id] = info.webSocketDebuggerUrl;
              }
            });

            if (Object.keys(tempWsList).length !== 0) {
              resolve(tempWsList);
            }
          } catch (e) {
            console.error(e);
            servicesStatus.setChromeRemoteDebugError = true;
          }
        });
      });
    });
  };

  setInterval(() => {
    getWsList().then(list => {
      Object.values(list).forEach(wsUrl => {
        const client = new WebSocket(wsUrl);
        client.on('message', data => {
          if (data.indexOf('"method":"Inspector.targetCrashed"') !== -1) {
            if (!crashStaus) {
              crashStaus = true;
              servicesStatus.setChromeCrash = true;
              console.log('crash!!!');
            }
          }
        });
      })
    });
  }, 1000);
};

