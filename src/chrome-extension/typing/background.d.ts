import { IAction, IActionHelper } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    dbId: number;
    action: IAction;
    mediaRecorder: MediaRecorder;
    videoWidth: number;
    videoHeight: number;
    sourceFileName: string;
    partFileName: string;
    subS3Key: string;
    generateFileList: Record<string, string>;
  }
}

export interface IData {
  action: IAction | IActionHelper;
  sourceFileName?: string;
  partFileName?: string;
  fileName?: string;
  content?: string;
  pageWidth?: number;
  pageHeight?: number;
  videoWidth?: number;
  videoHeight?: number;
}
