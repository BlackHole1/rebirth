import { IAction } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    getHash: string;
    action: IAction;
    mediaRecorder: MediaRecorder;
    width: number;
    height: number;
    fileName: string;
  }
}

export interface IData {
  action: IAction;
  fileName?: string;
}
