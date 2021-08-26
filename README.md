<p align='center'>
    <a href='https://hai2007.gitee.io/quick-paper' target='_blank'>
        <img src='./logo.png'>
    </a>
</p>

# Quick-Paper | 简单易用的前端框架

<p>
  <a href="https://hai2007.gitee.io/npm-downloads?interval=7&packages=quick-paper"><img src="https://img.shields.io/npm/dm/quick-paper.svg" alt="downloads"></a>
  <a href="https://www.npmjs.com/package/quick-paper"><img src="https://img.shields.io/npm/v/quick-paper.svg" alt="Version"></a>
  <a href="https://github.com/hai2007/quick-paper/graphs/code-frequency" target='_blank'><img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/hai2007/quick-paper"></a>
  <a href="https://github.com/hai2007/quick-paper/graphs/commit-activity" target='_blank'><img alt="GitHub repo commit" src="https://img.shields.io/github/last-commit/hai2007/quick-paper"></a>
  <a href="https://github.com/hai2007/quick-paper/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/quick-paper.svg" alt="License"></a>
  <a href="https://github.com/hai2007/quick-paper" target='_blank'><img alt="GitHub repo stars" src="https://img.shields.io/github/stars/hai2007/quick-paper?style=social"></a>
</p>

## Issues
使用的时候遇到任何问题或有好的建议，请点击进入[issue](https://github.com/hai2007/quick-paper/issues)！你可以[查阅文档](https://hai2007.gitee.io/quick-paper)获得接口API和入门教程。

## How to use?

首先你需要通过命令行安装QuickPaper，就像这样：

```bash
npm install --save quick-paper
```

然后，我们需要配置```webpack```如何解析```.paper```文件：

```js
// webpack.config.js
const QuickPaperLoaderPlugin = require('quick-paper/loader-plug/index.js');

module.exports = {
    // ......
     module: {
        rules: [{
            test: /\.paper$/,
            exclude: /node_modules/,
            loader: ['quick-paper/loader/index.js']
        },{
            test: /\.(css|scss)$/,
            loader: ['quick-paper/style-loader/index.js', 'css-loader', 'postcss-loader', './scss-loader.js']
        },
            // ......
        ]
     },
    plugins: [
        new QuickPaperLoaderPlugin()
    ]
    // ......
};
```

配置好了以后，在需要的地方引入即可：

```js
import QuickPaper from 'quick-paper';
```

QuickPaper设计的思想是组件，一个完整的页面由一系列并列或包含的组件拼接而成，但是，根组件只有一个：

```js
// 引入别的组件
// 在这个组件里面，又可以引入组件，这样一层层拼接
// 当然，每次并列引入的组件理论上可以任意多
import App from './App.paper';

// 根对象
window.quickPaper = new QuickPaper({

  // 挂载点
  el: document.getElementById('root'),

  // 配置启动方法
  render: createElement => createElement(App),

  // 还可以添加方法或生命周期钩子等

});
```

你可能会好奇App.paper的格式：

```html
<template>
  <!-- 页面模板 -->
</template>

<script>
  export default {
    /*类似控制器的地方*/
  };
</script>

<style>
 /*写样式的地方*/
</style>
```

更多细节请[查阅文档](https://hai2007.gitee.io/quick-paper)获得帮助。

如何调试loader？
--------------------------------------

docs项目，运行：

```bash
npm run debug
```

在需要调试的地方提前添加“ debugger ”语句，这和普通的web端调试一样，接着，在chrome浏览器地址栏中输入：

```
chrome://inspect/#devices
```

接着，请点击“ Open dedicated DevTools for Node ”后进入调试界面。

开源协议
---------------------------------------
[MIT](https://github.com/hai2007/quick-paper/blob/master/LICENSE)

Copyright (c) 2019-2021 [hai2007](https://hai2007.gitee.io/sweethome/) 走一步，再走一步。
