"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

/*!
* quick-paper v0.6.0
* (c) 2019-2021 你好2007 git+https://github.com/hai2007/quick-paper.git
* License: MIT
*/
(function () {
  'use strict';
  /**
   * 判断一个值是不是Object。
   *
   * @param {*} value 需要判断类型的值
   * @returns {boolean} 如果是Object返回true，否则返回false
   */

  function _isObject(value) {
    var type = _typeof2(value);

    return value != null && (type === 'object' || type === 'function');
  }

  var toString = Object.prototype.toString;
  /**
   * 获取一个值的类型字符串[object type]
   *
   * @param {*} value 需要返回类型的值
   * @returns {string} 返回类型字符串
   */

  function getType(value) {
    if (value == null) {
      return value === undefined ? '[object Undefined]' : '[object Null]';
    }

    return toString.call(value);
  }
  /**
   * 判断一个值是不是String。
   *
   * @param {*} value 需要判断类型的值
   * @returns {boolean} 如果是String返回true，否则返回false
   */


  function _isString(value) {
    var type = _typeof2(value);

    return type === 'string' || type === 'object' && value != null && !Array.isArray(value) && getType(value) === '[object String]';
  }
  /**
   * 判断一个值是不是Function。
   *
   * @param {*} value 需要判断类型的值
   * @returns {boolean} 如果是Function返回true，否则返回false
   */


  function _isFunction(value) {
    if (!_isObject(value)) {
      return false;
    }

    var type = getType(value);
    return type === '[object Function]' || type === '[object AsyncFunction]' || type === '[object GeneratorFunction]' || type === '[object Proxy]';
  }
  /**
   * 判断一个值是不是一个朴素的'对象'
   * 所谓"纯粹的对象"，就是该对象是通过"{}"或"new Object"创建的
   *
   * @param {*} value 需要判断类型的值
   * @returns {boolean} 如果是朴素的'对象'返回true，否则返回false
   */


  function _isPlainObject(value) {
    if (value === null || _typeof2(value) !== 'object' || getType(value) != '[object Object]') {
      return false;
    } // 如果原型为null


    if (Object.getPrototypeOf(value) === null) {
      return true;
    }

    var proto = value;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(value) === proto;
  }

  var domTypeHelp = function domTypeHelp(types, value) {
    return value !== null && _typeof2(value) === 'object' && types.indexOf(value.nodeType) > -1 && !_isPlainObject(value);
  };

  var isString = _isString; // 引用类型

  var isFunction = _isFunction;

  var isArray = function isArray(input) {
    return Array.isArray(input);
  }; // 结点类型


  var isElement = function isElement(input) {
    return domTypeHelp([1, 9, 11], input);
  }; // 判断是否是合法的方法或数据key


  function isValidKey(key) {
    // 判断是不是_或者$开头的
    // 这两个内部预留了
    if (/^[_$]/.test(key)) {
      console.error('The beginning of _ or $ is not allowed：' + key);
    }
  }

  var uid = 1;

  function initMixin(QuickPaper) {
    // 对象初始化
    QuickPaper.prototype.$$init = function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this._options = options; // 唯一标志

      this._uid = uid++; // 需要双向绑定的数据

      this._data = isFunction(options.data) ? options.data() : options.data; // 挂载点

      this._el = options.el; // 记录状态

      this.__isMounted = false;
      this.__isDestroyed = false; // 挂载方法

      for (var key in options.methods) {
        // 由于key的特殊性，注册前需要进行校验
        isValidKey(key);
        this[key] = options.methods[key];
      } // 挂载数据


      for (var _key in this._data) {
        // 数据的校验在监听的时候进行
        this[_key] = this._data[_key];
      } // 挂载局部组件


      this.__componentLib_scope = {};

      for (var _key2 in options.component) {
        this.__componentLib_scope[_key2] = options.component[_key2];
      } // 挂载局部指令


      this.__directiveLib_scope = {};

      for (var _key3 in options.directive) {
        this.__directiveLib_scope[_key3] = options.directive[_key3];
      }
    };
  }

  function lifecycleMixin(QuickPaper) {
    // 生命周期调用钩子
    // 整个过程，进行到对应时期，都需要调用一下这里对应的钩子
    // 整合在一起的目的是方便维护
    QuickPaper.prototype.$$lifecycle = function (callbackName) {
      // beforeCreate
      if (isFunction(callbackName)) {
        callbackName();
        return;
      }

      if ([// 创建组件
      'created', // 挂载组件
      'beforeMount', 'mounted', // 更新组件
      'beforeUpdate', 'updated', // 销毁组件
      'beforeDestroy', 'destroyed'].indexOf(callbackName) > -1 && isFunction(this._options[callbackName])) {
        this._options[callbackName].call(this);
      }
    };
  }
  /**
   * 创建vnode方法，并收集信息
   * @param {string|json} tagName或组件 结点名称或组件
   * @param {json} attrs 属性
   * @param {array[vnode|string]} children 孩子元素
   * @return {element} 返回vnode
   */


  function createElement(tagName) {
    var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    // 把组件和普通结点区分开
    // 当然，这里的普通结点也可能是动态组件和扩展的组件
    // 由于更多信息需要在当前对象中获取，推迟整理
    var newAttrs = {},
        newChildren = [];

    if (isString(tagName)) {
      // 如果tagName表示是一个结点
      // 由于指令等写法灵活
      // 我们可以在这里对attrs进行整理
      for (var key in attrs) {
        // 如果是简化的@event方法
        if (/^@/.test(key)) {
          newAttrs[key.replace(/^@/, 'q-on:')] = attrs[key];
        } // 如果是简化的:attr=""
        else if (/^:/.test(key)) {
            newAttrs['q-bind' + key] = attrs[key];
          } // 其它的是普通的
          else {
              newAttrs[key] = attrs[key];
            }
      } // 当然，children中可能是字符串类型的文本结点
      // 而这些文本结点可能包含{{}}这样的等
      // 为了提高后续的运算
      // 我们在这里提前标记好


      var child;

      for (var i = 0; i < children.length; i++) {
        child = children[i];

        if (isString(child)) {
          if (/\{\{[^}]+\}\}/.test(child)) {
            // 非普通文本我们把类似
            // "xxx{{???}}xxx"
            // 变成
            // "xxx"+???+"xxx"
            // 这样可以通过在特定上下文下执行获得最终的值
            // helper.js里面的compilerText方法提供此功能
            newChildren.push({
              type: 'bindText',
              content: ("\" " + child + " \"").replace(/\{\{([^}]+)\}\}/g, "\"+$1+\"")
            });
          } else {
            // 普通文本和bind文本区别开的目的是加速计算
            // 针对普通文本
            // 控制器的数据改变不需要去理会这里的内容
            newChildren.push({
              type: 'text',
              content: child
            });
          }
        } else {
          // 非字符串，也就是非文本的结点
          newChildren.push(child);
        }
      }
    } else {
      return {
        // 一共分这几类：
        // 1.component组件
        // 2.tag普通标签
        // 3.text普通文本
        // 4.bindText存在动态文本
        // 其中none为未分配类型，表示需要进一步确认
        type: 'component',
        options: tagName,
        attrs: {},
        children: []
      };
    }

    return {
      type: 'none',
      tagName: tagName,
      attrs: newAttrs,
      children: newChildren
    };
  } // 把类似'DIV'、'ui-router'和'UI-ROUTER'等分别变成'div','uiRouter','uiRouter'等


  function templateToName(tagName) {
    var lowerString = (tagName + "").toLowerCase();
    var upperString = (tagName + "").toUpperCase();
    var newTagName = "",
        accept_ = false;

    for (var i = 0; i < tagName.length; i++) {
      if (tagName[i] != "-") {
        if (accept_) {
          newTagName += upperString[i];
          accept_ = false;
        } else {
          newTagName += lowerString[i];
        }
      } else {
        accept_ = true;
      }
    }

    return newTagName;
  }

  var $RegExp = {
    // 空白字符:http://www.w3.org/TR/css3-selectors/#whitespace
    blankReg: new RegExp("[\\x20\\t\\r\\n\\f]"),
    blanksReg: /^[\x20\t\r\n\f]{0,}$/,
    // 标志符
    identifier: /^[a-zA-Z_$][0-9a-zA-Z_$]{0,}$/
  }; // 把表达式按照最小单位切割
  // 后续我们的任务就是对这个数组进行归约即可(归约交付给别的地方，这里不继续处理)

  /**
   * 例如：
   *  target={
   *      a:{
   *              value:9
   *         },
   *      b:7,
   *      flag:'no'
   *  }
   *  express= "a.value>10 && b< 11 ||flag=='yes'"
   * 变成数组以后应该是：
   *
   * // 比如最后的yes@value表示这是一个最终的值，不需要再计算了
   * ['a','[@value','value@value',']@value','>@value','10@value','&&@value','b','<@value','||@value','flag','==@value','yes@value']
   *
   * 然后，进一步解析得到：
   * [{value:9},'[','value',']','>',10,'&&',7,'<','||','no','==','yes']
   *
   * (当然，我们实际运算的时候，可能和这里不完全一致，这里只是为了方便解释我们的主体思想)
   *
   * 然后我们返回上面的结果即可！
   */
  // 除了上述原因，统一前置处理还有一个好处就是：
  // 可以提前对部分语法错误进行报错，方便定位调试
  // 因为后续的操作越来越复杂，错误越提前越容易定位

  var specialCode1 = ['+', '-', '*', '/', '%', '&', '|', '!', '?', ':', '[', ']', '(', ")", '>', '<', '='];
  var specialCode2 = ['+', '-', '*', '/', '%', '&', '|', '!', '?', ':', '>', '<', '=', '<=', '>=', '==', '===', '!=', '!=='];

  function analyseExpress(target, express, scope) {
    // 剔除开头和结尾的空白
    express = express.trim();
    var i = -1,
        // 当前面对的字符
    currentChar = null; // 获取下一个字符

    var next = function next() {
      currentChar = i++ < express.length - 1 ? express[i] : null;
      return currentChar;
    }; // 获取往后n个值


    var nextNValue = function nextNValue(n) {
      return express.substring(i, n + i > express.length ? express.length : n + i);
    };

    next();
    var expressArray = [];

    while (true) {
      if (i >= express.length) break; // 先匹配普通的符号
      // + - * / %
      // && || !
      // ? :
      // [ ] ( )
      // > < >= <= == === != !==
      // 如果是&或者|比较特殊

      if (specialCode1.indexOf(currentChar) > -1) {
        // 对于特殊的符号
        if (['&', '|', '='].indexOf(currentChar) > -1) {
          if (['==='].indexOf(nextNValue(3)) > -1) {
            expressArray.push(nextNValue(3));
            i += 2;
            next();
          } else if (['&&', '||', '=='].indexOf(nextNValue(2)) > -1) {
            expressArray.push(nextNValue(2));
            i += 1;
            next();
          } else {
            throw new Error("Illegal expression : " + express + "\nstep='analyseExpress',index=" + i);
          }
        } else {
          // 拦截部分比较特殊的
          if (['!=='].indexOf(nextNValue(3)) > -1) {
            expressArray.push(nextNValue(3));
            i += 2;
            next();
          } else if (['>=', '<=', '!='].indexOf(nextNValue(2)) > -1) {
            expressArray.push(nextNValue(2));
            i += 1;
            next();
          } // 普通的单一的
          else {
              expressArray.push(currentChar);
              next();
            }
        }
      } // 如果是字符串
      else if (['"', "'"].indexOf(currentChar) > -1) {
          var temp = "",
              beginTag = currentChar;
          next(); // 如果没有遇到结束标签
          // 目前没有考虑 '\'' 这种带转义字符的情况，当然，'\"'这种是支持的
          // 后续如果希望支持，优化这里即可

          while (currentChar != beginTag) {
            if (i >= express.length) {
              // 如果还没有遇到结束标识就结束了，属于字符串未闭合错误
              throw new Error("String unclosed error : " + express + "\nstep='analyseExpress',index=" + i);
            } // 继续拼接


            temp += currentChar;
            next();
          }

          expressArray.push(temp + "@string");
          next();
        } // 如果是数字
        else if (/\d/.test(currentChar)) {
            var dotFlag = 'no'; // no表示还没有匹配到.，如果已经匹配到了，标识为yes，如果匹配到了.，可是后面还没有遇到数组，标识为error

            var temp = currentChar;
            next();

            while (i < express.length) {
              if (/\d/.test(currentChar)) {
                temp += currentChar;
                if (dotFlag == 'error') dotFlag = 'yes';
              } else if ('.' == currentChar && dotFlag == 'no') {
                temp += currentChar;
                dotFlag = 'error';
              } else {
                break;
              }

              next();
            } // 如果小数点后面没有数字，辅助添加一个0


            if (dotFlag == 'error') temp += "0";
            expressArray.push(+temp);
          } // 如果是特殊符号
          // 也就是类似null、undefined等
          else if (['null', 'true'].indexOf(nextNValue(4)) > -1) {
              expressArray.push({
                "null": null,
                "true": true
              }[nextNValue(4)]);
              i += 3;
              next();
            } else if (['false'].indexOf(nextNValue(5)) > -1) {
              expressArray.push({
                'false': false
              }[nextNValue(5)]);
              i += 4;
              next();
            } else if (['undefined'].indexOf(nextNValue(9)) > -1) {
              expressArray.push({
                "undefined": undefined
              }[nextNValue(9)]);
              i += 8;
              next();
            } // 如果是空格
            else if ($RegExp.blankReg.test(currentChar)) {
                do {
                  next();
                } while ($RegExp.blankReg.test(currentChar) && i < express.length);
              } else {
                var dot = false; // 对于开头有.进行特殊捕获，因为有.意味着这个值应该可以变成['key']的形式
                // 这是为了和[key]进行区分，例如：
                // .key 等价于 ['key'] 翻译成这里就是 ['[','key',']']
                // 可是[key]就不一样了，翻译成这里以后应该是 ['[','这个值取决当前对象和scope',']']
                // 如果这里不进行特殊处理，后续区分需要额外的标记，浪费资源

                if (currentChar == '.') {
                  dot = true;
                  next();
                } // 如果是标志符

                /**
                 *  命名一个标识符时需要遵守如下的规则：
                 *  1.标识符中可以含有字母 、数字 、下划线_ 、$符号
                 *  2.标识符不能以数字开头
                 */
                // 当然，是不是关键字等我们就不校对了，因为没有太大的实际意义
                // 也就是类似flag等局部变量


                if ($RegExp.identifier.test(currentChar)) {
                  var len = 1;

                  while (i + len <= express.length && $RegExp.identifier.test(nextNValue(len))) {
                    len += 1;
                  }

                  if (dot) {
                    expressArray.push('[');
                    expressArray.push(nextNValue(len - 1) + '@string');
                    expressArray.push(']');
                  } else {
                    var tempKey = nextNValue(len - 1); // 如果不是有前置.，那就是需要求解了

                    var tempValue = tempKey in scope ? scope[tempKey] : target[tempKey];
                    expressArray.push(isString(tempValue) ? tempValue + "@string" : tempValue);
                  }

                  i += len - 2;
                  next();
                } // 都不是，那就是错误
                else {
                    throw new Error("Illegal express : " + express + "\nstep='analyseExpress',index=" + i);
                  }
              }
    } // 实际情况是，对于-1等特殊数字，可能存在误把1前面的-号作为运算符的错误，这里拦截校对一下


    var length = 0;

    for (var j = 0; j < expressArray.length; j++) {
      if (["+", "-"].indexOf(expressArray[j]) > -1 && ( // 如果前面的也是运算符或开头，这个应该就不应该是运算符了
      j == 0 || specialCode2.indexOf(expressArray[length - 1]) > -1)) {
        expressArray[length++] = +(expressArray[j] + expressArray[j + 1]);
        j += 1;
      } else {
        expressArray[length++] = expressArray[j];
      }
    }

    expressArray.length = length;
    return expressArray;
  }

  var getExpressValue = function getExpressValue(value) {
    // 这里是计算的内部，不需要考虑那么复杂的类型
    if (typeof value == 'string') return value.replace(/@string$/, '');
    return value;
  };

  var setExpressValue = function setExpressValue(value) {
    if (typeof value == 'string') return value + "@string";
    return value;
  };

  function evalValue(expressArray) {
    // 采用按照优先级顺序归约的思想进行
    // 需要明白，这里不会出现括号
    // （小括号或者中括号，当然，也不会有函数，这里只会有最简单的表达式）
    // 这也是我们可以如此归约的前提
    // + - * / %
    // && || !
    // ? :
    // > < >= <= == === != !==
    // !
    // 因为合并以后数组长度一定越来越短，我们直接复用以前的数组即可
    var length = 0,
        i = 0;

    for (; i < expressArray.length; i++) {
      if (expressArray[i] == '!') {
        // 由于是逻辑运算符，如果是字符串，最后的@string是否去掉已经没有意义了
        expressArray[length] = !expressArray[++i];
      } else expressArray[length] = expressArray[i];

      length += 1;
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length; // * / %

    length = 0;

    for (i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '*') {
        // 假设不知道一定正确，主要是为了节约效率，是否提供错误提示，再议
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) * getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '/') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) / getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '%') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) % getExpressValue(expressArray[++i]);
      } else {
        // 上面不会导致数组增长
        expressArray[length++] = expressArray[i];
      }
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length; // + -

    length = 0;

    for (i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '+') {
        expressArray[length - 1] = setExpressValue(getExpressValue(expressArray[length - 1]) + getExpressValue(expressArray[++i]));
      } else if (expressArray[i] == '-') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) - getExpressValue(expressArray[++i]);
      } else expressArray[length++] = expressArray[i];
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length; // > < >= <=

    length = 0;

    for (i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '>') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) > getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '<') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) < getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '<=') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) <= getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '>=') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) >= getExpressValue(expressArray[++i]);
      } else expressArray[length++] = expressArray[i];
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length; // == === != !==

    length = 0;

    for (i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '==') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) == getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '===') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) === getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '!=') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) != getExpressValue(expressArray[++i]);
      } else if (expressArray[i] == '!==') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) !== getExpressValue(expressArray[++i]);
      } else expressArray[length++] = expressArray[i];
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length; // && ||

    length = 0;

    for (i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '&&') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) && getExpressValue(expressArray[1 + i]);
        i += 1;
      } else if (expressArray[i] == '||') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) || getExpressValue(expressArray[1 + i]);
        i += 1;
      } else expressArray[length++] = expressArray[i];
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length; // ?:

    length = 0;

    for (i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '?') {
        expressArray[length - 1] = getExpressValue(expressArray[length - 1]) ? getExpressValue(expressArray[i + 1]) : getExpressValue(expressArray[i + 3]);
        i += 3;
      } else expressArray[length++] = expressArray[i];
    }

    if (length == 1) return getExpressValue(expressArray[0]);
    expressArray.length = length;
    throw new Error('Unrecognized expression : [' + expressArray.toString() + "]");
  }

  function calcValue(target, expressArray, scope) {
    var value = expressArray[0] in scope ? scope[expressArray[0]] : target[expressArray[0]];

    for (var i = 1; i < expressArray.length; i++) {
      try {
        value = value[expressArray[i]];
      } catch (e) {
        console.error({
          target: target,
          scope: scope,
          expressArray: expressArray,
          index: i
        });
        throw e;
      }
    }

    return value;
  } // 小括号去除方法


  var doit1 = function doit1(target, expressArray, scope) {
    // 先消小括号
    // 其实也就是归约小括号
    if (expressArray.indexOf('(') > -1) {
      var newExpressArray = [],
          temp = [],
          // 0表示还没有遇到左边的小括号
      // 1表示遇到了一个，以此类推，遇到一个右边的会减1
      flag = 0;

      for (var i = 0; i < expressArray.length; i++) {
        if (expressArray[i] == '(') {
          if (flag > 0) {
            // 说明这个应该是需要计算的括号里面的括号
            temp.push('(');
          }

          flag += 1;
        } else if (expressArray[i] == ')') {
          if (flag > 1) temp.push(')');
          flag -= 1; // 为0说明主的小括号归约结束了

          if (flag == 0) {
            var _value = evalValue(doit1(target, temp));

            newExpressArray.push(isString(_value) ? _value + '@string' : _value);
            temp = [];
          }
        } else {
          if (flag > 0) temp.push(expressArray[i]);else newExpressArray.push(expressArray[i]);
        }
      }

      expressArray = newExpressArray;
    } // 去掉小括号以后，调用中括号去掉方法


    return doit2(expressArray);
  }; // 中括号嵌套去掉方法


  var doit2 = function doit2(expressArray) {
    var hadMore = true;

    while (hadMore) {
      hadMore = false;
      var newExpressArray = [],
          temp = [],
          // 如果为true表示当前在试探寻找归约最小单元的结束
      flag = false; // 开始寻找里面需要归约的最小单元（也就是可以立刻获取值的）

      for (var i = 0; i < expressArray.length; i++) {
        // 这说明这是一个需要归约的
        // 不过不一定是最小单元
        // 遇到了，先记下了
        if (expressArray[i] == '[' && i != 0 && expressArray[i - 1] != ']') {
          if (flag) {
            // 如果之前已经遇到了，说明之前保存的是错误的，需要同步会主数组
            newExpressArray.push('[');

            for (var j = 0; j < temp.length; j++) {
              newExpressArray.push(temp[j]);
            }
          } else {
            // 如果之前没有遇到，修改标记即可
            flag = true;
          }

          temp = [];
        } // 如果遇到了结束，这说明当前暂存的就是最小归结单元
        // 计算后放回主数组
        else if (expressArray[i] == ']' && flag) {
            hadMore = true; // 计算

            var tempValue = evalValue(temp);
            var _value = newExpressArray[newExpressArray.length - 1][tempValue];
            newExpressArray[newExpressArray.length - 1] = isString(_value) ? _value + "@string" : _value; // 状态恢复

            flag = false;
          } else {
            if (flag) {
              temp.push(expressArray[i]);
            } else {
              newExpressArray.push(expressArray[i]);
            }
          }
      }

      expressArray = newExpressArray;
    }

    return expressArray;
  }; // 路径
  // ["[",express,"]","[",express"]","[",express,"]"]
  // 变成
  // [express][express][express]


  var doit3 = function doit3(expressArray) {
    var newExpressArray = [],
        temp = [];

    for (var i = 0; i < expressArray.length; i++) {
      if (expressArray[i] == '[') {
        temp = [];
      } else if (expressArray[i] == ']') {
        newExpressArray.push(evalValue(temp));
      } else {
        temp.push(expressArray[i]);
      }
    }

    return newExpressArray;
  }; // 获取路径数组(核心是归约的思想)


  function toPath(target, expressArray, scope) {
    var newExpressArray = doit1(target, expressArray); // 其实无法就三类
    // 第一类：[express][express][express]express
    // 第二类：express
    // 第三类：[express][express][express]

    var path; // 第二类

    if (newExpressArray[0] != '[') {
      path = [evalValue(newExpressArray)];
    } // 第三类
    else if (newExpressArray[newExpressArray.length - 1] == ']') {
        path = doit3(newExpressArray);
      } // 第一类
      else {
          var lastIndex = newExpressArray.lastIndexOf(']');
          var tempPath = doit3(newExpressArray.slice(0, lastIndex + 1));
          var tempArray = newExpressArray.slice(lastIndex + 1);
          tempArray.unshift(calcValue(target, tempPath, scope));
          path = [evalValue(tempArray)];
        }

    return path;
  }
  /*!
   * 🔪 - 设置或获取指定对象上字符串表达式对应的值
   * https://github.com/hai2007/algorithm.js/blob/master/value.js
   *
   * author hai2007 < https://hai2007.gitee.io/sweethome >
   *
   * Copyright (c) 2020-present hai2007 走一步，再走一步。
   * Released under the MIT license
   */

  /**
   * express举例子：
   *
   * [00]  ["a"].b[c]
   * [01]  a
   * [02]  [0]['value-index'][index+1]
   *
   * 如果是getValue,express还可以包含运算符：
   *  + - * / %  数值运算符
   *  && || !    逻辑运算符
   *
   * [03]  flag+10
   * [04]  a.b[index+1]-10
   * [05]  (a+b)/10-c[d]
   * [06]  [((a+b)-c)*f]+d
   *
   * [07]  !flag
   * [08]  (a>0 && b<=1) || !flag
   * [09]  '(flag)' == "("+temp+")"
   * [10]  a>10?"flag1":"flag2"
   *
   */
  // 解析一段表达式


  var evalExpress = function evalExpress(target, express, scope) {
    if (arguments.length < 3) scope = {};
    var expressArray = analyseExpress(target, express, scope);
    var path = toPath(target, expressArray, scope); // 如果不是表达式

    if (path.length > 1) throw new Error("Illegal expression : " + express + "\nstep='evalExpress',path=" + path + ",expressArray=" + expressArray);
    return path[0];
  }; // 设置


  var setValue = function setValue(target, express, value, scope) {
    if (arguments.length < 3) scope = {};
    var expressArray = analyseExpress(target, express, scope);
    var path = toPath(target, expressArray, scope);
    var _target = target;

    for (var i = 0; i < path.length - 1; i++) {
      // 如果需要补充
      if (!(path[i] in _target)) _target[path[i]] = isArray(_target) ? [] : {}; // 拼接下一个

      _target = _target[path[i]];
    }

    _target[path[path.length - 1]] = value;
    return target;
  }; // 替换DOM


  function replaceDom(oldEl, newEl) {
    oldEl.parentNode.replaceChild(newEl, oldEl);
  } // 绑定事件


  function bindEvent(dom, eventType, callback) {
    if (window.attachEvent) {
      dom.attachEvent("on" + eventType, callback); // 后绑定的先执行
    } else {
      dom.addEventListener(eventType, callback, false); // 捕获
    }
  } // 解除绑定


  function unbindEvent(dom, eventType, handler) {
    if (window.detachEvent) {
      dom.detachEvent("on" + eventType, handler);
    } else {
      dom.removeEventListener(eventType, handler, false); // 捕获
    }
  } // 阻止冒泡


  function stopPropagation(event) {
    event = event || window.event;

    if (event.stopPropagation) {
      //这是其他非IE浏览器
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  } // 阻止默认事件


  function preventDefault(event) {
    event = event || window.event;

    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  } // 挂载结点的任务主要有以下内容：
  // 1.生成真实dom并挂载好
  // 2.收集指令，过滤器和组件信息（根据全局和局部的，进行抽取和校验），在数据更新的时候启动更新
  // 3.当前组件和父亲组件，包括子组件，还有事件等，在必要的时候挂载或启动，还有什么时候应该销毁等信息的登记


  function mountDom(that, key, pEl, QuickPaper) {
    var vnode = evalExpress(that, key),
        el;

    if (!vnode) {
      console.error('vnode is undefined!');
      return;
    } // 如果是none，需要提前分类


    if (vnode.type == 'none') {
      var ttc = templateToName(vnode.tagName);

      if (that.__componentLib[ttc] || that.__componentLib_scope[ttc]) {
        vnode.options = that.__componentLib[ttc] || that.__componentLib_scope[ttc];
        vnode.type = 'component';
      } else {
        vnode.type = 'tag';
      }
    } // 1.组件


    if (vnode.type == 'component') {
      el = document.createElement('quick-paper-component');
      pEl.appendChild(el);
      vnode.options.el = el;
      if (!('render' in vnode.options)) vnode.options.render = function (createElement) {
        return createElement('quick-paper-component', {}, []);
      }; // 这相当于子组件，挂载好了以后，启动即可

      vnode.instance = new QuickPaper(vnode.options);
      vnode.instance.__parent = that; // 校对组件上的属性

      var attrs = {};

      for (var _key4 in vnode.attrs) {
        if (!/^data-quickpaper-/.test(_key4)) {
          if (/^:/.test(_key4)) {
            attrs[_key4.replace('q-bind' + _key4)] = vnode.attrs[_key4];
          } else if (/^@/.test(_key4)) {
            attrs[_key4.replace(_key4.replace(/^@/, 'q-on:'))] = vnode.attrs[_key4];
          } else {
            attrs[_key4] = vnode.attrs[_key4];
          }
        }
      }

      var _component = {
        attrs: attrs,
        instance: vnode.instance
      }; // 对于内置的动态组件进行调用，其余的组件当前是隔绝的

      if (_component.instance._name == "component") {
        var pageKey = _component.attrs['q-bind:is'];

        _component.instance.lister(QuickPaper, that[pageKey]);
      } // 记录组件


      that.__componentTask.push(_component);
    } // 2.普通标签
    else if (vnode.type == 'tag') {
        el = document.createElement(vnode.tagName);

        if (pEl.nodeName == 'Quick-Paper-COMPONENT' || pEl._nodeName == 'Quick-Paper-COMPONENT') {
          // 作为临时占位的结点，我们应该替换而不是追加
          replaceDom(pEl, el);
          that._el = el;
        } else {
          pEl.appendChild(el);
        }
        /**
         * 组件的属性，包括通过属性传递数据等先不考虑
         * 我们目前只支持普通标签上的指令
         */


        for (var _key5 in vnode.attrs) {
          var value = vnode.attrs[_key5];

          var names = (_key5 + ":").split(':');

          var directive = that.__directiveLib[templateToName(names[0])] || that.__directiveLib_scope[templateToName(names[0])]; // 如果是指令


          if (directive) {
            that.__directiveTask.push(_objectSpread(_objectSpread({
              el: el
            }, directive), {}, {
              value: value,
              type: names[1]
            }));
          } // 普通属性的话，直接设置即可
          else {
              el.setAttribute(_key5, value);
            }
        } // 挂载好父亲以后，挂载孩子


        for (var i = 0; i < vnode.children.length; i++) {
          mountDom(that, key + ".children[" + i + "]", el, QuickPaper);
        }
      } // 3.普通文本
      else if (vnode.type == 'text') {
          el = document.createTextNode("");
          el.textContent = vnode.content.replace(/↵/g, '\n');
          pEl.appendChild(el);
        } // 4.绑定文本
        else if (vnode.type == 'bindText') {
            el = document.createTextNode("");
            el.textContent = evalExpress(that, vnode.content).replace(/↵/g, '\n');
            pEl.appendChild(el);

            that.__bindTextTask.push({
              el: el,
              content: vnode.content
            });
          } // 其它应该抛错
          else {
              console.error('Type not expected：' + vnode.type);
            }
  }

  function watcher(that) {
    var _loop = function _loop(key) {
      // 由于key的特殊性，注册前需要进行校验
      isValidKey(key);

      if (isFunction(that[key])) {
        console.error('Data property "' + key + '" has already been defined as a Method.');
      }

      var value = that._data[key];
      that[key] = value; // 针对data进行拦截，后续对data的数据添加不会自动监听了
      // this._data的数据是初始化以后的，后续保持不变，方便组件被重新使用（可能的设计，当前预留一些余地）
      // 当前对象数据会和方法一样直接挂载在根节点

      Object.defineProperty(that, key, {
        get: function get() {
          return value;
        },
        set: function set(newValue) {
          value = newValue; // 数据改变，触发更新

          that.$$updateComponent();
        }
      });
    };

    for (var key in that._data) {
      _loop(key);
    }
  }

  function renderMixin(QuickPaper) {
    // 根据render生成dom挂载到挂载点
    // 并调用watcher启动数据监听
    // 并调用events方法开启@事件注册
    // 并记录其中的组件，指令和{{}}等
    QuickPaper.prototype.$$mountComponent = function () {
      this.$$lifecycle('beforeMount');
      /**
       * 挂载的意义就是由当前组件来管理和调度一片区域
       */
      // 获取虚拟结点

      this._vnode = this.$$render(createElement);
      this.__directiveTask = [];
      this.__componentTask = [];
      this.__bindTextTask = []; // 以指令为例，指令在挂载的真实DOM销毁的时候，应该主动销毁自己
      // 类似这样的管理应该由指令自己提供

      mountDom(this, '_vnode', this._el, QuickPaper); // 执行指令：inserted

      for (var i = 0; i < this.__directiveTask.length; i++) {
        var directive = this.__directiveTask[i];

        if (isFunction(directive.inserted)) {
          var directiveValue = void 0;

          try {
            directiveValue = evalExpress(this, directive.value);
          } catch (e) {}

          directive.inserted(directive.el, {
            target: this,
            exp: directive.value,
            value: directiveValue,
            type: directive.type
          });
        }
      } // 挂载好了以后，启动监听


      watcher(this); // 标记已经挂载

      this.__isMounted = true;
      this.$$lifecycle('mounted');
    }; // 第一次或数据改变的时候，更新页面


    QuickPaper.prototype.$$updateComponent = function () {
      this.$$lifecycle('beforeUpdate'); // 执行指令：update

      for (var i = 0; i < this.__directiveTask.length; i++) {
        var directive = this.__directiveTask[i];

        if (isFunction(directive.update)) {
          var directiveValue = void 0;

          try {
            directiveValue = evalExpress(this, directive.value);
          } catch (e) {}

          directive.update(directive.el, {
            target: this,
            exp: directive.value,
            value: directiveValue,
            type: directive.type
          });
        }
      } // 更新{{}}


      for (var _i = 0; _i < this.__bindTextTask.length; _i++) {
        var bindText = this.__bindTextTask[_i];
        var content = evalExpress(this, bindText.content).replace(/↵/g, '\n');

        if (bindText.el.textContent != content) {
          bindText.el.textContent = content;
        }
      } // 更新组件挂载点的属性


      for (var _i2 = 0; _i2 < this.__componentTask.length; _i2++) {
        var _component2 = this.__componentTask[_i2]; // 对于内置的动态组件进行调用，其余的组件当前是隔绝的

        if (_component2.instance._name == "component") {
          var pageKey = _component2.attrs['q-bind:is'];

          _component2.instance.lister(QuickPaper, this[pageKey]);
        }
      }

      this.$$lifecycle('updated');
    }; // 销毁组件，释放资源


    QuickPaper.prototype.$$destroyComponent = function () {
      this.$$lifecycle('beforeDestroy'); // 执行指令：delete

      for (var i = 0; i < this.__directiveTask.length; i++) {
        var directive = this.__directiveTask[i];

        if (isFunction(directive["delete"])) {
          directive["delete"](directive.el, {
            target: this,
            exp: directive.value,
            value: evalExpress(this, directive.value),
            type: directive.type
          });
        }
      }

      this.$$lifecycle('destroyed');
    };
  }

  function QuickPaper(options) {
    if (!(this instanceof QuickPaper)) {
      throw new Error('QuickPaper is a constructor and should be called with the `new` keyword');
    }

    this._name = options.name || "noname";
    this.$$lifecycle(options.beforeCreate); // 初始化对象

    this.$$init(options);
    this.$$lifecycle('created'); // 如果没有设置挂载点
    // 表示该组件不挂载
    // 不挂载的话，render或template也不会去解析
    // 或许可以在一定阶段以后，再主动去挂载，这样有益于提高效率

    if (isElement(this._el)) {
      // 挂载组件到页面
      this.$$mount();
    }
  } // 混入几大核心功能的处理方法


  initMixin(QuickPaper); // 初始化对象

  lifecycleMixin(QuickPaper); // 和组件的生命周期相关调用

  renderMixin(QuickPaper); // 组件渲染或更新相关

  function mount(QuickPaper) {
    // 挂载指令
    QuickPaper.directive = function (name, options) {
      /*
       [生命周期]
        1.inserted:指令生效的时候
        2.update:被绑定于元素所在的组件中有数据更新时调用，而无论绑定值是否变化
        3.delete:只调用一次，指令与元素解绑时调用
      */
      QuickPaper.prototype.__directiveLib[name] = options;
    }; // 挂载组件


    QuickPaper.component = function (name, options) {
      QuickPaper.prototype.__componentLib[name] = options;
    };
  }

  function use(QuickPaper) {
    // 补充原型方法
    QuickPaper.use = function (extend) {
      extend.install.call(extend, QuickPaper);
    };
  }

  function initGlobalAPI(QuickPaper) {
    // 登记扩展内容
    QuickPaper.prototype.__directiveLib = {};
    QuickPaper.prototype.__componentLib = {}; // 挂载

    mount(QuickPaper);
    use(QuickPaper);
  }

  var update = function update(el, binding) {
    // 如果有type表示给属性赋值
    if (isString(binding.type) && binding.type.length > 0) {
      if (el.getAttribute(binding.type) != binding.value) {
        el.setAttribute(binding.type, binding.value);
      }
    } // 否则是设置内容或值
    else {
        if (el.value != binding.value || el.textContent != binding.value) {
          el.value = el.textContent = binding.value;
        }
      }
  };

  var qBind = {
    inserted: update,
    update: update
  };
  /**
   * [可以使用的修饰符]
   * .prevent 阻止默认事件
   * .stop    阻止冒泡
   * .once    只执行一次
   */

  var qOn = {
    inserted: function inserted(el, binding) {
      var types = binding.type.split('.'),
          modifier = {
        "prevent": false,
        "stop": false,
        "once": false
      },
          callback = function callback(event) {
        if (modifier.stop) stopPropagation(event);
        if (modifier.prevent) preventDefault(event);
        var exps = /^([^(]+)(\([^)]{0,}\)){0,1}/.exec(binding.exp),
            params = [],
            oralParams = [];

        if (exps[2]) {
          // 获取原始的数据
          var temp = exps[2].replace(/^\(/, '').replace(/\)$/, '').trim();

          if (temp.length > 0) {
            oralParams = temp.split(',');
          }
        } // 解析


        for (var i = 0; i < oralParams.length; i++) {
          var param = oralParams[i];
          param = evalExpress(binding.target, param);
          params.push(param);
        } // 追加事件event


        params.push(event);
        binding.target[exps[1]].apply(binding.target, params);

        if (modifier.once) {
          unbindEvent(el, types[0], callback);
        }
      };

      for (var i = 1; i < types.length; i++) {
        modifier[types[i]] = true;
      }

      bindEvent(el, types[0], callback);
    }
  };
  var qModel = {
    inserted: function inserted(el, binding) {
      el.value = binding.value;
      bindEvent(el, 'input', function () {
        setValue(binding.target, "." + binding.exp, el.value);
      });
    },
    update: function update(el, binding) {
      el.value = binding.value;
    }
  };
  var component = {
    name: "component",
    data: function data() {
      return {
        is: null
      };
    },
    methods: {
      lister: function lister(QuickPaper, newIS) {
        // 如果动态组件没有改变
        if (newIS == this.is || newIS == null) return;
        var oldComponent = this._oldComponent;
        if (oldComponent) oldComponent.$$lifecycle("beforeDestroy");
        this.is = newIS;
        var options = newIS;
        options.el = this._el; // 标记替换而不是追加

        options.el._nodeName = 'Quick-Paper-COMPONENT'; // 重定向挂载点

        this._oldComponent = new QuickPaper(options);
        this._el = this._oldComponent._el;

        if (oldComponent) {
          oldComponent.$$lifecycle("destroyed");
          oldComponent = null;
        }
      }
    }
  };
  /**
   * 备注：
   * $$开头的表示内部方法，__开头的表示内部资源
   * $开头的表示对外暴露的内置方法，_开头表示的是对外只读的内置资源
   * =========================================
   * 整合全部资源，对外暴露调用接口
   */
  // 挂载全局方法

  initGlobalAPI(QuickPaper);
  QuickPaper.directive('qBind', qBind);
  QuickPaper.directive('qOn', qOn);
  QuickPaper.directive('qModel', qModel);
  QuickPaper.component('component', component); // 把组件挂载到页面中去

  QuickPaper.prototype.$$mount = function () {
    if (isFunction(this._options.render)) {
      // 记录render
      // 这样写是为了方便后期如何对render添加兼容好改造
      this.$$render = this._options.render; // 准备好以后挂载

      this.$$mountComponent();
    } else {
      throw new Error("options.render needs to be a function");
    }
  };
  /*!
   * 💡 - 提供常用的DOM操作方法
   * https://github.com/hai2007/tool.js/blob/master/xhtml.js
   *
   * author hai2007 < https://hai2007.gitee.io/sweethome >
   *
   * Copyright (c) 2021-present hai2007 走一步，再走一步。
   * Released under the MIT license
   */
  // 命名空间路径


  var namespace = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  /**
   * 结点操作补充
   */

  var xhtml = {
    // 阻止冒泡
    "stopPropagation": function stopPropagation(event) {
      event = event || window.event;

      if (event.stopPropagation) {
        //这是其他非IE浏览器
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    },
    // 阻止默认事件
    "preventDefault": function preventDefault(event) {
      event = event || window.event;

      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    },
    // 判断是否是结点
    "isNode": function isNode(param) {
      return param && (param.nodeType === 1 || param.nodeType === 9 || param.nodeType === 11);
    },
    // 绑定事件
    "bind": function bind(dom, eventType, callback) {
      if (dom.constructor === Array || dom.constructor === NodeList) {
        for (var i = 0; i < dom.length; i++) {
          this.bind(dom[i], eventType, callback);
        }

        return;
      }

      if (window.attachEvent) dom.attachEvent("on" + eventType, callback);else dom.addEventListener(eventType, callback, false);
    },
    // 去掉绑定事件
    "unbind": function unbind(dom, eventType, handler) {
      if (dom.constructor === Array || dom.constructor === NodeList) {
        for (var i = 0; i < dom.length; i++) {
          this.unbind(dom[i], eventType, handler);
        }

        return;
      }

      if (window.detachEvent) dom.detachEvent('on' + eventType, handler);else dom.removeEventListener(eventType, handler, false);
    },
    // 在当前上下文context上查找结点
    // selectFun可选，返回boolean用以判断当前面对的结点是否保留
    "find": function find(context, selectFun, tagName) {
      if (!this.isNode(context)) return [];
      var nodes = context.getElementsByTagName(tagName || '*');
      var result = [];

      for (var i = 0; i < nodes.length; i++) {
        if (this.isNode(nodes[i]) && (typeof selectFun != "function" || selectFun(nodes[i]))) result.push(nodes[i]);
      }

      return result;
    },
    // 寻找当前结点的孩子结点
    // selectFun可选，返回boolean用以判断当前面对的结点是否保留
    "children": function children(dom, selectFun) {
      var nodes = dom.childNodes;
      var result = [];

      for (var i = 0; i < nodes.length; i++) {
        if (this.isNode(nodes[i]) && (typeof selectFun != "function" || selectFun(nodes[i]))) result.push(nodes[i]);
      }

      return result;
    },
    // 判断结点是否有指定class
    // clazzs可以是字符串或数组字符串
    // notStrict可选，boolean值，默认false表示结点必须包含全部class,true表示至少包含一个即可
    "hasClass": function hasClass(dom, clazzs, notStrict) {
      if (clazzs.constructor !== Array) clazzs = [clazzs];
      var class_str = " " + (dom.getAttribute('class') || "") + " ";

      for (var i = 0; i < clazzs.length; i++) {
        if (class_str.indexOf(" " + clazzs[i] + " ") >= 0) {
          if (notStrict) return true;
        } else {
          if (!notStrict) return false;
        }
      }

      return true;
    },
    // 删除指定class
    "removeClass": function removeClass(dom, clazz) {
      var oldClazz = " " + (dom.getAttribute('class') || "") + " ";
      var newClazz = oldClazz.replace(" " + clazz.trim() + " ", " ");
      dom.setAttribute('class', newClazz.trim());
    },
    // 添加指定class
    "addClass": function addClass(dom, clazz) {
      if (this.hasClass(dom, clazz)) return;
      var oldClazz = dom.getAttribute('class') || "";
      dom.setAttribute('class', oldClazz + " " + clazz);
    },
    // 字符串变成结点
    // isSvg可选，boolean值，默认false表示结点是html，为true表示svg类型
    "toNode": function toNode(string, isSvg) {
      var frame; // html和svg上下文不一样

      if (isSvg) frame = document.createElementNS(namespace.svg, 'svg');else frame = document.createElement("div"); // 低版本浏览器svg没有innerHTML，考虑是vue框架中，没有补充

      frame.innerHTML = string;
      var childNodes = frame.childNodes;

      for (var i = 0; i < childNodes.length; i++) {
        if (this.isNode(childNodes[i])) return childNodes[i];
      }
    },
    // 主动触发事件
    "trigger": function trigger(dom, eventType) {
      //创建event的对象实例。
      if (document.createEventObject) {
        // IE浏览器支持fireEvent方法
        dom.fireEvent('on' + eventType, document.createEventObject());
      } // 其他标准浏览器使用dispatchEvent方法
      else {
          var _event = document.createEvent('HTMLEvents'); // 3个参数：事件类型，是否冒泡，是否阻止浏览器的默认行为


          _event.initEvent(eventType, true, false);

          dom.dispatchEvent(_event);
        }
    },
    // 获取样式
    "getStyle": function getStyle(dom, name) {
      // 获取结点的全部样式
      var allStyle = document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(dom, null) : dom.currentStyle; // 如果没有指定属性名称，返回全部样式

      return typeof name === 'string' ? allStyle.getPropertyValue(name) : allStyle;
    },
    // 获取元素位置
    "offsetPosition": function offsetPosition(dom) {
      var left = 0;
      var top = 0;
      top = dom.offsetTop;
      left = dom.offsetLeft;
      dom = dom.offsetParent;

      while (dom) {
        top += dom.offsetTop;
        left += dom.offsetLeft;
        dom = dom.offsetParent;
      }

      return {
        "left": left,
        "top": top
      };
    },
    // 获取鼠标相对元素位置
    "mousePosition": function mousePosition(dom, event) {
      var bounding = dom.getBoundingClientRect();
      if (!event || !event.clientX) throw new Error('Event is necessary!');
      return {
        "x": event.clientX - bounding.left,
        "y": event.clientY - bounding.top
      };
    },
    // 删除结点
    "remove": function remove(dom) {
      dom.parentNode.removeChild(dom);
    },
    // 设置多个样式
    "setStyles": function setStyles(dom, styles) {
      for (var key in styles) {
        dom.style[key] = styles[key];
      }
    },
    // 获取元素大小
    "size": function size(dom, type) {
      var elemHeight, elemWidth;

      if (type == 'content') {
        //内容
        elemWidth = dom.clientWidth - (this.getStyle(dom, 'padding-left') + "").replace('px', '') - (this.getStyle(dom, 'padding-right') + "").replace('px', '');
        elemHeight = dom.clientHeight - (this.getStyle(dom, 'padding-top') + "").replace('px', '') - (this.getStyle(dom, 'padding-bottom') + "").replace('px', '');
      } else if (type == 'padding') {
        //内容+内边距
        elemWidth = dom.clientWidth;
        elemHeight = dom.clientHeight;
      } else if (type == 'border') {
        //内容+内边距+边框
        elemWidth = dom.offsetWidth;
        elemHeight = dom.offsetHeight;
      } else if (type == 'scroll') {
        //滚动的宽（不包括border）
        elemWidth = dom.scrollWidth;
        elemHeight = dom.scrollHeight;
      } else {
        elemWidth = dom.offsetWidth;
        elemHeight = dom.offsetHeight;
      }

      return {
        width: elemWidth,
        height: elemHeight
      };
    },
    // 在被选元素内部的结尾插入内容
    "append": function append(el, template) {
      var node = this.isNode(template) ? template : this.toNode(template);
      el.appendChild(node);
      return node;
    },
    // 在被选元素内部的开头插入内容
    "prepend": function prepend(el, template) {
      var node = this.isNode(template) ? template : this.toNode(template);
      el.insertBefore(node, el.childNodes[0]);
      return node;
    },
    // 在被选元素之后插入内容
    "after": function after(el, template) {
      var node = this.isNode(template) ? template : this.toNode(template);
      el.parentNode.insertBefore(node, el.nextSibling);
      return node;
    },
    // 在被选元素之前插入内容
    "before": function before(el, template) {
      var node = this.isNode(template) ? template : this.toNode(template);
      el.parentNode.insertBefore(node, el);
      return node;
    }
  };

  function createCommonjsModule(fn, module) {
    return module = {
      exports: {}
    }, fn(module, module.exports), module.exports;
  }

  var openWebEditor_min = createCommonjsModule(function (module) {
    function _toConsumableArray(e) {
      return _arrayWithoutHoles(e) || _iterableToArray(e) || _unsupportedIterableToArray(e) || _nonIterableSpread();
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _unsupportedIterableToArray(e, t) {
      if (!e) return;
      if (typeof e === "string") return _arrayLikeToArray(e, t);
      var n = Object.prototype.toString.call(e).slice(8, -1);
      if (n === "Object" && e.constructor) n = e.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(e);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(e, t);
    }

    function _iterableToArray(e) {
      if (typeof Symbol !== "undefined" && Symbol.iterator in Object(e)) return Array.from(e);
    }

    function _arrayWithoutHoles(e) {
      if (Array.isArray(e)) return _arrayLikeToArray(e);
    }

    function _arrayLikeToArray(e, t) {
      if (t == null || t > e.length) t = e.length;

      for (var n = 0, r = new Array(t); n < t; n++) {
        r[n] = e[n];
      }

      return r;
    }

    function _defineProperty(e, t, n) {
      if (t in e) {
        Object.defineProperty(e, t, {
          value: n,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        e[t] = n;
      }

      return e;
    }

    function _typeof(e) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function e(t) {
          return typeof t;
        };
      } else {
        _typeof = function e(t) {
          return t && typeof Symbol === "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
        };
      }

      return _typeof(e);
    }

    (function () {
      var e;

      function n(e) {
        var t = _typeof(e);

        return e != null && (t === "object" || t === "function");
      }

      var t = Object.prototype.toString;

      function r(e) {
        if (e == null) {
          return e === undefined ? "[object Undefined]" : "[object Null]";
        }

        return t.call(e);
      }

      function i(e) {
        var t = _typeof(e);

        return t === "string" || t === "object" && e != null && !Array.isArray(e) && r(e) === "[object String]";
      }

      function o(e) {
        if (!n(e)) {
          return false;
        }

        var t = r(e);
        return t === "[object Function]" || t === "[object AsyncFunction]" || t === "[object GeneratorFunction]" || t === "[object Proxy]";
      }

      function s(e) {
        if (e === null || _typeof(e) !== "object" || r(e) != "[object Object]") {
          return false;
        }

        if (Object.getPrototypeOf(e) === null) {
          return true;
        }

        var t = e;

        while (Object.getPrototypeOf(t) !== null) {
          t = Object.getPrototypeOf(t);
        }

        return Object.getPrototypeOf(e) === t;
      }

      var l = function e(t, n) {
        return n !== null && _typeof(n) === "object" && t.indexOf(n.nodeType) > -1 && !s(n);
      };

      var a = i;
      var f = o;

      var u = function e(t) {
        return Array.isArray(t);
      };

      var _ = function e(t) {
        return l([1, 9, 11], t);
      };

      var h = {
        stopPropagation: function e(t) {
          t = t || window.event;

          if (t.stopPropagation) {
            t.stopPropagation();
          } else {
            t.cancelBubble = true;
          }
        },
        preventDefault: function e(t) {
          t = t || window.event;

          if (t.preventDefault) {
            t.preventDefault();
          } else {
            t.returnValue = false;
          }
        },
        bind: function e(t, n, r) {
          if (window.attachEvent) {
            t.attachEvent("on" + n, r);
          } else {
            t.addEventListener(n, r, false);
          }
        },
        trigger: function e(t, n) {
          var r;

          if (document.createEventObject) {
            r = document.createEventObject();
            t.fireEvent("on" + n, r);
          } else {
            r = document.createEvent("HTMLEvents");
            r.initEvent(n, true, false);
            t.dispatchEvent(r);
          }
        },
        toNode: function e(t) {
          var n = document.createElement("div");
          n.innerHTML = t;
          var r = n.childNodes;

          for (var i = 0; i < r.length; i++) {
            if (_(r[i])) return r[i];
          }

          return null;
        },
        appendTo: function e(t, n) {
          var r = _(n) ? n : this.toNode(n);
          t.appendChild(r);
          return r;
        },
        prependTo: function e(t, n) {
          var r = _(n) ? n : this.toNode(n);
          t.insertBefore(r, t.childNodes[0]);
          return r;
        },
        remove: function e(t) {
          t.parentNode.removeChild(t);
        },
        after: function e(t, n) {
          var r = _(n) ? n : this.toNode(n);
          t.parentNode.insertBefore(r, t.nextSibling);
          return r;
        },
        css: function e(t, n) {
          for (var r in n) {
            t.style[r] = n[r];
          }
        },
        attr: function e(t, n) {
          for (var r in n) {
            t.setAttribute(r, n[r]);
          }
        },
        position: function e(t, n) {
          n = n || window.event;
          var r = t.getBoundingClientRect();
          if (!n || !n.clientX) throw new Error("Event is necessary!");
          var i = {
            x: n.clientX - r.left + t.scrollLeft,
            y: n.clientY - r.top + t.scrollTop
          };
          return i;
        },
        copy: function e(t, n, r) {
          var i = this.appendTo(document.body, "<textarea>" + t + "</textarea>");
          i.select();

          try {
            var o = window.document.execCommand("copy", false, null);

            if (o) {
              if (f(n)) n();
            } else {
              if (f(r)) r();
            }
          } catch (e) {
            if (f(r)) r(e);
          }

          document.body.removeChild(i);
        }
      };

      function c(e) {
        this.__helpCalcDOM.innerText = e;
        return this.__helpCalcDOM.offsetWidth;
      }

      function p(e, t) {
        if (arguments.length < 2) t = t || this.__lineNum;
        var n = this._contentArray[t];
        if (e <= 40) return 0;
        if (e - 40 >= this.$$textWidth(n)) return n.length;
        var r = e - 40,
            i = 1;

        for (; i < n.length; i++) {
          var o = Math.abs(e - 40 - this.$$textWidth(n.substr(0, i)));
          if (o > r) break;
          r = o;
        }

        return i - 1;
      }

      function d(e, t) {
        return {
          x: this.$$textWidth(this._contentArray[t].substr(0, e)),
          y: t * 21
        };
      }

      function m() {
        return this.__cursor1.lineNum != this.__cursor2.lineNum || this.__cursor1.leftNum != this.__cursor2.leftNum;
      }

      function y(e, t, n) {
        var r = this;
        var i = "";
        i += "<div style='min-width: fit-content;white-space: nowrap;line-height:21px;height:21px;'>";
        var o = n ? "font-size:0;" : "";
        i += "<em style='" + o + "color:" + this._colorNumber + ";user-select: none;display:inline-block;font-style:normal;width:35px;text-align:right;margin-right:5px;'>" + (t + 1) + "</em>";
        e.forEach(function (e) {
          var t = e.content;
          t = t.replace(/\&/g, "&amp;");
          t = t.replace(/</g, "&lt;");
          t = t.replace(/>/g, "&gt;");
          i += "<span style='user-select: none;font-weight:" + r._fontWeight + ";white-space: pre;color:" + e.color + "'>" + t + "</span>";
        });
        return i + "</div>";
      }

      function v(e) {
        return {
          leftNum: e.__leftNum,
          lineNum: e.__lineNum,
          x: e.__cursorLeft,
          y: e.__cursorTop,
          lineHeight: 21
        };
      }

      function N() {
        var t = this;
        this._el.innerHTML = "";
        h.css(this._el, {
          "font-size": "12px",
          position: "relative",
          cursor: "text",
          "font-family": this._fontFamily,
          background: this._colorBackground,
          overflow: "auto"
        });
        h.bind(this._el, "click", function () {
          setTimeout(function () {
            t.__focusDOM.focus();
          });
        });
        this.__helpCalcDOM = h.appendTo(this._el, "<span></span>");
        h.css(this.__helpCalcDOM, {
          position: "absolute",
          "z-index": "-1",
          "white-space": "pre",
          top: 0,
          left: 0,
          color: "rgba(0,0,0,0)",
          "font-weight": this._fontWeight
        });
        this.__helpInputDOM = h.appendTo(this._el, "<div></div>");
        h.css(this.__helpInputDOM, {
          position: "absolute",
          "z-index": 1
        });
        h.bind(this.__helpInputDOM, "click", function (e) {
          h.stopPropagation(e);
          h.preventDefault(e);

          t.__focusDOM.focus();
        });
        this.__focusDOM = h.appendTo(this._el, "<textarea></textarea>");
        h.css(this.__focusDOM, {
          position: "absolute",
          width: "6px",
          "margin-top": "3px",
          height: "15px",
          "line-height": "15px",
          resize: "none",
          overflow: "hidden",
          padding: "0",
          outline: "none",
          border: "none",
          background: "rgba(0,0,0,0)",
          color: this._colorCursor
        });
        h.attr(this.__focusDOM, {
          wrap: "off",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: "false"
        });

        if (this._readonly) {
          h.attr(this.__focusDOM, {
            readonly: true
          });
        }

        this.__showDOM = h.appendTo(this._el, "<div></div>");
        h.css(this.__showDOM, {
          padding: "10px 0"
        });
        this.__selectCanvas = h.appendTo(this._el, "<canvas></canvas>");
        h.css(this.__selectCanvas, {
          position: "absolute",
          left: "40px",
          top: "10px",
          opacity: "0.5"
        });
        this.$$updateCanvasSize(1, 1);
      }

      function g() {
        h.css(this.__focusDOM, {
          left: 40 + this.$$textWidth(this._contentArray[this.__lineNum]) + "px",
          top: 10 + this.__lineNum * 21 + "px"
        });
      }

      function $() {
        var n = this;

        if (this.__diff && this.__diff.beginNum + this.__diff.endNum > 10) {
          var e = this.__showDOM.childNodes;
          var t = e.length;

          for (var r = t - this.__diff.endNum - 1; r >= this.__diff.beginNum; r--) {
            h.remove(e[r]);
          }

          if (this.__diff.beginNum > 0) {
            for (var i = this.__formatData.length - 1 - this.__diff.endNum; i >= this.__diff.beginNum; i--) {
              h.after(e[this.__diff.beginNum - 1], this.$$toTemplate(this.__formatData[i], i, this._noLineNumber));
            }
          } else {
            for (var o = this.__formatData.length - this.__diff.endNum - 1; o >= 0; o--) {
              h.prependTo(this.__showDOM, this.$$toTemplate(this.__formatData[o], o, this._noLineNumber));
            }
          }

          e = this.__showDOM.childNodes;

          for (var s = this.__diff.beginNum; s < this.__formatData.length; s++) {
            e[s].getElementsByTagName("em")[0].innerText = s + 1;
          }
        } else if (this.__diff != "not update") {
          var l = "";

          this.__formatData.forEach(function (e, t) {
            l += n.$$toTemplate(e, t, n._noLineNumber);
          });

          this.__showDOM.innerHTML = l;
        }

        this.__diff = "not update";
        var a = this.__showDOM.childNodes[this.__lineNum];

        if (!this._readonly && this.__lineDom) {
          this.__lineDom.style.backgroundColor = "rgba(0, 0, 0, 0)";
          a.style.backgroundColor = this._colorEdit;
        }

        this.__lineDom = a;
      }

      function b() {
        var s = this;

        var l = this.__selectCanvas.getContext("2d");

        l.fillStyle = this._colorSelect;
        l.clearRect(0, 0, this.__selectCanvas.scrollWidth, this.__selectCanvas.scrollHeight);

        var e = function e(t, n, r) {
          var i = s.$$calcCanvasXY(t, r);
          var o = s.$$calcCanvasXY(n, r);

          if (t == n && t == 0) {
            l.fillRect(i.x, i.y, 5, 21);
          } else {
            l.fillRect(i.x, i.y, o.x - i.x, 21);
          }
        };

        if (this.__cursor1.lineNum == this.__cursor2.lineNum && this.__cursor1.leftNum == this.__cursor2.leftNum) return;
        l.beginPath();

        if (this.__cursor1.lineNum == this.__cursor2.lineNum) {
          e(this.__cursor1.leftNum, this.__cursor2.leftNum, this.__cursor1.lineNum);
        } else {
          var t, n;

          if (this.__cursor1.lineNum < this.__cursor2.lineNum) {
            t = this.__cursor1;
            n = this.__cursor2;
          } else {
            t = this.__cursor2;
            n = this.__cursor1;
          }

          e(t.leftNum, this._contentArray[t.lineNum].length, t.lineNum);
          e(0, n.leftNum, n.lineNum);

          for (var r = t.lineNum + 1; r < n.lineNum; r++) {
            e(0, this._contentArray[r].length, r);
          }
        }
      }

      function w() {
        this.__cursorTop = this.__lineNum * 21 + 10;
        this.__cursorLeft = 40 + this.$$textWidth(this._contentArray[this.__lineNum].substring(0, this.__leftNum));
        h.css(this.__focusDOM, {
          top: this.__cursorTop + "px",
          left: this.__cursorLeft + "px"
        });
      }

      function A(e, t) {
        if (arguments.length < 2) {
          e = this._el.scrollWidth - 40;
          t = this._el.scrollHeight - 10;
        }

        h.css(this.__selectCanvas, {
          width: e + "px",
          height: t + "px"
        });
        h.attr(this.__selectCanvas, {
          width: e,
          height: t
        });
      }

      function x() {
        this.$$updateCanvasSize(1, 1);
        this.__cursor1 = {
          leftNum: 0,
          lineNum: 0
        };
        this.__cursor2 = {
          leftNum: 0,
          lineNum: 0
        };
      }

      function O() {
        var e = this.__cursor2,
            t = this.__cursor1;

        if (this.__cursor1.lineNum < this.__cursor2.lineNum) {
          e = this.__cursor1;
          t = this.__cursor2;
        } else if (this.__cursor1.lineNum == this.__cursor2.lineNum) {
          if (this.__cursor1.leftNum < this.__cursor2.leftNum) {
            e = this.__cursor1;
            t = this.__cursor2;
          }
        }

        var n = this._contentArray[e.lineNum].substr(0, e.leftNum) + this._contentArray[t.lineNum].substr(t.leftNum);

        this._contentArray.splice(e.lineNum, t.lineNum - e.lineNum + 1, n);

        this.__leftNum = this.__cursor1.leftNum = this.__cursor2.leftNum = e.leftNum;
        this.__lineNum = this.__cursor1.lineNum = this.__cursor2.lineNum = e.lineNum;
        this.$$cancelSelect();
      }

      var D = (e = {
        48: [0, ")"],
        49: [1, "!"],
        50: [2, "@"],
        51: [3, "#"],
        52: [4, "$"],
        53: [5, "%"],
        54: [6, "^"],
        55: [7, "&"],
        56: [8, "*"],
        57: [9, "("],
        96: [0, 0],
        97: 1,
        98: 2,
        99: 3,
        100: 4,
        101: 5,
        102: 6,
        103: 7,
        104: 8,
        105: 9,
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        65: ["a", "A"],
        66: ["b", "B"],
        67: ["c", "C"],
        68: ["d", "D"],
        69: ["e", "E"],
        70: ["f", "F"],
        71: ["g", "G"],
        72: ["h", "H"],
        73: ["i", "I"],
        74: ["j", "J"],
        75: ["k", "K"],
        76: ["l", "L"],
        77: ["m", "M"],
        78: ["n", "N"],
        79: ["o", "O"],
        80: ["p", "P"],
        81: ["q", "Q"],
        82: ["r", "R"],
        83: ["s", "S"],
        84: ["t", "T"],
        85: ["u", "U"],
        86: ["v", "V"],
        87: ["w", "W"],
        88: ["x", "X"],
        89: ["y", "Y"],
        90: ["z", "Z"],
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        33: "page up",
        34: "page down",
        35: "end",
        36: "home",
        16: "shift",
        17: "ctrl",
        18: "alt",
        91: "command",
        92: "command",
        93: "command",
        9: "tab",
        20: "caps lock",
        32: "spacebar",
        8: "backspace",
        13: "enter",
        27: "esc",
        46: "delete",
        45: "insert",
        144: "number lock",
        145: "scroll lock",
        12: "clear"
      }, _defineProperty(e, "45", "insert"), _defineProperty(e, 19, "pause"), _defineProperty(e, 112, "f1"), _defineProperty(e, 113, "f2"), _defineProperty(e, 114, "f3"), _defineProperty(e, 115, "f4"), _defineProperty(e, 116, "f5"), _defineProperty(e, 117, "f6"), _defineProperty(e, 118, "f7"), _defineProperty(e, 119, "f8"), _defineProperty(e, 120, "f9"), _defineProperty(e, 121, "f10"), _defineProperty(e, 122, "f11"), _defineProperty(e, 123, "f12"), _defineProperty(e, 189, ["-", "_"]), _defineProperty(e, 187, ["=", "+"]), _defineProperty(e, 219, ["[", "{"]), _defineProperty(e, 221, ["]", "}"]), _defineProperty(e, 220, ["\\", "|"]), _defineProperty(e, 186, [";", ":"]), _defineProperty(e, 222, ["'", '"']), _defineProperty(e, 188, [",", "<"]), _defineProperty(e, 190, [".", ">"]), _defineProperty(e, 191, ["/", "?"]), _defineProperty(e, 192, ["`", "~"]), e);
      var M = ["shift", "ctrl", "alt"];

      function k(e) {
        e = e || window.event;
        var t = e.keyCode || e.which;
        var n = D[t] || t;
        if (!n) return;
        if (n.constructor !== Array) n = [n, n];
        var r = e.shiftKey ? "shift+" : "",
            i = e.altKey ? "alt+" : "",
            o = e.ctrlKey ? "ctrl+" : "";
        var s = "",
            l = o + r + i;

        if (M.indexOf(n[0]) >= 0) {
          n[0] = n[1] = "";
        }

        var a = e.code == "Key" + e.key && !r;
        s = l + (l == "" && a ? n[1] : n[0]);

        if (n[0] == "") {
          s = s.replace(/\+$/, "");
        }

        return s;
      }

      function P() {
        var a = this;
        var t = false;

        var n = function e(t) {
          var n = h.position(a._el, t);
          var r = Math.round((n.y - 20.5) / 21);
          if (r < 0) r = 0;
          if (r >= a._contentArray.length) r = a._contentArray.length - 1;
          return {
            leftNum: a.$$bestLeftNum(n.x, r),
            lineNum: r
          };
        };

        var u = function e() {
          var t = a.__cursor2,
              n = a.__cursor1;

          if (a.__cursor1.lineNum < a.__cursor2.lineNum) {
            t = a.__cursor1;
            n = a.__cursor2;
          } else if (a.__cursor1.lineNum == a.__cursor2.lineNum) {
            if (a.__cursor1.leftNum < a.__cursor2.leftNum) {
              t = a.__cursor1;
              n = a.__cursor2;
            }

            return a._contentArray[t.lineNum].substring(t.leftNum, n.leftNum);
          }

          var r = "";
          r += a._contentArray[t.lineNum].substr(t.leftNum) + "\n";

          for (var i = t.lineNum + 1; i < n.lineNum; i++) {
            r += a._contentArray[i] + "\n";
          }

          r += a._contentArray[n.lineNum].substr(0, n.leftNum);
          return r;
        };

        h.bind(this._el, "mousedown", function (e) {
          t = true;
          a.__cursor2 = a.__cursor1 = n(e);
          a.$$updateCanvasSize();
          a.$$updateSelectView();
        });
        h.bind(this._el, "mousemove", function (e) {
          if (!t) return;
          a.__cursor2 = n(e);
          a.$$updateSelectView();
        });
        h.bind(this._el, "mouseup", function () {
          return t = false;
        });
        h.bind(this._el, "mouseout", function () {
          return t = false;
        });
        h.bind(this._el, "click", function (e) {
          a.__helpInputDOM.innerHTML = "";
          var t = h.position(a._el, e);
          var n = Math.round((t.y - 20.5) / 21);
          if (n < 0 || n >= a._contentArray.length) return;
          a.__lineNum = n;
          a.__leftNum = a.$$bestLeftNum(t.x);
          a.$$updateCursorPosition();
          a.$$updateView();
        });

        var _ = function e(t) {
          t = t || a.__focusDOM.value;
          t = a.$$filterText(t);
          a.__focusDOM.value = "";
          if (a.$$selectIsNotBlank()) a.$$deleteSelect();

          if (/^\n$/.test(t)) {
            if (a.__leftNum >= a._contentArray[a.__lineNum].length) {
              a._contentArray.splice(a.__lineNum + 1, 0, "");
            } else {
              a._contentArray.splice(a.__lineNum + 1, 0, a._contentArray[a.__lineNum].substring(a.__leftNum));

              a._contentArray[a.__lineNum] = a._contentArray[a.__lineNum].substring(0, a.__leftNum);
            }

            a.__lineNum += 1;
            a.__leftNum = 0;
          } else {
            var n = t.split(/\n/);

            if (n.length <= 1) {
              a._contentArray[a.__lineNum] = a._contentArray[a.__lineNum].substring(0, a.__leftNum) + t + a._contentArray[a.__lineNum].substring(a.__leftNum);
              a.__leftNum += t.length;
            } else {
              var r;

              var i = a._contentArray[a.__lineNum].substring(0, a.__leftNum);

              var o = a._contentArray[a.__lineNum].substring(a.__leftNum);

              n[0] = i + n[0];
              n[n.length - 1] += o;

              (r = a._contentArray).splice.apply(r, [a.__lineNum, 1].concat(_toConsumableArray(n)));

              a.__lineNum += n.length - 1;
              a.__leftNum = n[n.length - 1].length - o.length;
            }
          }

          a.__formatData = a.$$diff(a.$shader(a._contentArray.join("\n")));
          a.$$updateCursorPosition();
          a.$$updateView();

          a.__updated__();
        };

        h.bind(this.__focusDOM, "compositionstart", function () {
          a.__needUpdate = false;
          a.__focusDOM.style.color = "rgba(0,0,0,0)";
          a.__focusDOM.style.borderLeft = "1px solid " + a._colorCursor;
        });
        h.bind(this.__focusDOM, "compositionend", function () {
          a.__needUpdate = true;
          a.__focusDOM.style.color = a._colorCursor;
          a.__focusDOM.style.borderLeft = "none";

          _();

          if (a.$input != null) a.__helpInputEvent = a.$input(a.__helpInputDOM, v(a), a._contentArray) || {};
        });
        h.bind(this.__focusDOM, "input", function () {
          if (a.__needUpdate) {
            _();

            if (a.$input != null) a.__helpInputEvent = a.$input(a.__helpInputDOM, v(a), a._contentArray) || {};
          }
        });
        var c = false;
        h.bind(this._el, "keyup", function (e) {
          var t = k(e);
          if (t == "command") c = false;
        });
        h.bind(this._el, "keydown", function (e) {
          var t = k(e);
          if (t == "command") c = true;

          if (c && ["a", "c", "x"].indexOf(t) > -1) {
            t = "ctrl+" + t;
          }

          if (a.__helpInputDOM.innerHTML != "") {
            var n = a.__helpInputEvent[t];

            if (f(n)) {
              if (!n()) return;
            } else {
              a.__helpInputDOM.innerHTML = "";
            }
          }

          if (a._readonly && ["ctrl+a", "ctrl+c"].indexOf(t) < 0) return;

          switch (t) {
            case "ctrl+a":
              {
                a.__cursor1 = {
                  leftNum: 0,
                  lineNum: 0
                };
                a.__cursor2 = {
                  lineNum: a._contentArray.length - 1,
                  leftNum: a._contentArray[a._contentArray.length - 1].length
                };
                a.$$updateSelectView();
                break;
              }

            case "ctrl+c":
              {
                if (a.$$selectIsNotBlank()) {
                  h.copy(u());

                  a.__focusDOM.focus();
                }

                break;
              }

            case "ctrl+x":
              {
                if (a.$$selectIsNotBlank()) {
                  h.copy(u());

                  a.__focusDOM.focus();

                  a.$$deleteSelect();
                  a.__formatData = a.$$diff(a.$shader(a._contentArray.join("\n")));
                  a.$$updateCursorPosition();
                  a.$$updateView();
                  a.$$cancelSelect();

                  a.__updated__();
                }

                break;
              }

            case "tab":
              {
                h.stopPropagation(e);
                h.preventDefault(e);
                var r = "";

                for (var i = 0; i < a._tabSpace; i++) {
                  r += " ";
                }

                if (a.$$selectIsNotBlank()) {
                  var o = a.__cursor1.lineNum,
                      s = a.__cursor2.lineNum;

                  if (o > s) {
                    o = a.__cursor2.lineNum;
                    s = a.__cursor1.lineNum;
                  }

                  for (var l = o; l <= s; l++) {
                    a._contentArray[l] = r + a._contentArray[l];
                  }

                  a.__cursor1.leftNum += a._tabSpace;
                  a.__cursor2.leftNum += a._tabSpace;
                  a.__leftNum += a._tabSpace;
                  a.__formatData = a.$$diff(a.$shader(a._contentArray.join("\n")));
                  a.$$updateCursorPosition();
                  a.$$updateView();
                  a.$$updateCanvasSize();
                  a.$$updateSelectView();

                  a.__updated__();
                } else {
                  _(r);
                }

                break;
              }

            case "up":
              {
                if (a.__lineNum <= 0) return;
                a.__lineNum -= 1;
                a.__leftNum = a.$$bestLeftNum(a.$$textWidth(a._contentArray[a.__lineNum + 1].substr(0, a.__leftNum)) + 40);
                a.$$updateCursorPosition();
                a.$$updateView();
                a.$$cancelSelect();
                a._el.scrollTop -= 21;
                break;
              }

            case "down":
              {
                if (a.__lineNum >= a._contentArray.length - 1) return;
                a.__lineNum += 1;
                a.__leftNum = a.$$bestLeftNum(a.$$textWidth(a._contentArray[a.__lineNum - 1].substr(0, a.__leftNum)) + 40);
                a.$$updateCursorPosition();
                a.$$updateView();
                a.$$cancelSelect();
                a._el.scrollTop += 21;
                break;
              }

            case "left":
              {
                if (a.__leftNum <= 0) {
                  if (a.__lineNum <= 0) return;
                  a.__lineNum -= 1;
                  a.__leftNum = a._contentArray[a.__lineNum].length;
                } else {
                  a.__leftNum -= 1;
                }

                a.$$updateCursorPosition();
                a.$$cancelSelect();
                break;
              }

            case "right":
              {
                if (a.__leftNum >= a._contentArray[a.__lineNum].length) {
                  if (a.__lineNum >= a._contentArray.length - 1) return;
                  a.__lineNum += 1;
                  a.__leftNum = 0;
                } else {
                  a.__leftNum += 1;
                }

                a.$$updateCursorPosition();
                a.$$cancelSelect();
                break;
              }

            case "backspace":
              {
                if (a.$$selectIsNotBlank()) {
                  a.$$deleteSelect();
                } else {
                  if (a.__leftNum <= 0) {
                    if (a.__lineNum <= 0) return;
                    a.__lineNum -= 1;
                    a.__leftNum = a._contentArray[a.__lineNum].length;
                    a._contentArray[a.__lineNum] += a._contentArray[a.__lineNum + 1];

                    a._contentArray.splice(a.__lineNum + 1, 1);
                  } else {
                    a.__leftNum -= 1;
                    a._contentArray[a.__lineNum] = a._contentArray[a.__lineNum].substring(0, a.__leftNum) + a._contentArray[a.__lineNum].substring(a.__leftNum + 1);
                  }
                }

                a.__formatData = a.$$diff(a.$shader(a._contentArray.join("\n")));
                a.$$updateCursorPosition();
                a.$$updateView();
                a.$$cancelSelect();

                a.__updated__();

                break;
              }
          }
        });
      }

      var S = function e(t, n) {
        if (t.length != n.length) return false;

        for (var r = 0; r < t.length; r++) {
          if (t[r].content != n[r].content || t[r].color != n[r].color) return false;
        }

        return true;
      };

      function C(e) {
        var t = this.__formatData;

        if (t) {
          var n = 0;

          for (var r = 0; r < t.length && r < e.length; r++) {
            if (!S(t[r], e[r])) {
              break;
            }

            n += 1;
          }

          var i = 0;

          for (var o = 1; o <= t.length && o <= e.length; o++) {
            if (!S(t[t.length - o], e[e.length - o])) {
              break;
            }

            i += 1;
          }

          var s = Math.min(t.length, e.length);

          if (n + i >= s) {
            i = s - n - 1;
            if (i < 0) i = 0;
          }

          this.__diff = {
            beginNum: n,
            endNum: i
          };
        }

        return e;
      }

      function T(e) {
        var t = "";

        for (var n = 0; n < this._tabSpace; n++) {
          t += " ";
        }

        return e.replace(/\t/g, t);
      }

      function j(n, t) {
        var r = [];
        var i = 0;

        var e = function e(t) {
          return n.substring(i, t + i > n.length ? n.length : t + i);
        };

        var o = "";
        var s = "tag";

        var l = function e() {
          if (o != "") {
            r.push({
              color: {
                tag: t.selector,
                attr: t.attrKey,
                string: t.attrValue
              }[s],
              content: o
            });
          }

          o = "";
        };

        while (true) {
          if (e(2) == "/*") {
            l();

            while (e(2) !== "*/" && i < n.length) {
              o += n[i++];
            }

            r.push({
              color: t.annotation,
              content: o + e(2)
            });
            i += 2;
            o = "";
          } else if (["'", '"'].indexOf(e(1)) > -1) {
            var a = e(1);
            l();

            do {
              o += n[i++];
            } while (e(1) != a && i < n.length);

            if (e(1) != a) {
              a = "";
            } else {
              i += 1;
            }

            r.push({
              color: t.attrValue,
              content: o + a
            });
            o = "";
          } else if ([":", "{", "}", ";"].indexOf(e(1)) > -1) {
            l();
            r.push({
              color: t.insign,
              content: e(1)
            });
            o = "";

            if (e(1) == "{" || e(1) == ";") {
              s = "attr";
            } else if (e(1) == "}") {
              s = "tag";
            } else {
              s = "string";
            }

            i += 1;
          } else {
            if (i >= n.length) {
              l();
              break;
            } else {
              o += n[i++];
            }
          }
        }

        return r;
      }

      var E = ["abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"];

      function L(n, t) {
        var r = [];
        var i = 0;

        var e = function e(t) {
          return n.substring(i, t + i > n.length ? n.length : t + i);
        };

        var o = "";

        var s = function e() {
          if (o != "") {
            if (o[0] == "(") {
              r.push({
                color: t.insign,
                content: "("
              });
              o = o.substr(1);
            }

            r.push({
              color: t.text,
              content: o
            });
          }

          o = "";
        };

        while (true) {
          if (e(2) == "/*") {
            s();

            while (e(2) !== "*/" && i < n.length) {
              o += n[i++];
            }

            r.push({
              color: t.annotation,
              content: o + e(2)
            });
            i += 2;
            o = "";
          } else if (e(2) == "//") {
            s();

            while (e(1) !== "\n" && i < n.length) {
              o += n[i++];
            }

            r.push({
              color: t.annotation,
              content: o
            });
            o = "";
          } else if (["'", '"', "`"].indexOf(e(1)) > -1) {
            var l = e(1);
            s();

            do {
              o += n[i++];
            } while (e(1) != l && i < n.length);

            if (e(1) != l) {
              l = "";
            } else {
              i += 1;
            }

            r.push({
              color: t.string,
              content: o + l
            });
            o = "";
          } else if (e(1) == "(" && (o[0] == " " || i - o.length - 1 >= 0 && n[i - o.length - 1] == " ")) {
            r.push({
              color: t.funName,
              content: o
            });
            i += 1;
            o = "(";
          } else if (e(1) == "(") {
            r.push({
              color: t.execName,
              content: o
            });
            i += 1;
            o = "(";
          } else if ([";", "{", "}", "(", ")", ".", "\n", "=", "+", ">", "<", "[", "]", "-", "*", "/", "^", "*", "!"].indexOf(e(1)) > -1) {
            s();
            r.push({
              color: t.insign,
              content: e(1)
            });
            o = "";
            i += 1;
          } else if (e(1) == " " && E.indexOf(o.trim()) > -1) {
            r.push({
              color: t.key,
              content: o + " "
            });
            o = "";
            i += 1;
          } else {
            if (i >= n.length) {
              s();
              break;
            } else {
              o += n[i++];
            }
          }
        }

        return r;
      }

      function I(n, r) {
        var i = [];
        var o = 0;

        var s = function e(t) {
          return n.substring(o, t + o > n.length ? n.length : t + o);
        };

        var l = "";

        var e = function e() {
          if (l != "") {
            i.push({
              color: r.text,
              content: l
            });
          }

          l = "";
        };

        var t = function e() {
          var t = " ";
          if (s(1) == '"') t = '"';
          if (s(1) == "'") t = "'";

          do {
            l += n[o++];
          } while (s(1) != t && o < n.length);

          if (t != " " && o < n.length) {
            l += t;
            o += 1;
          }

          i.push({
            color: r.attrValue,
            content: l
          });
          l = "";
        };

        while (true) {
          if (s(4) == "\x3c!--") {
            e();

            while (s(3) !== "--\x3e" && o < n.length) {
              l += n[o++];
            }

            i.push({
              color: r.annotation,
              content: l + s(3)
            });
            o += 3;
            l = "";
          } else if (s(2) == "</") {
            e();
            i.push({
              color: r.insign,
              content: "</"
            });
            o += 2;

            while (s(1) !== ">" && o < n.length) {
              l += n[o++];
            }

            if (l != "") {
              i.push({
                color: r.node,
                content: l
              });
              l = "";

              if (o < n.length) {
                i.push({
                  color: r.insign,
                  content: ">"
                });
                o += 1;
              }
            }
          } else if (s(1) == "<" && s(2) != "< ") {
            var a = "";
            e();
            i.push({
              color: r.insign,
              content: "<"
            });
            o += 1;

            while (s(1) != ">" && s(1) != " " && o < n.length) {
              l += n[o++];
            }

            if (l != "") {
              if (l == "style" || l == "script") {
                a = "</" + l + ">";
              }

              i.push({
                color: r.node,
                content: l
              });
              l = "";

              if (o < n.length) {
                while (o < n.length) {
                  if (s(1) == ">") {
                    e();
                    i.push({
                      color: r.insign,
                      content: ">"
                    });
                    o += 1;
                    break;
                  } else if (s(1) != " ") {
                    e();

                    if (s(1) != '"' && s(1) != "'") {
                      while (s(1) != "=" && s(1) != ">" && o < n.length && s(1) != " ") {
                        l += n[o++];
                      }

                      if (l != "") {
                        i.push({
                          color: r.attrKey,
                          content: l
                        });
                        l = "";

                        if (s(1) == "=") {
                          i.push({
                            color: r.insign,
                            content: "="
                          });
                          o += 1;

                          if (o < n.length && s(1) != " " && s(1) != ">") {
                            t();
                          }
                        }
                      } else {
                        l += n[o++];
                      }
                    } else if (s(1) == "=") {
                      i.push({
                        color: r.insign,
                        content: "="
                      });
                      o += 1;
                    } else {
                      if (o < n.length && s(1) != " " && s(1) != ">") {
                        t();
                      }
                    }
                  } else {
                    l += n[o++];
                  }
                }
              }
            }

            if (a != "") {
              var u = o,
                  _ = l;

              while (s(a.length) != a && o < n.length) {
                l += n[o++];
              }

              if (o < n.length) {
                var c = a.replace(/<\//, "");
                var f = {
                  "style>": j,
                  "script>": L
                }[c](l, {
                  "style>": r._css,
                  "script>": r._javascript
                }[c]);
                f.forEach(function (e) {
                  i.push(e);
                });
                l = "";
              } else {
                l = _;
                o = u;
              }
            }
          } else {
            if (o >= n.length) {
              e();
              break;
            } else {
              l += n[o++];
            }
          }
        }

        return i;
      }

      var V = function e(t) {
        var r = [[]],
            i = 0;
        t.forEach(function (e) {
          var t = e.content.split(/\n/);
          r[i].push({
            color: e.color,
            content: t[0]
          });

          for (var n = 1; n < t.length; n++) {
            i += 1;
            r.push([]);
            r[i].push({
              color: e.color,
              content: t[n]
            });
          }
        });
        return r;
      };

      var W = function e(t, n) {
        for (var r in n) {
          try {
            t[r] = n[r];
          } catch (e) {
            throw new Error("Illegal property value！");
          }
        }

        return t;
      };

      var B = {
        text: "#000000",
        annotation: "#6a9955",
        insign: "#ffffff",
        node: "#1e50b3",
        attrKey: "#1e83b1",
        attrValue: "#ac4c1e"
      };
      var z = {
        annotation: "#6a9955",
        insign: "#ffffff",
        selector: "#1e50b3",
        attrKey: "#1e83b1",
        attrValue: "#ac4c1e"
      };
      var H = {
        text: "#000000",
        annotation: "#6a9955",
        insign: "#ffffff",
        key: "#ff0000",
        string: "#ac4c1e",
        funName: "#1e50b3",
        execName: "#1e83b1"
      };

      function K(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var n, r;

        if (e == "html") {
          t._css = W(z, t.css);
          t._javascript = W(H, t.javascript);
          r = W(B, t);
          n = I;
        } else if (e == "css") {
          r = W(z, t);
          n = j;
        } else if (e == "javascript") {
          r = W(H, t);
          n = L;
        } else {
          throw new Error("Language not supported:" + e + ",The languages available include: html、css、javascript!");
        }

        return function (e) {
          return V(n(e, r));
        };
      }

      var U = function e(t) {
        var r = this;

        if (!(this instanceof e)) {
          throw new Error("Open-Web-Editor is a constructor and should be called with the `new` keyword");
        }

        if (_(t.el)) {
          var n = function e() {
            var t = [];

            r._contentArray.forEach(function (e) {
              t.push([{
                content: e,
                color: r._colorText
              }]);
            });

            return t;
          };

          var i = function e(t) {
            return t;
          };

          this._el = t.el;
          this._el.owe_terminal = "none";
          t.color = t.color || {};
          this._colorBackground = t.color.background || "#d6d6e4";
          this._colorText = t.color.text || "#000000";
          this._colorNumber = t.color.number || "#888484";
          this._colorEdit = t.color.edit || "#eaeaf1";
          this._colorCursor = t.color.cursor || "#ff0000";
          this._colorSelect = t.color.select || "#6c6cf1";
          this._fontFamily = t["font-family"] || "新宋体";
          this._fontWeight = t["font-weight"] || 600;
          this._tabSpace = t.tabSpace || 4;
          this._readonly = t.readonly || false;
          this._noLineNumber = t.noLineNumber || false;
          this._contentArray = a(t.content) ? (this.$$filterText(t.content) + "").split("\n") : [""];
          this.$shader = f(t.shader) ? t.shader : u(t.shader) ? K.apply(void 0, _toConsumableArray(t.shader)) : n;
          this.$format = f(t.format) ? t.format : i;
          this.$input = f(t.input) ? t.input : null;
        } else {
          throw new Error("options.el is not a element!");
        }

        this.$$initDom();
        this.__needUpdate = true;
        this.__lineNum = this._contentArray.length - 1;
        this.__leftNum = this._contentArray[this.__lineNum].length;
        this.__cursor1 = this.__cursor2 = {
          leftNum: 0,
          lineNum: 0
        };
        this.__formatData = this.$$diff(this.$shader(this._contentArray.join("\n")));
        this.$$initView();
        this.$$updateView();
        this.$$bindEvent();

        this.__updated__ = function () {};

        this.updated = function (e) {
          r.__updated__ = e;
        };

        this.valueOf = function () {
          return r._contentArray.join("\n");
        };

        this.input = function () {
          var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
          var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

          if (t != 0) {
            if (n != 0) {
              r._contentArray[r.__lineNum] = r._contentArray[r.__lineNum].substring(0, r.__leftNum + t) + r._contentArray[r.__lineNum].substring(r.__leftNum + t + n);
            }

            r.__leftNum += t;
          }

          r.__focusDOM.value = e;
          h.trigger(r.__focusDOM, "input");

          r.__focusDOM.focus();
        };

        this.format = function () {
          r._contentArray = r.$format(r._contentArray.join("\n"), r._tabSpace).split("\n");
          r.__lineNum = r._contentArray.length - 1;
          r.__leftNum = r._contentArray[r.__lineNum].length;
          r.__formatData = r.$$diff(r.$shader(r._contentArray.join("\n")));
          r.$$updateView();
          r.$$initView();
        };

        this.copy = function (e, t) {
          h.copy(r.valueOf(), e, t);
        };
      };

      U.prototype.$$textWidth = c;
      U.prototype.$$bestLeftNum = p;
      U.prototype.$$calcCanvasXY = d;
      U.prototype.$$selectIsNotBlank = m;
      U.prototype.$$filterText = T;
      U.prototype.$$toTemplate = y;
      U.prototype.$$initDom = N;
      U.prototype.$$initView = g;
      U.prototype.$$updateView = $;
      U.prototype.$$updateSelectView = b;
      U.prototype.$$updateCursorPosition = w;
      U.prototype.$$updateCanvasSize = A;
      U.prototype.$$cancelSelect = x;
      U.prototype.$$deleteSelect = O;
      U.prototype.$$bindEvent = P;
      U.prototype.$$diff = C;

      if (_typeof(module) === "object" && _typeof(module.exports) === "object") {
        module.exports = U;
      } else {
        window.OpenWebEditor = U;
      }
    })();
  });
  var qCode = {
    inserted: function inserted(el, binding) {
      var code = el.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      var owe = new openWebEditor_min({
        // 编辑器挂载点
        el: el,
        // 初始化文本
        content: code,
        // 是否只读
        readonly: binding.type != 'editor',
        // 着色语言
        shader: [binding.exp || 'javascript', {
          insign: "#000000",
          "css": {
            insign: "#000000"
          },
          "javascript": {
            insign: "#000000"
          }
        }],
        // 设置颜色
        color: {
          background: "rgb(239, 235, 234)",

          /*编辑器背景*/
          text: "#000000",

          /*文本颜色*/
          number: "#888484",

          /*行号颜色*/
          edit: "#eaeaf1",

          /*编辑行背景色*/
          cursor: "#ff0000",

          /*光标颜色*/
          select: "gray"
          /*选择背景*/

        },
        // 是否隐藏行号
        // 如果只有一行，就不显示行号(编辑界面一定显示)
        noLineNumber: !/\n/.test(code)
      }); // 添加复制按钮

      var btnNode = xhtml.prepend(el, '<span class="copy-btn" title="复制到剪切板">复制<span></span></span>');
      xhtml.bind(btnNode, 'click', function () {
        owe.copy(function () {
          alert('复制成功');
        }, function (error) {
          console.log(error);
          alert('复制失败');
        });
      });
      xhtml.setStyles(btnNode, _defineProperty2({
        position: "absolute",
        right: "10px",
        top: "6px",
        border: "none",
        outline: 0,
        padding: "4p 10p",
        transition: "0.2s",
        "font-size": "12px",
        cursor: "pointer",
        "z-index": 1,
        "line-height": '20px',
        "background-color": "#f8f8f8"
      }, "padding", "5px 10px"));
      el.__owe__ = owe;
    }
  };

  function urlFormat(url) {
    var splitTemp = url.split('?');
    var routerTemp = (splitTemp[0] + "#").split("#")[1].replace(/^\//, '').replace(/\/$/, '').split('/');
    var paramTemp = splitTemp[1] || "";
    var paramResult, paramArray;

    if (paramTemp == "") {
      paramResult = {};
    } else {
      paramArray = paramTemp.split("&"), paramResult = {};
      paramArray.forEach(function (item) {
        var temp = item.split("=");
        paramResult[temp[0]] = temp[1];
      });
    }

    var resultData = {
      router: routerTemp[0] == '' ? [] : routerTemp,
      params: paramResult
    };
    return resultData;
  }

  QuickPaper.directive('qCode', qCode);
  QuickPaper.urlFormat = urlFormat;
  QuickPaper.prototype.__OpenWebEditor = openWebEditor_min;
  QuickPaper.__OpenWebEditor = openWebEditor_min; // 根据运行环境，导出接口

  if ((typeof module === "undefined" ? "undefined" : _typeof2(module)) === "object" && _typeof2(module.exports) === "object") {
    module.exports = QuickPaper;
  } else {
    window.QuickPaper = QuickPaper;
  }
})();