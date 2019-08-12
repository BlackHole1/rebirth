import { IAction, IActionHelper } from './rebirth';

export type ITabs = {
  [key in string | number]: {
    dbId: number; // 数据库的id主键
    action: IAction;  // 当前录制的状态
    mediaRecorder: MediaRecorder; // chrome录制的流对象
    videoWidth: number; // 最终要截取的视频宽
    videoHeight: number; // 最终要截取的视频高
    sourceFileName: string; // 原始视频的文件名
    partFileName: string; // 要分段的名字(aac、无声视频)
    generateFileList: Record<string, string>; // 消费者要生成的文件
    initTimeoutId: number;  // 多少分钟内必须调用init接口
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
