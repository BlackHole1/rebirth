import { ITabs } from '../typing/background';
import { IAction } from '../typing/rebirth';
import { RecordNumber } from './constants';
import { sendLog } from './ajax';
import { makeID } from './utils';

class Tabs {
  private readonly tabs: ITabs;

  constructor () {
    this.tabs = Object.create(null);
  }

  getTab (id: number) {
    return this.tabs[id] || null;
  }

  getDbId (id: number) {
    return (this.getTab(id) && this.getTab(id).dbId) ? this.getTab(id).dbId : 0;
  }

  getMediaRecorder (id: number) {
    return (this.getTab(id) && this.getTab(id).mediaRecorder) ? this.getTab(id).mediaRecorder : null;
  }

  getVideoWidth (id: number) {
    return (this.getTab(id) && this.getTab(id).videoWidth) ? this.getTab(id).videoWidth : 0;
  }

  getVideoHeight (id: number) {
    return (this.getTab(id) && this.getTab(id).videoHeight) ? this.getTab(id).videoHeight : 0;
  }

  getSourceFileName (id: number) {
    return (this.getTab(id) && this.getTab(id).sourceFileName) ? this.getTab(id).sourceFileName : 'sourceFileName_is_null';
  }

  getPartFileName (id: number) {
    return (this.getTab(id) && this.getTab(id).partFileName) ? this.getTab(id).partFileName : '';
  }

  getSubS3Key (id: number) {
    return (this.getTab(id) && this.getTab(id).subS3Key) ? this.getTab(id).subS3Key : 's3_key_is_null';
  }

  getFileList (id: number) {
    return (this.getTab(id) && this.getTab(id).generateFileList) ? this.getTab(id).generateFileList : {};
  }

  createTab (id: number) {
    this.tabs[id] = Object.create(null);
    this.tabs[id].generateFileList = {};
  }

  setDbId (id: number, dbId: number) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    this.tabs[id].dbId = dbId;
  }

  setAction (id: number, action: IAction) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (action !== this.tabs[id].action) {
      this.tabs[id].action = action;
    }

    sendLog('setAction', {
      actionName: action,
      dbId: this.getDbId(id),
    });
  }

  setMediaRecorder (id: number, mediaRecorder: MediaRecorder) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    this.tabs[id].mediaRecorder = mediaRecorder;
  }

  setVideoWidth (id: number, width: number) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (width !== this.tabs[id].videoWidth) {
      this.tabs[id].videoWidth = width;
    }
  }

  setVideoHeight (id: number, height: number) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (height !== this.tabs[id].videoHeight) {
      this.tabs[id].videoHeight = height;
    }
  }

  setSourceFileName (id: number, sourceFileName: string) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (sourceFileName !== this.tabs[id].sourceFileName) {
      this.tabs[id].sourceFileName = makeID(8) + sourceFileName;
    }
  }

  setPartFileName (id: number, partFileName: string) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (partFileName !== this.tabs[id].partFileName) {
      this.tabs[id].partFileName = partFileName ? makeID(8) + partFileName : '';
    }
  }

  setSubS3Key (id: number, subS3Key: string) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (subS3Key !== this.tabs[id].subS3Key) {
      this.tabs[id].subS3Key = subS3Key;
    }
  }

  addFile (id: number, data: Record<'name' | 'content', string>) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }

    this.tabs[id].generateFileList[makeID(8) + data.name] = data.content;
  }

  deleteTab (id: number) {
    delete this.tabs[id];
  }

  getFreeNumber () {
    const result = RecordNumber - (Object.keys(this.tabs).filter(tab => {
      return this.tabs[tab].action !== 'stop';
    }).length);

    sendLog('tabs.getFreeNumber', {
      freeNumber: result
    });

    return result;
  }
}

const tabs = new Tabs();

export default tabs;
