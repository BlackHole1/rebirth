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
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lib/utils */ "./chrome-extension/lib/utils.ts");






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
// 为了防止多个容器同时请求数据库(高并发的情况下)，数据还未及时更新造成的多个容器录制同一个网站的情况。
setTimeout(() => {
    getRecordTasksAndStartTab();
    // 每隔 随机后的1分钟~3分钟 请求一次
    setInterval(() => {
        const getFreeNumber = _lib_tabs__WEBPACK_IMPORTED_MODULE_1__["default"].getFreeNumber();
        if (getFreeNumber === 0)
            return;
        getRecordTasksAndStartTab(getFreeNumber);
    }, Object(_lib_utils__WEBPACK_IMPORTED_MODULE_5__["randomNumber"])(1000 * 60, 3000 * 60));
}, Object(_lib_utils__WEBPACK_IMPORTED_MODULE_5__["randomNumber"])(1000, 3000 * 10));
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


/***/ }),

/***/ "./chrome-extension/lib/utils.ts":
/*!***************************************!*\
  !*** ./chrome-extension/lib/utils.ts ***!
  \***************************************/
/*! exports provided: randomNumber */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "randomNumber", function() { return randomNumber; });
const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9iYWNrZ3JvdW5kLnRzIiwid2VicGFjazovLy8uL2Nocm9tZS1leHRlbnNpb24vbGliL2FqYXgudHMiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9saWIvY29uZmlnLnRzIiwid2VicGFjazovLy8uL2Nocm9tZS1leHRlbnNpb24vbGliL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly8vLi9jaHJvbWUtZXh0ZW5zaW9uL2xpYi9yZWNvcmRpbmcudHMiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9saWIvcmVjb3JkaW5nUXVldWUudHMiLCJ3ZWJwYWNrOi8vLy4vY2hyb21lLWV4dGVuc2lvbi9saWIvdGFicy50cyIsIndlYnBhY2s6Ly8vLi9jaHJvbWUtZXh0ZW5zaW9uL2xpYi91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBeUMsaUNBQWlDO0FBQzFFLHdIQUFnSCxtQkFBbUIsRUFBRTtBQUNySTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQTRDO0FBRWQ7QUFDaUI7QUFDRztBQUNaO0FBRUs7QUFFM0MsZ0JBQWdCO0FBQ2hCLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxNQUFjLDJEQUFZLEVBQUUsRUFBRTtJQUMvRCxnRUFBYyxDQUFDLEdBQUcsQ0FBQztTQUNoQixJQUFJLENBQUMsQ0FBQyxJQUFhLEVBQUUsRUFBRTtRQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ2pCLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRzthQUNoQixFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNQLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLGlEQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDOUIsaURBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUVGLHNEQUFzRDtBQUN0RCxVQUFVLENBQUMsR0FBRyxFQUFFO0lBQ2QseUJBQXlCLEVBQUUsQ0FBQztJQUU1QixzQkFBc0I7SUFDdEIsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUNmLE1BQU0sYUFBYSxHQUFHLGlEQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFM0MsSUFBSSxhQUFhLEtBQUssQ0FBQztZQUFFLE9BQU87UUFDaEMseUJBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0MsQ0FBQyxFQUFFLCtEQUFZLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUV6QyxDQUFDLEVBQUUsK0RBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFbEMsU0FBUztBQUNULE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQVcsRUFBRSxFQUFFO1FBQ3pDLElBQUksQ0FBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hFLE1BQU0sR0FBRyxHQUFHLEdBQUcsRUFBRTtnQkFDZixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxpREFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNqRyxzREFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDO1lBRUYsZUFBZTtZQUNmLElBQUksMkRBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDNUIsR0FBRyxFQUFFLENBQUM7YUFDUDtpQkFBTTtnQkFDTCx5QkFBeUI7Z0JBQ3pCLDJEQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqRUgsY0FBYztBQUNQLE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7SUFDNUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxLQUFLLENBQUMsR0FBRyxrQkFBVSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7YUFDeEMsSUFBSSxDQUFDLENBQU0sSUFBSSxFQUFDLEVBQUU7WUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLEVBQUM7YUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLE9BQU87QUFDQSxNQUFNLGtCQUFrQixHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDakQsS0FBSyxDQUFDLEdBQUcsa0JBQVUsNEJBQTRCLElBQUksRUFBRSxDQUFDO1NBQ25ELEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNoQkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUFPO0FBQ0EsTUFBTSxhQUFhLEdBQUc7SUFDM0IsS0FBSyxFQUFFLElBQUk7SUFDWCxLQUFLLEVBQUUsSUFBSTtJQUNYLGdCQUFnQixFQUFFO1FBQ2hCLFNBQVMsRUFBRTtZQUNULFFBQVEsRUFBRSxJQUFJO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsWUFBWSxFQUFFLEVBQUU7WUFDaEIsWUFBWSxFQUFFLEVBQUU7U0FDakI7S0FDRjtDQUNGLENBQUM7QUFFRixrQkFBa0I7QUFDWCxNQUFNLG9CQUFvQixHQUFHO0lBQ2xDLGtCQUFrQixFQUFFLE9BQU87SUFDM0IsUUFBUSxFQUFFLHVCQUF1QjtDQUNsQyxDQUFDO0FBRUYsU0FBUztBQUNGLE1BQU0sV0FBVyxHQUFHO0lBQ3pCLElBQUksRUFBRSxZQUFZO0NBQ25CLENBQUM7Ozs7Ozs7Ozs7Ozs7QUN6QkY7QUFBQTtBQUFPLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ0EvQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQTBCO0FBQ29CO0FBQzhCO0FBQ2hDO0FBRTVDLE9BQU87QUFDUCxNQUFNLEtBQUssR0FBRyxDQUFDLEVBQVUsRUFBRSxRQUFnQixFQUFRLEVBQUU7SUFDbkQsNkNBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTVCLG1EQUFtRDtJQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDckIsTUFBTSxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7SUFFSCw0REFBNEQ7SUFDNUQsYUFBYTtJQUNiLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHFEQUFhLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDaEQsdURBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFO2dCQUMxQixLQUFLLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTO2FBQ2hDLENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLGFBQWEsR0FBZSxFQUFFLENBQUM7UUFDckMsTUFBTSxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLDREQUFvQixDQUFDLENBQUM7UUFFdEUsYUFBYSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUMsRUFBRTtZQUN0QyxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNoQztRQUNILENBQUMsQ0FBQztRQUVGLGFBQWEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxtREFBVyxDQUFDLENBQUM7WUFFekQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsR0FBRyxRQUFRLE9BQU8sQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUViLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDO1FBRUYsNkNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDekMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsT0FBTztBQUNQLE1BQU0sS0FBSyxHQUFHLENBQUMsRUFBVSxFQUFFLGFBQTRCLEVBQVEsRUFBRTtJQUMvRCw2Q0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUIsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3hCLENBQUMsQ0FBQztBQUVGLE9BQU87QUFDUCxNQUFNLE1BQU0sR0FBRyxDQUFDLEVBQVUsRUFBRSxhQUE0QixFQUFRLEVBQUU7SUFDaEUsNkNBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUM7QUFFRix5QkFBeUI7QUFDekIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxFQUFVLEVBQUUsYUFBNEIsRUFBUSxFQUFFO0lBQzlELDZDQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQixnRUFBa0IsQ0FBQyw2Q0FBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVyQixzRUFBc0U7SUFDdEUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDL0MsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixNQUFNLE9BQU8sR0FBaUM7SUFDNUMsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sSUFBSTtDQUNMLENBQUM7QUFFYSxzRUFBTyxFQUFDOzs7Ozs7Ozs7Ozs7O0FDbkZ2QjtBQUFBLE1BQU0sY0FBYztJQUVsQjtRQUNFLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxPQUFPLENBQUUsR0FBYTtRQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQzNCLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdCLENBQUM7Q0FDRjtBQUVjLG1FQUFJLGNBQWMsRUFBRSxFQUFDOzs7Ozs7Ozs7Ozs7O0FDbENwQztBQUFBO0FBQTJDO0FBRTNDLE1BQU0sSUFBSTtJQUdSO1FBQ0UsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNLENBQUUsRUFBVTtRQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFRCxPQUFPLENBQUUsRUFBVTtRQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxTQUFTLENBQUUsRUFBVTtRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3JGLENBQUM7SUFFRCxnQkFBZ0IsQ0FBRSxFQUFVO1FBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDbkcsQ0FBQztJQUVELFNBQVMsQ0FBRSxFQUFVO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsT0FBTyxDQUFFLEVBQVUsRUFBRSxPQUFlO1FBQ2xDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwQjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUNsQyxDQUFDO0lBRUQsU0FBUyxDQUFFLEVBQVUsRUFBRSxNQUFlO1FBQ3BDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwQjtRQUNELElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFRCxnQkFBZ0IsQ0FBRSxFQUFVLEVBQUUsYUFBNEI7UUFDeEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BCO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQzlDLENBQUM7SUFFRCxTQUFTLENBQUUsRUFBVTtRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssU0FBUyxDQUFDO0lBQzFDLENBQUM7SUFFRCxPQUFPLENBQUUsRUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssT0FBTyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxPQUFPLENBQUUsRUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssT0FBTyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxRQUFRLENBQUUsRUFBVTtRQUNsQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxNQUFNLENBQUUsRUFBVTtRQUNoQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxTQUFTLENBQUUsRUFBVTtRQUNuQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELGFBQWE7UUFDWCxPQUFPLHVEQUFZLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDekQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDYixDQUFDO0NBQ0Y7QUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBRXhCLGFBQWE7QUFDYixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUVKLG1FQUFJLEVBQUM7Ozs7Ozs7Ozs7Ozs7QUMxRnBCO0FBQUE7QUFBTyxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQUUsRUFBRTtJQUN2RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMzRCxDQUFDLENBQUMiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vY2hyb21lLWV4dGVuc2lvbi9iYWNrZ3JvdW5kLnRzXCIpO1xuIiwiaW1wb3J0IHsgZ2V0UmVjb3JkVGFza3MgfSBmcm9tICcuL2xpYi9hamF4JztcbmltcG9ydCB7IElSZWNvcmQgfSBmcm9tICcuL3R5cGluZy9yZXF1ZXN0JztcbmltcG9ydCB0YWJzIGZyb20gJy4vbGliL3RhYnMnO1xuaW1wb3J0IHsgUmVjb3JkTnVtYmVyIH0gZnJvbSAnLi9saWIvY29uc3RhbnRzJztcbmltcG9ydCByZWNvcmRpbmdRdWV1ZSBmcm9tICcuL2xpYi9yZWNvcmRpbmdRdWV1ZSc7XG5pbXBvcnQgYWN0aW9ucyBmcm9tICcuL2xpYi9yZWNvcmRpbmcnO1xuaW1wb3J0IHsgSURhdGEgfSBmcm9tICcuL3R5cGluZy9iYWNrZ3JvdW5kJztcbmltcG9ydCB7IHJhbmRvbU51bWJlciB9IGZyb20gJy4vbGliL3V0aWxzJztcblxuLy8g6I635Y+W6ZyA6KaB5b2V5Yi255qE572R56uZ5Lul5Y+K5omT5byAXG5jb25zdCBnZXRSZWNvcmRUYXNrc0FuZFN0YXJ0VGFiID0gKG51bTogbnVtYmVyID0gUmVjb3JkTnVtYmVyKSA9PiB7XG4gIGdldFJlY29yZFRhc2tzKG51bSlcbiAgICAudGhlbigoZGF0YTogSVJlY29yZCkgPT4ge1xuICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZGF0YS5mb3JFYWNoKHJlY29yZCA9PiB7XG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgICAgdXJsOiByZWNvcmQudXJsXG4gICAgICAgIH0sIHRhYiA9PiB7XG4gICAgICAgICAgY29uc3QgaWQgPSB0YWIuaWQ7XG4gICAgICAgICAgdGFicy5zZXRBY3Rpb24oaWQsICd3YWl0aW5nJyk7XG4gICAgICAgICAgdGFicy5zZXRIYXNoKGlkLCByZWNvcmQuaGFzaCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH0pO1xufTtcblxuLy8g5Li65LqG6Ziy5q2i5aSa5Liq5a655Zmo5ZCM5pe26K+35rGC5pWw5o2u5bqTKOmrmOW5tuWPkeeahOaDheWGteS4iynvvIzmlbDmja7ov5jmnKrlj4rml7bmm7TmlrDpgKDmiJDnmoTlpJrkuKrlrrnlmajlvZXliLblkIzkuIDkuKrnvZHnq5nnmoTmg4XlhrXjgIJcbnNldFRpbWVvdXQoKCkgPT4ge1xuICBnZXRSZWNvcmRUYXNrc0FuZFN0YXJ0VGFiKCk7XG5cbiAgLy8g5q+P6ZqUIOmaj+acuuWQjueahDHliIbpkp9+M+WIhumSnyDor7fmsYLkuIDmrKFcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIGNvbnN0IGdldEZyZWVOdW1iZXIgPSB0YWJzLmdldEZyZWVOdW1iZXIoKTtcblxuICAgIGlmIChnZXRGcmVlTnVtYmVyID09PSAwKSByZXR1cm47XG4gICAgZ2V0UmVjb3JkVGFza3NBbmRTdGFydFRhYihnZXRGcmVlTnVtYmVyKTtcbiAgfSwgcmFuZG9tTnVtYmVyKDEwMDAgKiA2MCwgMzAwMCAqIDYwKSk7XG5cbn0sIHJhbmRvbU51bWJlcigxMDAwLCAzMDAwICogMTApKTtcblxuLy8g55uR5ZCs572R6aG15raI5oGvXG5jaHJvbWUucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIocG9ydCA9PiB7XG4gIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKChkYXRhOiBJRGF0YSkgPT4ge1xuICAgIGlmIChbICdzdGFydCcsICdwYXVzZScsICdyZXN1bWUnLCAnc3RvcCcgXS5pbmNsdWRlcyhkYXRhLmFjdGlvbikpIHtcbiAgICAgIGNvbnN0IGZ1biA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudFRhYklkID0gcG9ydC5zZW5kZXIudGFiLmlkO1xuICAgICAgICBjb25zdCBsYXN0UGFyYW1zID0gZGF0YS5hY3Rpb24gPT09ICdzdGFydCcgPyBkYXRhLmZpbGVuYW1lIDogdGFicy5nZXRNZWRpYVJlY29yZGVyKGN1cnJlbnRUYWJJZCk7XG4gICAgICAgIGFjdGlvbnNbZGF0YS5hY3Rpb25dKGN1cnJlbnRUYWJJZCwgbGFzdFBhcmFtcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyDlpoLmnpzpmJ/liJfkuLrnqbrvvIzliJnnm7TmjqXov5DooYxcbiAgICAgIGlmIChyZWNvcmRpbmdRdWV1ZS5pc0VtcHR5KCkpIHtcbiAgICAgICAgZnVuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDliqDlhaXlvZXlsY/pmJ/liJfvvIznrYnlvoXkuIrkuIDmrKHlvZXlsY/lvIDlp4vlkI7vvIzlnKjooqvov5DooYxcbiAgICAgICAgcmVjb3JkaW5nUXVldWUuZW5xdWV1ZShmdW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcbiIsIi8vIOWQkeacjeWKoeiOt+WPluimgeW9leWItueahOe9keermVxuZXhwb3J0IGNvbnN0IGdldFJlY29yZFRhc2tzID0gKG51bTogbnVtYmVyKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZmV0Y2goYCR7U0VSVkVSX1VSTH0vZ2V0UmVjb3JkP251bT0ke251bX1gKVxuICAgICAgLnRoZW4oYXN5bmMgcmVzcCA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIHJlc3Aub2sgPyByZXNvbHZlKGRhdGEpIDogcmVqZWN0KGRhdGEpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlID0+IHJlamVjdChlKSk7XG4gIH0pO1xufTtcblxuLy8g5a6M5oiQ5b2V5Yi2XG5leHBvcnQgY29uc3QgY29tcGxldGVSZWNvcmRUYXNrID0gKGhhc2g6IHN0cmluZykgPT4ge1xuICBmZXRjaChgJHtTRVJWRVJfVVJMfS9jb21wbGV0ZVJlY29yZFRhc2s/aGFzaD0ke2hhc2h9YClcbiAgICAuY2F0Y2goKCkgPT4ge30pO1xufTtcbiIsIi8vIOW9leWItumFjee9rlxuZXhwb3J0IGNvbnN0IGNhcHR1cmVDb25maWcgPSB7XG4gIHZpZGVvOiB0cnVlLFxuICBhdWRpbzogdHJ1ZSxcbiAgdmlkZW9Db25zdHJhaW50czoge1xuICAgIG1hbmRhdG9yeToge1xuICAgICAgbWluV2lkdGg6IDE5MjAsXG4gICAgICBtaW5IZWlnaHQ6IDEwODAsXG4gICAgICBtYXhXaWR0aDogMTkyMCxcbiAgICAgIG1heEhlaWdodDogMTA4MCxcbiAgICAgIG1heEZyYW1lUmF0ZTogMzAsXG4gICAgICBtaW5GcmFtZVJhdGU6IDMwLFxuICAgIH1cbiAgfVxufTtcblxuLy8gbWVkaWFSZWNvcmRlcumFjee9rlxuZXhwb3J0IGNvbnN0IG1lZGlhUmVjb3JkZXJPcHRpb25zID0ge1xuICB2aWRlb0JpdHNQZXJTZWNvbmQ6IDI1MDAwMDAsXG4gIG1pbWVUeXBlOiAndmlkZW8vd2VibTtjb2RlY3M9dnA5J1xufTtcblxuLy8gQmxvYumFjee9rlxuZXhwb3J0IGNvbnN0IGJsb2JPcHRpb25zID0ge1xuICB0eXBlOiAndmlkZW8vd2VibSdcbn07XG4iLCJleHBvcnQgY29uc3QgUmVjb3JkTnVtYmVyID0gMTA7XG4iLCJpbXBvcnQgdGFicyBmcm9tICcuL3RhYnMnO1xuaW1wb3J0IHJlY29yZGluZ1F1ZXVlIGZyb20gJy4vcmVjb3JkaW5nUXVldWUnO1xuaW1wb3J0IHsgY2FwdHVyZUNvbmZpZywgbWVkaWFSZWNvcmRlck9wdGlvbnMsIGJsb2JPcHRpb25zIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgY29tcGxldGVSZWNvcmRUYXNrIH0gZnJvbSAnLi9hamF4JztcblxuLy8g5byA5aeL5b2V5bGPXG5jb25zdCBzdGFydCA9IChpZDogbnVtYmVyLCBmaWxlbmFtZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIHRhYnMuc2V0QWN0aW9uKGlkLCAnc3RhcnQnKTtcblxuICAvLyDliIfmjaLmoIfnrb7liLDop6blj5FzdGFydOWKqOS9nOeahOagh+etvumhte+8jOWboOS4unRhYkNhcHR1cmUuY2FwdHVyZeaYr+WcqOW9k+WJjVRhYuinpuWPkVxuICBjaHJvbWUudGFicy51cGRhdGUoaWQsIHtcbiAgICBhY3RpdmU6IHRydWVcbiAgfSk7XG5cbiAgLy8g5byA5aeL6L+b6KGM5b2V5bGP77yM5Yqg5LiKdHMtaWdub3Jl77yM5piv5Zug5Li6QHR5cGVzL2Nocm9tZSBwYWNrYWdl6L+Y5rKh5pu05paw77yM5a+86Ie05YW257G75Z6L5piv6ZSZ6K+v55qEXG4gIC8vIEB0cy1pZ25vcmVcbiAgY2hyb21lLnRhYkNhcHR1cmUuY2FwdHVyZShjYXB0dXJlQ29uZmlnLCBzdHJlYW0gPT4ge1xuICAgIHJlY29yZGluZ1F1ZXVlLmNvbXBsZXRlKCk7XG4gICAgaWYgKHN0cmVhbSA9PT0gbnVsbCkge1xuICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoaWQsIHtcbiAgICAgICAgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb3JkZWRCbG9iczogQmxvYlBhcnRbXSA9IFtdO1xuICAgIGNvbnN0IG1lZGlhUmVjb3JkZXIgPSBuZXcgTWVkaWFSZWNvcmRlcihzdHJlYW0sIG1lZGlhUmVjb3JkZXJPcHRpb25zKTtcblxuICAgIG1lZGlhUmVjb3JkZXIub25kYXRhYXZhaWxhYmxlID0gZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LmRhdGEgJiYgZXZlbnQuZGF0YS5zaXplID4gMCkge1xuICAgICAgICByZWNvcmRlZEJsb2JzLnB1c2goZXZlbnQuZGF0YSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG1lZGlhUmVjb3JkZXIub25zdG9wID0gKCkgPT4ge1xuICAgICAgY29uc3Qgc3VwZXJCdWZmZXIgPSBuZXcgQmxvYihyZWNvcmRlZEJsb2JzLCBibG9iT3B0aW9ucyk7XG5cbiAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN1cGVyQnVmZmVyKTtcbiAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGAke2ZpbGVuYW1lfS53ZWJtYCk7XG4gICAgICBsaW5rLmNsaWNrKCk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjaHJvbWUudGFicy5yZW1vdmUoaWQpO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfTtcblxuICAgIHRhYnMuc2V0TWVkaWFSZWNvcmRlcihpZCwgbWVkaWFSZWNvcmRlcik7XG4gICAgbWVkaWFSZWNvcmRlci5zdGFydCgpO1xuICB9KTtcbn07XG5cbi8vIOaaguWBnOW9leWxj1xuY29uc3QgcGF1c2UgPSAoaWQ6IG51bWJlciwgbWVkaWFSZWNvcmRlcjogTWVkaWFSZWNvcmRlcik6IHZvaWQgPT4ge1xuICB0YWJzLnNldEFjdGlvbihpZCwgJ3BhdXNlJyk7XG4gIG1lZGlhUmVjb3JkZXIucGF1c2UoKTtcbn07XG5cbi8vIOaBouWkjeW9leWxj1xuY29uc3QgcmVzdW1lID0gKGlkOiBudW1iZXIsIG1lZGlhUmVjb3JkZXI6IE1lZGlhUmVjb3JkZXIpOiB2b2lkID0+IHtcbiAgdGFicy5zZXRBY3Rpb24oaWQsICdyZXN1bWUnKTtcbiAgbWVkaWFSZWNvcmRlci5yZXN1bWUoKTtcbn07XG5cbi8vIOWBnOatouW9leWxj++8jOWBnOatouWQjueahOS4i+i9veaTjeS9nOWcqHN0YXJ05pa55rOV6YeMXG5jb25zdCBzdG9wID0gKGlkOiBudW1iZXIsIG1lZGlhUmVjb3JkZXI6IE1lZGlhUmVjb3JkZXIpOiB2b2lkID0+IHtcbiAgdGFicy5zZXRBY3Rpb24oaWQsICdzdG9wJyk7XG4gIGNvbXBsZXRlUmVjb3JkVGFzayh0YWJzLmdldEhhc2goaWQpKTtcbiAgbWVkaWFSZWNvcmRlci5zdG9wKCk7XG5cbiAgLy8gbWVkaWFSZWNvcmRlci5zdG9wKCnlj6rmmK/lgZzmraLlvZXliLbvvIzkvYbmmK/lhbZzdHJlYW3ov5jmsqHmnInooqvlhbPpl63vvIzmiYDku6XpnIDopoHojrflj5blhbblvZXliLbnmoTmiYDmnIlzdHJlYW3vvIzlubbpgJDkuKrlhbPpl61cbiAgbWVkaWFSZWNvcmRlci5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgdHJhY2suc3RvcCgpO1xuICB9KTtcbn07XG5cbmNvbnN0IGFjdGlvbnM6IHsgW2tleXM6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7XG4gIHN0YXJ0LFxuICBwYXVzZSxcbiAgcmVzdW1lLFxuICBzdG9wXG59O1xuXG5leHBvcnQgZGVmYXVsdCBhY3Rpb25zO1xuIiwiY2xhc3MgUmVjb3JkaW5nUXVldWUge1xuICBwcml2YXRlIHF1ZXVlOiBGdW5jdGlvbltdO1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICB9XG5cbiAgZW5xdWV1ZSAoZnVuOiBGdW5jdGlvbikge1xuICAgIHRoaXMucXVldWUucHVzaChmdW4pO1xuICB9XG5cbiAgZGVxdWV1ZSAoKSB7XG4gICAgdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICB9XG5cbiAgZnJvbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucXVldWVbMF07XG4gIH1cblxuICBjb21wbGV0ZSAoKSB7XG4gICAgdGhpcy5kZXF1ZXVlKCk7XG4gICAgdGhpcy5pc0VtcHR5KCkgfHwgdGhpcy5mcm9udCgpO1xuICB9XG5cbiAgcmVtb3ZlICgpIHtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gIH1cblxuICBsZW5ndGggKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXVlLmxlbmd0aDtcbiAgfVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoKCkgPT09IDA7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFJlY29yZGluZ1F1ZXVlKCk7XG4iLCJpbXBvcnQgeyBJVGFicyB9IGZyb20gJy4uL3R5cGluZy9iYWNrZ3JvdW5kJztcbmltcG9ydCB7IElBY3Rpb24gfSBmcm9tICcuLi90eXBpbmcvcmViaXJ0aCc7XG5pbXBvcnQgeyBSZWNvcmROdW1iZXIgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNsYXNzIFRhYnMge1xuICBwcml2YXRlIHJlYWRvbmx5IHRhYnM6IElUYWJzO1xuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLnRhYnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB9XG5cbiAgZ2V0VGFiIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMudGFic1tpZF0gfHwgbnVsbDtcbiAgfVxuXG4gIGdldEhhc2ggKGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VGFiKGlkKSAmJiB0aGlzLmdldFRhYihpZCkuZ2V0SGFzaCkgPyB0aGlzLmdldFRhYihpZCkuZ2V0SGFzaCA6IG51bGw7XG4gIH1cblxuICBnZXRBY3Rpb24gKGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VGFiKGlkKSAmJiB0aGlzLmdldFRhYihpZCkuYWN0aW9uKSA/IHRoaXMuZ2V0VGFiKGlkKS5hY3Rpb24gOiBudWxsO1xuICB9XG5cbiAgZ2V0TWVkaWFSZWNvcmRlciAoaWQ6IG51bWJlcikge1xuICAgIHJldHVybiAodGhpcy5nZXRUYWIoaWQpICYmIHRoaXMuZ2V0VGFiKGlkKS5tZWRpYVJlY29yZGVyKSA/IHRoaXMuZ2V0VGFiKGlkKS5tZWRpYVJlY29yZGVyIDogbnVsbDtcbiAgfVxuXG4gIGNyZWF0ZVRhYiAoaWQ6IG51bWJlcikge1xuICAgIHRoaXMudGFic1tpZF0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB9XG5cbiAgc2V0SGFzaCAoaWQ6IG51bWJlciwgZ2V0SGFzaDogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZ2V0VGFiKGlkKSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5jcmVhdGVUYWIoaWQpO1xuICAgIH1cbiAgICB0aGlzLnRhYnNbaWRdLmdldEhhc2ggPSBnZXRIYXNoO1xuICB9XG5cbiAgc2V0QWN0aW9uIChpZDogbnVtYmVyLCBhY3Rpb246IElBY3Rpb24pIHtcbiAgICBpZiAodGhpcy5nZXRUYWIoaWQpID09PSBudWxsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVRhYihpZCk7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gIT09IHRoaXMudGFic1tpZF0uYWN0aW9uKSB7XG4gICAgICB0aGlzLnRhYnNbaWRdLmFjdGlvbiA9IGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICBzZXRNZWRpYVJlY29yZGVyIChpZDogbnVtYmVyLCBtZWRpYVJlY29yZGVyOiBNZWRpYVJlY29yZGVyKSB7XG4gICAgaWYgKHRoaXMuZ2V0VGFiKGlkKSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5jcmVhdGVUYWIoaWQpO1xuICAgIH1cbiAgICB0aGlzLnRhYnNbaWRdLm1lZGlhUmVjb3JkZXIgPSBtZWRpYVJlY29yZGVyO1xuICB9XG5cbiAgaXNXYWl0aW5nIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aW9uKGlkKSA9PT0gJ3dhaXRpbmcnO1xuICB9XG5cbiAgaXNTdGFydCAoaWQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGlvbihpZCkgPT09ICdzdGFydCc7XG4gIH1cblxuICBpc1BhdXNlIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aW9uKGlkKSA9PT0gJ3BhdXNlJztcbiAgfVxuXG4gIGlzUmVzdW1lIChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aW9uKGlkKSA9PT0gJ3Jlc3VtZSc7XG4gIH1cblxuICBpc1N0b3AgKGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3Rpb24oaWQpID09PSAnc3RvcCc7XG4gIH1cblxuICBkZWxldGVUYWIgKGlkOiBudW1iZXIpIHtcbiAgICBkZWxldGUgdGhpcy50YWJzW2lkXTtcbiAgfVxuXG4gIGdldEZyZWVOdW1iZXIgKCkge1xuICAgIHJldHVybiBSZWNvcmROdW1iZXIgLSAoT2JqZWN0LmtleXModGhpcy50YWJzKS5maWx0ZXIodGFiID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnRhYnNbdGFiXS5hY3Rpb24gIT09ICdzdG9wJztcbiAgICB9KS5sZW5ndGgpO1xuICB9XG59XG5cbmNvbnN0IHRhYnMgPSBuZXcgVGFicygpO1xuXG4vLyBAdHMtaWdub3JlXG53aW5kb3cudGFicyA9IHRhYnM7XG5cbmV4cG9ydCBkZWZhdWx0IHRhYnM7XG4iLCJleHBvcnQgY29uc3QgcmFuZG9tTnVtYmVyID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcbn07XG4iXSwic291cmNlUm9vdCI6IiJ9