import { IAction } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    getHash: string;
    action: IAction;
    mediaRecorder: MediaRecorder;
    width: number;
    height: number;
    fileName: string;
    subS3Key: string;
  }
}

export interface IData {
  action: IAction;
  fileName?: string;
}
