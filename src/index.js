import QuickPaper from './core/index.js';

// 挂载内置指令
import qCode from './module/directive/q-code'; QuickPaper.directive('qCode', qCode);

// 挂在内置方法
import urlFormat from './module/method/urlFormat'; QuickPaper.urlFormat = urlFormat;

import OpenWebEditor from 'open-web-editor';
QuickPaper.prototype.__OpenWebEditor = OpenWebEditor;
QuickPaper.__OpenWebEditor = OpenWebEditor;

// 根据运行环境，导出接口
if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = QuickPaper;
} else {
    window.QuickPaper = QuickPaper;
}
