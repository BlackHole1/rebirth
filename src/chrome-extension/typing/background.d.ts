import { IAction, IActionHelper } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    getHash: string;
    action: IAction;
    mediaRecorder: MediaRecorder;
    width: number;
    height: number;
    fileName: string;
    subS3Key: string;
    generateFileList: Record<string, string>;
  }
}

export interface IData {
  action: IAction & IActionHelper;
  fileName?: string;
  content?: string;
  width?: number;
  height?: number;
}
