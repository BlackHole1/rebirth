import { IData } from './typing/background';
import { IAction } from './typing/rebirth';

window.rebirth = Object.create(null);

[ 'start', 'pause', 'resume', 'stop', 'fail' ].forEach((m: IAction) => {
  window.rebirth[m] = (filename?: string) => {
    const msg: IData = {
      'action': m,
    };

    if (typeof filename === 'string' && m === 'start') {
      msg.filename = filename;
    }

    window.postMessage(msg, '*');
  };
});
