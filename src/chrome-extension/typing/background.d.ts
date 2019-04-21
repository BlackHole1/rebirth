import { IAction } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    getHash: string;
    action: IAction;
    mediaRecorder: MediaRecorder;
  }
}

export interface IData {
  action: IAction;
  filename?: string;
}
