type rebirth = {
  [key: string]: (...args: any[]) => void;
  stop: ({ originFileName, transformFileName }: { transformFileName?: string; originFileName?: string }) => void
  generateFile: (fileName: string, content: string) => void;
  setVideoBounds: ({ width, height }: { width: number, height: number }) => void;
  getInfo: () => Record<string, any>;
};

interface Window {
  rebirth: rebirth
}

window.rebirth = {} as rebirth;

[ 'pause', 'resume', 'fail', 'init' ].forEach((m) => {
  window.rebirth[m] = () => {
    const msg = {
      'action': m,
    };
    window.postMessage(msg, '*');
  };
});

window.rebirth.start = () => {
  window.postMessage({
    action: 'start',
    pageWidth: document.documentElement.clientWidth,  // 不同的页面，其可是宽高是不同的，如果不做处理，会导致录制时出现黑边的情况
    pageHeight: document.documentElement.clientHeight
  }, '*');
};

window.rebirth.stop = ({ originFileName, transformFileName }: { originFileName: string; transformFileName?: string }) => {
  window.postMessage({
    action: 'stop',
    sourceFileName: originFileName,
    partFileName: transformFileName || ''
  }, '*');
};

window.rebirth.generateFile = (fileName: string, content: string) => {
  window.postMessage({
    action: 'generateFile',
    fileName,
    content
  }, '*');
};

window.rebirth.setVideoBounds = ({ width, height }) => {
  window.postMessage({
    action: 'setVideoBounds',
    videoWidth: width,
    videoHeight: height
  }, '*');
};

window.rebirth.getInfo = () => {
  const result = localStorage.getItem('rebirth-ready-info');

  try {
    return JSON.parse(result);
  } catch (e) {
    return {
      dbId: 0
    };
  }
};
