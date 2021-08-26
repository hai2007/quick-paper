import QuickPaper from 'quick-paper';

// 兼容文件
import '@hai2007/polyfill/Promise.js';

// 引入样式
import '@hai2007/style/normalize.css';
import './assets/style.scss';
import '@hai2007/style/doc-view.css'

import App from './App.paper';

import qCode from './directives/q-code'; QuickPaper.directive('qCode', qCode);

QuickPaper.urlFormat = function (url) {

    let splitTemp = url.split('?');
    let routerTemp = (splitTemp[0] + "#").split("#")[1].replace(/^\//, '').replace(/\/$/, '').split('/');
    let paramTemp = splitTemp[1] || "";

    let paramResult, paramArray;
    if (paramTemp == "") {
        paramResult = {};
    } else {
        paramArray = paramTemp.split("&"), paramResult = {};
        paramArray.forEach(item => {
            let temp = item.split("=");
            paramResult[temp[0]] = temp[1];
        });
    }

    let resultData = {
        router: routerTemp[0] == '' ? [] : routerTemp,
        params: paramResult
    };

    return resultData;
};


//根对象
window.quickPaper = new QuickPaper({

    //挂载点
    el: document.getElementById('root'),

    // 启动页面
    render: createElement => createElement(App)

});
