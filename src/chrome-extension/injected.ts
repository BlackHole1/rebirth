import { IData } from './typing/background';
import { IAction } from './typing/rebirth';

window.rebirth = Object.create(null);

[ 'start', 'pause', 'resume', 'stop', 'fail' ].forEach((m: IAction) => {
  window.rebirth[m] = () => {
    const msg: IData = {
      'action': m,
    };

    window.postMessage(msg, '*');
  };
});
