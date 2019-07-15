import { ITabs } from '../typing/background';
import { IAction } from '../typing/rebirth';
import { RecordNumber } from './constants';

class Tabs {
  private readonly tabs: ITabs;

  constructor () {
    this.tabs = Object.create(null);
  }

  getTab (id: number) {
    return this.tabs[id] || null;
  }

  getHash (id: number) {
    return (this.getTab(id) && this.getTab(id).getHash) ? this.getTab(id).getHash : null;
  }

  getMediaRecorder (id: number) {
    return (this.getTab(id) && this.getTab(id).mediaRecorder) ? this.getTab(id).mediaRecorder : null;
  }

  getWidth (id: number) {
    return (this.getTab(id) && this.getTab(id).width) ? this.getTab(id).width : 1920;
  }

  getHeight (id: number) {
    return (this.getTab(id) && this.getTab(id).height) ? this.getTab(id).height : 1080;
  }

  getSourceFileName (id: number) {
    return (this.getTab(id) && this.getTab(id).sourceFileName) ? this.getTab(id).sourceFileName : this.getHash(id);
  }

  getPartFileName (id: number) {
    return (this.getTab(id) && this.getTab(id).partFileName) ? this.getTab(id).partFileName : this.getHash(id);
  }

  getSubS3Key (id: number) {
    return (this.getTab(id) && this.getTab(id).subS3Key) ? this.getTab(id).subS3Key : this.getHash(id);
  }

  getFileList (id: number) {
    return (this.getTab(id) && this.getTab(id).generateFileList) ? this.getTab(id).generateFileList : {};
  }

  createTab (id: number) {
    this.tabs[id] = Object.create(null);
    this.tabs[id].generateFileList = {};
  }

  setHash (id: number, getHash: string) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    this.tabs[id].getHash = getHash;
  }

  setAction (id: number, action: IAction) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (action !== this.tabs[id].action) {
      this.tabs[id].action = action;
    }
  }

  setMediaRecorder (id: number, mediaRecorder: MediaRecorder) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    this.tabs[id].mediaRecorder = mediaRecorder;
  }

  setWidth (id: number, width: number) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (width !== this.tabs[id].width) {
      this.tabs[id].width = width;
    }
  }

  setHeight (id: number, height: number) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (height !== this.tabs[id].height) {
      this.tabs[id].height = height;
    }
  }

  setSourceFileName (id: number, sourceFileName: string) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (sourceFileName !== this.tabs[id].sourceFileName) {
      this.tabs[id].sourceFileName = sourceFileName;
    }
  }

  setPartFileName (id: number, partFileName: string) {
    if (this.getTab(id) === null) {
      this.createTab(id);
    }
    if (partFileName !== this.tabs[id].partFileName) {
      this.tabs[id].partFileName = partFileName;
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

    this.tabs[id].generateFileList[data.name] = data.content;
  }

  deleteTab (id: number) {
    delete this.tabs[id];
  }

  getFreeNumber () {
    return RecordNumber - (Object.keys(this.tabs).filter(tab => {
      return this.tabs[tab].action !== 'stop';
    }).length);
  }
}

const tabs = new Tabs();

// @ts-ignore
window.tabs = tabs;

export default tabs;
