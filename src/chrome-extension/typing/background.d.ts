import { IAction } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    getHash: string;
    action: IAction;
    mediaRecorder: MediaRecorder;
    width: number;
    height: number;
  }
}

export interface IData {
  action: IAction;
}
