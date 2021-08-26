import QuickPaper from './core/index.js';

// 根据运行环境，导出接口
if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = QuickPaper;
} else {
    window.QuickPaper = QuickPaper;
}
