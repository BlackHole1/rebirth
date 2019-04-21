/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./chrome-extension/background.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./chrome-extension/background.ts":
/*!****************************************!*\
  !*** ./chrome-extension/background.ts ***!
  \****************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_ajax__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/ajax */ "./chrome-extension/lib/ajax.ts");
/* harmony import */ var _lib_tabs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/tabs */ "./chrome-extension/lib/tabs.ts");
/* harmony import */ var _lib_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/constants */ "./chrome-extension/lib/constants.ts");
/* harmony import */ var _lib_recordingQueue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/recordingQueue */ "./chrome-extension/lib/recordingQueue.ts");
/* harmony import */ var _lib_recording__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lib/recording */ "./chrome-extension/lib/recording.ts");





// 获取需要录制的网站以及打开
const getRecordTasksAndStartTab = (num = _lib_constants__WEBPACK_IMPORTED_MODULE_2__["RecordNumber"]) => {
    Object(_lib_ajax__WEBPACK_IMPORTED_MODULE_0__["getRecordTasks"])(num)
        .then((data) => {
        if (data.length === 0) {
            return;
        }
        data.forEach(record => {
            chrome.tabs.create({
                url: record.url
            }, tab => {
                const id = tab.id;
                _lib_tabs__WEBPACK_IMPORTED_MODULE_1__["default"].setAction(id, 'waiting');
                _lib_tabs__WEBPACK_IMPORTED_MODULE_1__["default"].setHash(id, record.hash);
            });
        });
    })
        .catch(e => {
        console.error(e);
    });
};
// 在运行的时候先执行一次
getRecordTasksAndStartTab();
// 每隔3分钟请求一次
setInterval(() => {
    const getFreeNumber = _lib_tabs__WEBPACK_IMPORTED_MODULE_1__["default"].getFreeNumber();
    if (getFreeNumber === 0)
        return;
    getRecordTasksAndStartTab(getFreeNumber);
}, 1000 * 60 * 3);
// 监听网页消息
chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener((data) => {
        if (['start', 'pause', 'resume', 'stop'].includes(data.action)) {
            const fun = () => {
                const currentTabId = port.sender.tab.id;
                const lastParams = data.action === 'start' ? data.filename : _lib_tabs__WEBPACK_IMPORTED_MODULE_1__["default"].getMediaRecorder(currentTabId);
                _lib_recording__WEBPACK_IMPORTED_MODULE_4__["default"][data.action](currentTabId, lastParams);
            };
            // 如果队列为空，则直接运行
            if (_lib_recordingQueue__WEBPACK_IMPORTED_MODULE_3__["default"].isEmpty()) {
                fun();
            }
            else {
                // 加入录屏队列，等待上一次录屏开始后，在被运行
                _lib_recordingQueue__WEBPACK_IMPORTED_MODULE_3__["default"].enqueue(fun);
            }
        }
    });
});


/***/ }),

/***/ "./chrome-extension/lib/ajax.ts":
/*!**************************************!*\
  !*** ./chrome-extension/lib/ajax.ts ***!
  \**************************************/
/*! exports provided: getRecordTasks, completeRecordTask */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRecordTasks", function() { return getRecordTasks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "completeRecordTask", function() { return completeRecordTask; });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 向服务获取要录制的网站
const getRecordTasks = (num) => {
    return new Promise((resolve, reject) => {
        fetch(`${"http://127.0.0.1"}/getRecord?num=${num}`)
            .then((resp) => __awaiter(undefined, void 0, void 0, function* () {
            const data = yield resp.json();
            return resp.ok ? resolve(data) : reject(data);
        }))
            .catch(e => reject(e));
    });
};
// 完成录制
const completeRecordTask = (hash) => {
    fetch(`${"http://127.0.0.1"}/completeRecordTask?hash=${hash}`)
        .catch(() => { });
};


/***/ }),

/***/ "./chrome-extension/lib/config.ts":
/*!****************************************!*\
  !*** ./chrome-extension/lib/config.ts ***!
  \****************************************/
/*! exports provided: captureConfig, mediaRecorderOptions, blobOptions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "captureConfig", function() { return captureConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mediaRecorderOptions", function() { return mediaRecorderOptions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blobOptions", function() { return blobOptions; });
// 录制配置
const captureConfig = {
    video: true,
    audio: true,
    videoConstraints: {
        mandatory: {
            minWidth: 1920,
            minHeight: 1080,
            maxWidth: 1920,
            maxHeight: 1080,
            maxFrameRate: 30,
            minFrameRate: 30,
        }
    }
};
// mediaRecorder配置
const mediaRecorderOptions = {
    videoBitsPerSecond: 2500000,
    mimeType: 'video/webm;codecs=vp9'
};
// Blob配置
const blobOptions = {
    type: 'video/webm'
};


/***/ }),

/***/ "./chrome-extension/lib/constants.ts":
/*!*******************************************!*\
  !*** ./chrome-extension/lib/constants.ts ***!
  \*******************************************/
/*! exports provided: RecordNumber */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RecordNumber", function() { return RecordNumber; });
const RecordNumber = 10;


/***/ }),

/***/ "./chrome-extension/lib/recording.ts":
/*!*******************************************!*\
  !*** ./chrome-extension/lib/recording.ts ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tabs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tabs */ "./chrome-extension/lib/tabs.ts");
/* harmony import */ var _recordingQueue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./recordingQueue */ "./chrome-extension/lib/recordingQueue.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config */ "./chrome-extension/lib/config.ts");
/* harmony import */ var _ajax__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ajax */ "./chrome-extension/lib/ajax.ts");




// 开始录屏
const start = (id, filename) => {
    _tabs__WEBPACK_IMPORTED_MODULE_0__["default"].setAction(id, 'start');
    // 切换标签到触发start动作的标签页，因为tabCapture.capture是在当前Tab触发
    chrome.tabs.update(id, {
        active: true
    });
    // 开始进行录屏，加上ts-ignore，是因为@types/chrome package还没更新，导致其类型是错误的
    // @ts-ignore
    chrome.tabCapture.capture(_config__WEBPACK_IMPORTED_MODULE_2__["captureConfig"], stream => {
        _recordingQueue__WEBPACK_IMPORTED_MODULE_1__["default"].complete();
        if (stream === null) {
            chrome.tabs.sendMessage(id, {
                error: chrome.runtime.lastError
            });
            return false;
        }
        const recordedBlobs = [];
        const mediaRecorder = new MediaRecorder(stream, _config__WEBPACK_IMPORTED_MODULE_2__["mediaRecorderOptions"]);
        mediaRecorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        };
        mediaRecorder.onstop = () => {
            const superBuffer = new Blob(recordedBlobs, _config__WEBPACK_IMPORTED_MODULE_2__["blobOptions"]);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(superBuffer);
            link.setAttribute('download', `${filename}.webm`);
            link.click();
            setTimeout(() => {
                chrome.tabs.remove(id);
            }, 2000);
        };
        _tabs__WEBPACK_IMPORTED_MODULE_0__["default"].setMediaRecorder(id, mediaRecorder);
        mediaRecorder.start();
    });
};
// 暂停录屏
const pause = (id, mediaRecorder) => {
    _tabs__WEBPACK_IMPORTED_MODULE_0__["default"].setAction(id, 'pause');
    mediaRecorder.pause();
};
// 恢复录屏
const resume = (id, mediaRecorder) => {
    _tabs__WEBPACK_IMPORTED_MODULE_0__["default"].setAction(id, 'resume');
    mediaRecorder.resume();
};
// 停止录屏，停止后的下载操作在start方法里
const stop = (id, mediaRecorder) => {
    _tabs__WEBPACK_IMPORTED_MODULE_0__["default"].setAction(id, 'stop');
    Object(_ajax__WEBPACK_IMPORTED_MODULE_3__["completeRecordTask"])(_tabs__WEBPACK_IMPORTED_MODULE_0__["default"].getHash(id));
    mediaRecorder.stop();
    // mediaRecorder.stop()只是停止录制，但是其stream还没有被关闭，所以需要获取其录制的所有stream，并逐个关闭
    mediaRecorder.stream.getTracks().forEach(track => {
        track.stop();
    });
};
const actions = {
    start,
    pause,
    resume,
    stop
};
/* harmony default export */ __webpack_exports__["default"] = (actions);


/***/ }),

/***/ "./chrome-extension/lib/recordingQueue.ts":
/*!************************************************!*\
  !*** ./chrome-extension/lib/recordingQueue.ts ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class RecordingQueue {
    constructor() {
        this.queue = [];
    }
    enqueue(fun) {
        this.queue.push(fun);
    }
    dequeue() {
        this.queue.shift();
    }
    front() {
        return this.queue[0];
    }
    complete() {
        this.dequeue();
        this.isEmpty() || this.front();
    }
    remove() {
        this.queue = [];
    }
    length() {
        return this.queue.length;
    }
    isEmpty() {
        return this.length() === 0;
    }
}
/* harmony default export */ __webpack_exports__["default"] = (new RecordingQueue());


/***/ }),

/***/ "./chrome-extension/lib/tabs.ts":
/*!**************************************!*\
  !*** ./chrome-extension/lib/tabs.ts ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./chrome-extension/lib/constants.ts");

class Tabs {
    constructor() {
        this.tabs = Object.create(null);
    }
    getTab(id) {
        return this.tabs[id] || null;
    }
    getHash(id) {
        return (this.getTab(id) && this.getTab(id).getHash) ? this.getTab(id).getHash : null;
    }
    getAction(id) {
        return (this.getTab(id) && this.getTab(id).action) ? this.getTab(id).action : null;
    }
    getMediaRecorder(id) {
        return (this.getTab(id) && this.getTab(id).mediaRecorder) ? this.getTab(id).mediaRecorder : null;
    }
    createTab(id) {
        this.tabs[id] = Object.create(null);
    }
    setHash(id, getHash) {
        if (this.getTab(id) === null) {
            this.createTab(id);
        }
        this.tabs[id].getHash = getHash;
    }
    setAction(id, action) {
        if (this.getTab(id) === null) {
            this.createTab(id);
        }
        if (action !== this.tabs[id].action) {
            this.tabs[id].action = action;
        }
    }
    setMediaRecorder(id, mediaRecorder) {
        if (this.getTab(id) === null) {
            this.createTab(id);
        }
        this.tabs[id].mediaRecorder = mediaRecorder;
    }
    isWaiting(id) {
        return this.getAction(id) === 'waiting';
    }
    isStart(id) {
        return this.getAction(id) === 'start';
    }
    isPause(id) {
        return this.getAction(id) === 'pause';
    }
    isResume(id) {
        return this.getAction(id) === 'resume';
    }
    isStop(id) {
        return this.getAction(id) === 'stop';
    }
    deleteTab(id) {
        delete this.tabs[id];
    }
    getFreeNumber() {
        return _constants__WEBPACK_IMPORTED_MODULE_0__["RecordNumber"] - (Object.keys(this.tabs).filter(tab => {
            return this.tabs[tab].action !== 'stop';
        }).length);
    }
}
const tabs = new Tabs();
// @ts-ignore
window.tabs = tabs;
/* harmony default export */ __webpack_exports__["default"] = (tabs);


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9iYWNrZ3JvdW5kLnRzIiwid2VicGFjazovLy8uL2Nocm9tZS1leHRlbnNpb24vbGliL2FqYXgudHMiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9saWIvY29uZmlnLnRzIiwid2VicGFjazovLy8uL2Nocm9tZS1leHRlbnNpb24vbGliL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly8vLi9jaHJvbWUtZXh0ZW5zaW9uL2xpYi9yZWNvcmRpbmcudHMiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9saWIvcmVjb3JkaW5nUXVldWUudHMiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9saWIvdGFicy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBeUMsaUNBQWlDO0FBQzFFLHdIQUFnSCxtQkFBbUIsRUFBRTtBQUNySTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE0QztBQUVkO0FBQ2lCO0FBQ0c7QUFDWjtBQUd0QyxnQkFBZ0I7QUFDaEIsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLE1BQWMsMkRBQVksRUFBRSxFQUFFO0lBQy9ELGdFQUFjLENBQUMsR0FBRyxDQUFDO1NBQ2hCLElBQUksQ0FBQyxDQUFDLElBQWEsRUFBRSxFQUFFO1FBQ3RCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDakIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO2FBQ2hCLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsaURBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QixpREFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsY0FBYztBQUNkLHlCQUF5QixFQUFFLENBQUM7QUFFNUIsWUFBWTtBQUNaLFdBQVcsQ0FBQyxHQUFHLEVBQUU7SUFDZixNQUFNLGFBQWEsR0FBRyxpREFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRTNDLElBQUksYUFBYSxLQUFLLENBQUM7UUFBRSxPQUFPO0lBQ2hDLHlCQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzNDLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRWxCLFNBQVM7QUFDVCxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFXLEVBQUUsRUFBRTtRQUN6QyxJQUFJLENBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNoRSxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUU7Z0JBQ2YsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsaURBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDakcsc0RBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQztZQUVGLGVBQWU7WUFDZixJQUFJLDJEQUFjLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzVCLEdBQUcsRUFBRSxDQUFDO2FBQ1A7aUJBQU07Z0JBQ0wseUJBQXlCO2dCQUN6QiwyREFBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM3QjtTQUNGO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN0RILGNBQWM7QUFDUCxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFO0lBQzVDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsS0FBSyxDQUFDLEdBQUcsa0JBQVUsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO2FBQ3hDLElBQUksQ0FBQyxDQUFNLElBQUksRUFBQyxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxFQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixPQUFPO0FBQ0EsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ2pELEtBQUssQ0FBQyxHQUFHLGtCQUFVLDRCQUE0QixJQUFJLEVBQUUsQ0FBQztTQUNuRCxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FDaEJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBTztBQUNBLE1BQU0sYUFBYSxHQUFHO0lBQzNCLEtBQUssRUFBRSxJQUFJO0lBQ1gsS0FBSyxFQUFFLElBQUk7SUFDWCxnQkFBZ0IsRUFBRTtRQUNoQixTQUFTLEVBQUU7WUFDVCxRQUFRLEVBQUUsSUFBSTtZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxTQUFTLEVBQUUsSUFBSTtZQUNmLFlBQVksRUFBRSxFQUFFO1lBQ2hCLFlBQVksRUFBRSxFQUFFO1NBQ2pCO0tBQ0Y7Q0FDRixDQUFDO0FBRUYsa0JBQWtCO0FBQ1gsTUFBTSxvQkFBb0IsR0FBRztJQUNsQyxrQkFBa0IsRUFBRSxPQUFPO0lBQzNCLFFBQVEsRUFBRSx1QkFBdUI7Q0FDbEMsQ0FBQztBQUVGLFNBQVM7QUFDRixNQUFNLFdBQVcsR0FBRztJQUN6QixJQUFJLEVBQUUsWUFBWTtDQUNuQixDQUFDOzs7Ozs7Ozs7Ozs7O0FDekJGO0FBQUE7QUFBTyxNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNBL0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUEwQjtBQUNvQjtBQUM4QjtBQUNoQztBQUU1QyxPQUFPO0FBQ1AsTUFBTSxLQUFLLEdBQUcsQ0FBQyxFQUFVLEVBQUUsUUFBZ0IsRUFBUSxFQUFFO0lBQ25ELDZDQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUU1QixtREFBbUQ7SUFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO1FBQ3JCLE1BQU0sRUFBRSxJQUFJO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsNERBQTREO0lBQzVELGFBQWE7SUFDYixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxxREFBYSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ2hELHVEQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUIsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRTtnQkFDMUIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUzthQUNoQyxDQUFDLENBQUM7WUFDSCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxhQUFhLEdBQWUsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSw0REFBb0IsQ0FBQyxDQUFDO1FBRXRFLGFBQWEsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLEVBQUU7WUFDdEMsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtnQkFDckMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEM7UUFDSCxDQUFDLENBQUM7UUFFRixhQUFhLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtZQUMxQixNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsbURBQVcsQ0FBQyxDQUFDO1lBRXpELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEdBQUcsUUFBUSxPQUFPLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFYixVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQztRQUVGLDZDQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLE9BQU87QUFDUCxNQUFNLEtBQUssR0FBRyxDQUFDLEVBQVUsRUFBRSxhQUE0QixFQUFRLEVBQUU7SUFDL0QsNkNBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN4QixDQUFDLENBQUM7QUFFRixPQUFPO0FBQ1AsTUFBTSxNQUFNLEdBQUcsQ0FBQyxFQUFVLEVBQUUsYUFBNEIsRUFBUSxFQUFFO0lBQ2hFLDZDQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsQ0FBQyxDQUFDO0FBRUYseUJBQXlCO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLENBQUMsRUFBVSxFQUFFLGFBQTRCLEVBQVEsRUFBRTtJQUM5RCw2Q0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsZ0VBQWtCLENBQUMsNkNBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFckIsc0VBQXNFO0lBQ3RFLGFBQWEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQy9DLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQWlDO0lBQzVDLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLElBQUk7Q0FDTCxDQUFDO0FBRWEsc0VBQU8sRUFBQzs7Ozs7Ozs7Ozs7OztBQ25GdkI7QUFBQSxNQUFNLGNBQWM7SUFFbEI7UUFDRSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsT0FBTyxDQUFFLEdBQWE7UUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUMzQixDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUFFYyxtRUFBSSxjQUFjLEVBQUUsRUFBQzs7Ozs7Ozs7Ozs7OztBQ2xDcEM7QUFBQTtBQUEyQztBQUUzQyxNQUFNLElBQUk7SUFHUjtRQUNFLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsTUFBTSxDQUFFLEVBQVU7UUFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUMvQixDQUFDO0lBRUQsT0FBTyxDQUFFLEVBQVU7UUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN2RixDQUFDO0lBRUQsU0FBUyxDQUFFLEVBQVU7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNyRixDQUFDO0lBRUQsZ0JBQWdCLENBQUUsRUFBVTtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ25HLENBQUM7SUFFRCxTQUFTLENBQUUsRUFBVTtRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELE9BQU8sQ0FBRSxFQUFVLEVBQUUsT0FBZTtRQUNsQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDcEI7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDbEMsQ0FBQztJQUVELFNBQVMsQ0FBRSxFQUFVLEVBQUUsTUFBZTtRQUNwQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDcEI7UUFDRCxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCLENBQUUsRUFBVSxFQUFFLGFBQTRCO1FBQ3hELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwQjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUM5QyxDQUFDO0lBRUQsU0FBUyxDQUFFLEVBQVU7UUFDbkIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFNBQVMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsT0FBTyxDQUFFLEVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sQ0FBQztJQUN4QyxDQUFDO0lBRUQsT0FBTyxDQUFFLEVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sQ0FBQztJQUN4QyxDQUFDO0lBRUQsUUFBUSxDQUFFLEVBQVU7UUFDbEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQztJQUN6QyxDQUFDO0lBRUQsTUFBTSxDQUFFLEVBQVU7UUFDaEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE1BQU0sQ0FBQztJQUN2QyxDQUFDO0lBRUQsU0FBUyxDQUFFLEVBQVU7UUFDbkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyx1REFBWSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3pELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztDQUNGO0FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUV4QixhQUFhO0FBQ2IsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFFSixtRUFBSSxFQUFDIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2Nocm9tZS1leHRlbnNpb24vYmFja2dyb3VuZC50c1wiKTtcbiIsImltcG9ydCB7IGdldFJlY29yZFRhc2tzIH0gZnJvbSAnLi9saWIvYWpheCc7XG5pbXBvcnQgeyBJUmVjb3JkIH0gZnJvbSAnLi90eXBpbmcvcmVxdWVzdCc7XG5pbXBvcnQgdGFicyBmcm9tICcuL2xpYi90YWJzJztcbmltcG9ydCB7IFJlY29yZE51bWJlciB9IGZyb20gJy4vbGliL2NvbnN0YW50cyc7XG5pbXBvcnQgcmVjb3JkaW5nUXVldWUgZnJvbSAnLi9saWIvcmVjb3JkaW5nUXVldWUnO1xuaW1wb3J0IGFjdGlvbnMgZnJvbSAnLi9saWIvcmVjb3JkaW5nJztcbmltcG9ydCB7IElEYXRhIH0gZnJvbSAnLi90eXBpbmcvYmFja2dyb3VuZCc7XG5cbi8vIOiOt+WPlumcgOimgeW9leWItueahOe9keermeS7peWPiuaJk+W8gFxuY29uc3QgZ2V0UmVjb3JkVGFza3NBbmRTdGFydFRhYiA9IChudW06IG51bWJlciA9IFJlY29yZE51bWJlcikgPT4ge1xuICBnZXRSZWNvcmRUYXNrcyhudW0pXG4gICAgLnRoZW4oKGRhdGE6IElSZWNvcmQpID0+IHtcbiAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGRhdGEuZm9yRWFjaChyZWNvcmQgPT4ge1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICAgIHVybDogcmVjb3JkLnVybFxuICAgICAgICB9LCB0YWIgPT4ge1xuICAgICAgICAgIGNvbnN0IGlkID0gdGFiLmlkO1xuICAgICAgICAgIHRhYnMuc2V0QWN0aW9uKGlkLCAnd2FpdGluZycpO1xuICAgICAgICAgIHRhYnMuc2V0SGFzaChpZCwgcmVjb3JkLmhhc2gpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9KTtcbn07XG5cbi8vIOWcqOi/kOihjOeahOaXtuWAmeWFiOaJp+ihjOS4gOasoVxuZ2V0UmVjb3JkVGFza3NBbmRTdGFydFRhYigpO1xuXG4vLyDmr4/pmpQz5YiG6ZKf6K+35rGC5LiA5qyhXG5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gIGNvbnN0IGdldEZyZWVOdW1iZXIgPSB0YWJzLmdldEZyZWVOdW1iZXIoKTtcblxuICBpZiAoZ2V0RnJlZU51bWJlciA9PT0gMCkgcmV0dXJuO1xuICBnZXRSZWNvcmRUYXNrc0FuZFN0YXJ0VGFiKGdldEZyZWVOdW1iZXIpO1xufSwgMTAwMCAqIDYwICogMyk7XG5cbi8vIOebkeWQrOe9kemhtea2iOaBr1xuY2hyb21lLnJ1bnRpbWUub25Db25uZWN0LmFkZExpc3RlbmVyKHBvcnQgPT4ge1xuICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigoZGF0YTogSURhdGEpID0+IHtcbiAgICBpZiAoWyAnc3RhcnQnLCAncGF1c2UnLCAncmVzdW1lJywgJ3N0b3AnIF0uaW5jbHVkZXMoZGF0YS5hY3Rpb24pKSB7XG4gICAgICBjb25zdCBmdW4gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUYWJJZCA9IHBvcnQuc2VuZGVyLnRhYi5pZDtcbiAgICAgICAgY29uc3QgbGFzdFBhcmFtcyA9IGRhdGEuYWN0aW9uID09PSAnc3RhcnQnID8gZGF0YS5maWxlbmFtZSA6IHRhYnMuZ2V0TWVkaWFSZWNvcmRlcihjdXJyZW50VGFiSWQpO1xuICAgICAgICBhY3Rpb25zW2RhdGEuYWN0aW9uXShjdXJyZW50VGFiSWQsIGxhc3RQYXJhbXMpO1xuICAgICAgfTtcblxuICAgICAgLy8g5aaC5p6c6Zif5YiX5Li656m677yM5YiZ55u05o6l6L+Q6KGMXG4gICAgICBpZiAocmVjb3JkaW5nUXVldWUuaXNFbXB0eSgpKSB7XG4gICAgICAgIGZ1bigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5Yqg5YWl5b2V5bGP6Zif5YiX77yM562J5b6F5LiK5LiA5qyh5b2V5bGP5byA5aeL5ZCO77yM5Zyo6KKr6L+Q6KGMXG4gICAgICAgIHJlY29yZGluZ1F1ZXVlLmVucXVldWUoZnVuKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG4iLCIvLyDlkJHmnI3liqHojrflj5bopoHlvZXliLbnmoTnvZHnq5lcbmV4cG9ydCBjb25zdCBnZXRSZWNvcmRUYXNrcyA9IChudW06IG51bWJlcikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGZldGNoKGAke1NFUlZFUl9VUkx9L2dldFJlY29yZD9udW09JHtudW19YClcbiAgICAgIC50aGVuKGFzeW5jIHJlc3AgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICAgIHJldHVybiByZXNwLm9rID8gcmVzb2x2ZShkYXRhKSA6IHJlamVjdChkYXRhKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZSA9PiByZWplY3QoZSkpO1xuICB9KTtcbn07XG5cbi8vIOWujOaIkOW9leWItlxuZXhwb3J0IGNvbnN0IGNvbXBsZXRlUmVjb3JkVGFzayA9IChoYXNoOiBzdHJpbmcpID0+IHtcbiAgZmV0Y2goYCR7U0VSVkVSX1VSTH0vY29tcGxldGVSZWNvcmRUYXNrP2hhc2g9JHtoYXNofWApXG4gICAgLmNhdGNoKCgpID0+IHt9KTtcbn07XG4iLCIvLyDlvZXliLbphY3nva5cbmV4cG9ydCBjb25zdCBjYXB0dXJlQ29uZmlnID0ge1xuICB2aWRlbzogdHJ1ZSxcbiAgYXVkaW86IHRydWUsXG4gIHZpZGVvQ29uc3RyYWludHM6IHtcbiAgICBtYW5kYXRvcnk6IHtcbiAgICAgIG1pbldpZHRoOiAxOTIwLFxuICAgICAgbWluSGVpZ2h0OiAxMDgwLFxuICAgICAgbWF4V2lkdGg6IDE5MjAsXG4gICAgICBtYXhIZWlnaHQ6IDEwODAsXG4gICAgICBtYXhGcmFtZVJhdGU6IDMwLFxuICAgICAgbWluRnJhbWVSYXRlOiAzMCxcbiAgICB9XG4gIH1cbn07XG5cbi8vIG1lZGlhUmVjb3JkZXLphY3nva5cbmV4cG9ydCBjb25zdCBtZWRpYVJlY29yZGVyT3B0aW9ucyA9IHtcbiAgdmlkZW9CaXRzUGVyU2Vjb25kOiAyNTAwMDAwLFxuICBtaW1lVHlwZTogJ3ZpZGVvL3dlYm07Y29kZWNzPXZwOSdcbn07XG5cbi8vIEJsb2LphY3nva5cbmV4cG9ydCBjb25zdCBibG9iT3B0aW9ucyA9IHtcbiAgdHlwZTogJ3ZpZGVvL3dlYm0nXG59O1xuIiwiZXhwb3J0IGNvbnN0IFJlY29yZE51bWJlciA9IDEwO1xuIiwiaW1wb3J0IHRhYnMgZnJvbSAnLi90YWJzJztcbmltcG9ydCByZWNvcmRpbmdRdWV1ZSBmcm9tICcuL3JlY29yZGluZ1F1ZXVlJztcbmltcG9ydCB7IGNhcHR1cmVDb25maWcsIG1lZGlhUmVjb3JkZXJPcHRpb25zLCBibG9iT3B0aW9ucyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IGNvbXBsZXRlUmVjb3JkVGFzayB9IGZyb20gJy4vYWpheCc7XG5cbi8vIOW8gOWni+W9leWxj1xuY29uc3Qgc3RhcnQgPSAoaWQ6IG51bWJlciwgZmlsZW5hbWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICB0YWJzLnNldEFjdGlvbihpZCwgJ3N0YXJ0Jyk7XG5cbiAgLy8g5YiH5o2i5qCH562+5Yiw6Kem5Y+Rc3RhcnTliqjkvZznmoTmoIfnrb7pobXvvIzlm6DkuLp0YWJDYXB0dXJlLmNhcHR1cmXmmK/lnKjlvZPliY1UYWLop6blj5FcbiAgY2hyb21lLnRhYnMudXBkYXRlKGlkLCB7XG4gICAgYWN0aXZlOiB0cnVlXG4gIH0pO1xuXG4gIC8vIOW8gOWni+i/m+ihjOW9leWxj++8jOWKoOS4inRzLWlnbm9yZe+8jOaYr+WboOS4ukB0eXBlcy9jaHJvbWUgcGFja2FnZei/mOayoeabtOaWsO+8jOWvvOiHtOWFtuexu+Wei+aYr+mUmeivr+eahFxuICAvLyBAdHMtaWdub3JlXG4gIGNocm9tZS50YWJDYXB0dXJlLmNhcHR1cmUoY2FwdHVyZUNvbmZpZywgc3RyZWFtID0+IHtcbiAgICByZWNvcmRpbmdRdWV1ZS5jb21wbGV0ZSgpO1xuICAgIGlmIChzdHJlYW0gPT09IG51bGwpIHtcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGlkLCB7XG4gICAgICAgIGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZGVkQmxvYnM6IEJsb2JQYXJ0W10gPSBbXTtcbiAgICBjb25zdCBtZWRpYVJlY29yZGVyID0gbmV3IE1lZGlhUmVjb3JkZXIoc3RyZWFtLCBtZWRpYVJlY29yZGVyT3B0aW9ucyk7XG5cbiAgICBtZWRpYVJlY29yZGVyLm9uZGF0YWF2YWlsYWJsZSA9IGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhICYmIGV2ZW50LmRhdGEuc2l6ZSA+IDApIHtcbiAgICAgICAgcmVjb3JkZWRCbG9icy5wdXNoKGV2ZW50LmRhdGEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBtZWRpYVJlY29yZGVyLm9uc3RvcCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHN1cGVyQnVmZmVyID0gbmV3IEJsb2IocmVjb3JkZWRCbG9icywgYmxvYk9wdGlvbnMpO1xuXG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgbGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdXBlckJ1ZmZlcik7XG4gICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBgJHtmaWxlbmFtZX0ud2VibWApO1xuICAgICAgbGluay5jbGljaygpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMucmVtb3ZlKGlkKTtcbiAgICAgIH0sIDIwMDApO1xuICAgIH07XG5cbiAgICB0YWJzLnNldE1lZGlhUmVjb3JkZXIoaWQsIG1lZGlhUmVjb3JkZXIpO1xuICAgIG1lZGlhUmVjb3JkZXIuc3RhcnQoKTtcbiAgfSk7XG59O1xuXG4vLyDmmoLlgZzlvZXlsY9cbmNvbnN0IHBhdXNlID0gKGlkOiBudW1iZXIsIG1lZGlhUmVjb3JkZXI6IE1lZGlhUmVjb3JkZXIpOiB2b2lkID0+IHtcbiAgdGFicy5zZXRBY3Rpb24oaWQsICdwYXVzZScpO1xuICBtZWRpYVJlY29yZGVyLnBhdXNlKCk7XG59O1xuXG4vLyDmgaLlpI3lvZXlsY9cbmNvbnN0IHJlc3VtZSA9IChpZDogbnVtYmVyLCBtZWRpYVJlY29yZGVyOiBNZWRpYVJlY29yZGVyKTogdm9pZCA9PiB7XG4gIHRhYnMuc2V0QWN0aW9uKGlkLCAncmVzdW1lJyk7XG4gIG1lZGlhUmVjb3JkZXIucmVzdW1lKCk7XG59O1xuXG4vLyDlgZzmraLlvZXlsY/vvIzlgZzmraLlkI7nmoTkuIvovb3mk43kvZzlnKhzdGFydOaWueazlemHjFxuY29uc3Qgc3RvcCA9IChpZDogbnVtYmVyLCBtZWRpYVJlY29yZGVyOiBNZWRpYVJlY29yZGVyKTogdm9pZCA9PiB7XG4gIHRhYnMuc2V0QWN0aW9uKGlkLCAnc3RvcCcpO1xuICBjb21wbGV0ZVJlY29yZFRhc2sodGFicy5nZXRIYXNoKGlkKSk7XG4gIG1lZGlhUmVjb3JkZXIuc3RvcCgpO1xuXG4gIC8vIG1lZGlhUmVjb3JkZXIuc3RvcCgp5Y+q5piv5YGc5q2i5b2V5Yi277yM5L2G5piv5YW2c3RyZWFt6L+Y5rKh5pyJ6KKr5YWz6Zet77yM5omA5Lul6ZyA6KaB6I635Y+W5YW25b2V5Yi255qE5omA5pyJc3RyZWFt77yM5bm26YCQ5Liq5YWz6ZetXG4gIG1lZGlhUmVjb3JkZXIuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godHJhY2sgPT4ge1xuICAgIHRyYWNrLnN0b3AoKTtcbiAgfSk7XG59O1xuXG5jb25zdCBhY3Rpb25zOiB7IFtrZXlzOiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge1xuICBzdGFydCxcbiAgcGF1c2UsXG4gIHJlc3VtZSxcbiAgc3RvcFxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWN0aW9ucztcbiIsImNsYXNzIFJlY29yZGluZ1F1ZXVlIHtcbiAgcHJpdmF0ZSBxdWV1ZTogRnVuY3Rpb25bXTtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgfVxuXG4gIGVucXVldWUgKGZ1bjogRnVuY3Rpb24pIHtcbiAgICB0aGlzLnF1ZXVlLnB1c2goZnVuKTtcbiAgfVxuXG4gIGRlcXVldWUgKCkge1xuICAgIHRoaXMucXVldWUuc2hpZnQoKTtcbiAgfVxuXG4gIGZyb250KCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXVlWzBdO1xuICB9XG5cbiAgY29tcGxldGUgKCkge1xuICAgIHRoaXMuZGVxdWV1ZSgpO1xuICAgIHRoaXMuaXNFbXB0eSgpIHx8IHRoaXMuZnJvbnQoKTtcbiAgfVxuXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICB9XG5cbiAgbGVuZ3RoICgpIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGg7XG4gIH1cblxuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCgpID09PSAwO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBSZWNvcmRpbmdRdWV1ZSgpO1xuIiwiaW1wb3J0IHsgSVRhYnMgfSBmcm9tICcuLi90eXBpbmcvYmFja2dyb3VuZCc7XG5pbXBvcnQgeyBJQWN0aW9uIH0gZnJvbSAnLi4vdHlwaW5nL3JlYmlydGgnO1xuaW1wb3J0IHsgUmVjb3JkTnVtYmVyIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5jbGFzcyBUYWJzIHtcbiAgcHJpdmF0ZSByZWFkb25seSB0YWJzOiBJVGFicztcblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy50YWJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfVxuXG4gIGdldFRhYiAoaWQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnRhYnNbaWRdIHx8IG51bGw7XG4gIH1cblxuICBnZXRIYXNoIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuICh0aGlzLmdldFRhYihpZCkgJiYgdGhpcy5nZXRUYWIoaWQpLmdldEhhc2gpID8gdGhpcy5nZXRUYWIoaWQpLmdldEhhc2ggOiBudWxsO1xuICB9XG5cbiAgZ2V0QWN0aW9uIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuICh0aGlzLmdldFRhYihpZCkgJiYgdGhpcy5nZXRUYWIoaWQpLmFjdGlvbikgPyB0aGlzLmdldFRhYihpZCkuYWN0aW9uIDogbnVsbDtcbiAgfVxuXG4gIGdldE1lZGlhUmVjb3JkZXIgKGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VGFiKGlkKSAmJiB0aGlzLmdldFRhYihpZCkubWVkaWFSZWNvcmRlcikgPyB0aGlzLmdldFRhYihpZCkubWVkaWFSZWNvcmRlciA6IG51bGw7XG4gIH1cblxuICBjcmVhdGVUYWIgKGlkOiBudW1iZXIpIHtcbiAgICB0aGlzLnRhYnNbaWRdID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfVxuXG4gIHNldEhhc2ggKGlkOiBudW1iZXIsIGdldEhhc2g6IHN0cmluZykge1xuICAgIGlmICh0aGlzLmdldFRhYihpZCkgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuY3JlYXRlVGFiKGlkKTtcbiAgICB9XG4gICAgdGhpcy50YWJzW2lkXS5nZXRIYXNoID0gZ2V0SGFzaDtcbiAgfVxuXG4gIHNldEFjdGlvbiAoaWQ6IG51bWJlciwgYWN0aW9uOiBJQWN0aW9uKSB7XG4gICAgaWYgKHRoaXMuZ2V0VGFiKGlkKSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5jcmVhdGVUYWIoaWQpO1xuICAgIH1cbiAgICBpZiAoYWN0aW9uICE9PSB0aGlzLnRhYnNbaWRdLmFjdGlvbikge1xuICAgICAgdGhpcy50YWJzW2lkXS5hY3Rpb24gPSBhY3Rpb247XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFSZWNvcmRlciAoaWQ6IG51bWJlciwgbWVkaWFSZWNvcmRlcjogTWVkaWFSZWNvcmRlcikge1xuICAgIGlmICh0aGlzLmdldFRhYihpZCkgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuY3JlYXRlVGFiKGlkKTtcbiAgICB9XG4gICAgdGhpcy50YWJzW2lkXS5tZWRpYVJlY29yZGVyID0gbWVkaWFSZWNvcmRlcjtcbiAgfVxuXG4gIGlzV2FpdGluZyAoaWQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGlvbihpZCkgPT09ICd3YWl0aW5nJztcbiAgfVxuXG4gIGlzU3RhcnQgKGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3Rpb24oaWQpID09PSAnc3RhcnQnO1xuICB9XG5cbiAgaXNQYXVzZSAoaWQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGlvbihpZCkgPT09ICdwYXVzZSc7XG4gIH1cblxuICBpc1Jlc3VtZSAoaWQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGlvbihpZCkgPT09ICdyZXN1bWUnO1xuICB9XG5cbiAgaXNTdG9wIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aW9uKGlkKSA9PT0gJ3N0b3AnO1xuICB9XG5cbiAgZGVsZXRlVGFiIChpZDogbnVtYmVyKSB7XG4gICAgZGVsZXRlIHRoaXMudGFic1tpZF07XG4gIH1cblxuICBnZXRGcmVlTnVtYmVyICgpIHtcbiAgICByZXR1cm4gUmVjb3JkTnVtYmVyIC0gKE9iamVjdC5rZXlzKHRoaXMudGFicykuZmlsdGVyKHRhYiA9PiB7XG4gICAgICByZXR1cm4gdGhpcy50YWJzW3RhYl0uYWN0aW9uICE9PSAnc3RvcCc7XG4gICAgfSkubGVuZ3RoKTtcbiAgfVxufVxuXG5jb25zdCB0YWJzID0gbmV3IFRhYnMoKTtcblxuLy8gQHRzLWlnbm9yZVxud2luZG93LnRhYnMgPSB0YWJzO1xuXG5leHBvcnQgZGVmYXVsdCB0YWJzO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==