
// 挂载全局方法

import mount from './mount';
import use from './use';

export default function (QuickPaper) {

    // 登记扩展内容
    QuickPaper.prototype.__directiveLib = {};
    QuickPaper.prototype.__componentLib = {};

    // 挂载
    mount(QuickPaper);
    use(QuickPaper);

};
