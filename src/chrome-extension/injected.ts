window.rebirth = Object.create(null);

[ 'pause', 'resume', 'fail' ].forEach((m) => {
  window.rebirth[m] = () => {
    const msg = {
      'action': m,
    };
    window.postMessage(msg, '*');
  };

  window.rebirth.start = () => {
    window.postMessage({
      action: 'start',
      width: document.documentElement.clientWidth,  // 不同的页面，其可是宽高是不同的，如果不做处理，会导致录制时出现黑边的情况
      height: document.documentElement.clientHeight
    }, '*');
  };

  window.rebirth.stop = (sourceFileName: string, partFileName: string) => {
    window.postMessage({
      action: 'stop',
      sourceFileName,
      partFileName
    }, '*');
  };

  window.rebirth.generateFile = (fileName: string, content: string) => {
    window.postMessage({
      action: 'generateFile',
      fileName,
      content
    }, '*');
  };
});
