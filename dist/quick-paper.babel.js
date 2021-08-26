"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
* quick-paper v1.0.0
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
    var type = _typeof(value);

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
    var type = _typeof(value);

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
    if (value === null || _typeof(value) !== 'object' || getType(value) != '[object Object]') {
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
    return value !== null && _typeof(value) === 'object' && types.indexOf(value.nodeType) > -1 && !_isPlainObject(value);
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
  }; // 根据运行环境，导出接口


  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    module.exports = QuickPaper;
  } else {
    window.QuickPaper = QuickPaper;
  }
})();