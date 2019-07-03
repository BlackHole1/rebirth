import { IData } from './typing/background';
import { IAction } from './typing/rebirth';

window.rebirth = Object.create(null);

[ 'start', 'pause', 'resume', 'stop', 'fail' ].forEach((m: IAction) => {
  window.rebirth[m] = (fileName?: string) => {
    const msg: IData = {
      'action': m,
    };

    if (typeof fileName === 'string' && m === 'stop') {
      msg.fileName = fileName;
    }

    window.postMessage(msg, '*');
  };
});
