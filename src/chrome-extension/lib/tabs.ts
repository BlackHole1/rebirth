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

  createTab (id: number) {
    this.tabs[id] = Object.create(null);
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
