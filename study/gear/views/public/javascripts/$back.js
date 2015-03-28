/**
 * Created by dingye on 2014/5/11.
 */
var module = window;
(function (module, factory) {
    if (module.$) {
        return;
    } else {
        module.$ = factory(module);
    }
})(module, function (module) {
    var regexMap = {
        /*element: /^<\s*(.*)\s*>.*<\s*\/\s*\1\s*>$/g*/
        element: /^<\s*.*\s*>.*<\s*\/\s*.*\s*>$/g/*,
         px: /\s*\d*p\s*x\s*$/g*/
    };
    var $ = function (query, context) {
        if (regexMap.element.test(query)) {
            var div = document.createElement('div');
            div.innerHTML = query;
            var children = div.children;
            div = null;
            if (children.length === 0) {
                return children[0];
            }
            return children;
        } else if ($.isFunction(query)) {
            return $.domContentLoaded(query);
        }
        return new Gear(query, context);
    };
    function Gear(query, context) {
        if (typeof query === 'string') {
            Sizzle(query, context, this);
        } else {
            this.push(query);
        }
    }
    Gear.prototype = new Array();
    Gear.prototype.constructor = Gear;
    $.fn = Gear.prototype;
    $.fn.package = function (name, fn) {
        console.log(name, $);
        fn.name = name;
        fn($);
    }
    return $;
});

module.$.fn.package('拓展', function() {
    Array.prototype.each = function (fn) {
        for (var i = 0; i < this.length; i++) {
            fn(this[i], i);
        }
    }
    Array.prototype.remove = function (item) {
        var location = -1;
        for (var i = 0; i < this.length; i++) {
            if (this[i] === item) {
                location = i;
                break;
            }
        }
        if (location > -1) {
            this.splice(location, 1);
        }
    }
});

module.$.fn.package('事件', function($) {
    var EventManager = {
        deleteFn: function (dom, name) {
            var listeners = dom.listeners;
            if (listeners) {
                var temp = listeners[name];
                if (temp) {
                    delete listeners[name];
                    return temp.fn;
                }
            }
            return false;
        },
        deleteCallBack: function (dom, name, callback) {
            var listeners = dom.listeners;
            if (listeners) {
                var temp = listeners[name];
                if (temp) {
                    temp.set.remove(callback);
                    if (temp.set.length === 0) {
                        delete listeners[name];
                        return temp.fn;
                    }
                }
            }
            return false;
        },
        getFn: function (dom, name,  callback) {
            var listeners = dom.listeners;
            if (!listeners) {
                listeners = {};
                listeners[name] = {set: [callback],
                    parent: listeners};
                listeners[name]['fn'] = function (opt_evt) {
                    var offs = [];
                    var set = listeners[name].set;
                    set.each(function (callback) {
                        callback.call(dom, $.fixEvent(opt_evt));
                        if(callback.type === 'once') {
                            offs.push(callback);
                        }
                    });
                    for(var i = 0, l = offs.length; i< l; i++) {
                        set.remove(offs[i]);
                    }
                    if (set.length === 0) {
                        delete listeners[name];
                    }
                };
                dom.listeners = listeners;
                return listeners[name].fn;
            } else if (name in listeners) {
                listeners[name].set.push(callback);
                return false;
            } else {
                listeners[name] = {
                    set: [callback],
                    parent: listeners
                };
                listeners[name]['fn'] = function (opt_evt) {
                    listeners[name].set.each(function (callback) {
                        callback.call(dom, $.fixEvent(opt_evt));
                    });
                };
                return listeners[name].fn;
            }
        }
    };
    var facade = {
        'live': function (dom, name, callback) {

        },
        'on': function (dom, name, callback) {
            if ('addEventListener' in window) {
                facade.on = function (dom, name, callback) {
                    callback.type = callback.type || 'on';
                    var fn = EventManager.getFn(dom, name, callback);
                    if (fn) {
                        dom.addEventListener(name, fn, false);
                    }
                }
            } else if ('attachEvent' in window) {
                facade.on = function (dom, name, callback) {
                    callback.type = callback.type || 'on';
                    var fn = EventManager.getFn(dom, name, callback);
                    if (fn) {
                        dom.attachEvent('on' + name, fn);
                    }
                }
            } else {
                facade.on = function (dom, name, callback) {
                    callback.type = callback.type || 'on';
                    var fn = EventManager.getFn(dom, name, callback);
                    if (fn) {
                        dom['on' + name] = fn;
                    }
                }
            }
            return this.on(dom, name, callback);
        },
        'off': function (dom, name, callback) {
            if ('removeEventListener' in window) {
                facade.off = function (dom, name, callback) {
                    var fn;
                    if (callback) {
                        fn = EventManager.deleteCallBack(dom, name, callback);
                    } else {
                        fn = EventManager.deleteFn(dom, name);
                    }
                    if (fn) {
                        dom.removeEventListener(name, fn, false);
                    }
                };
            } else if ('detachEvent' in window) {
                facade.off = function (dom, name, callback) {
                    var fn;
                    if (callback) {
                        fn = EventManager.deleteCallBack(dom, name, callback);
                    } else {
                        fn = EventManager.deleteFn(dom, name);
                    }
                    if (fn) {
                        dom.detachEvent('on' + name, fn);
                    }
                }
            } else {
                facade.off = function (dom, name, callback) {
                    var fn;
                    if (callback) {
                        fn = EventManager.deleteCallBack(dom, name, callback);
                    } else {
                        fn = EventManager.deleteFn(dom, name);
                    }
                    if (fn) {
                        dom['on' + name] = null;
                    }
                }
            }
            this.off(dom, name, callback);
        },
        'once': function (dom, name, callback) {
            callback.type = 'once';
            facade.on(dom, name, callback);
        },
        'domContentLoaded': function (fn) {
            if ('addEventListener' in window) {
                facade.domContentLoaded = function (fn) {
                    facade.once(document, 'DOMContentLoaded', fn);
                };
            } else if ('attachEvent' in window) {
                facade.domContentLoaded = function (fn) {
                    facade.once(window, 'load', fn);
                }
            } else {
                facade.domContentLoaded = function (fn) {
                    facade.once(window, 'load', fn);
                }
            }
            facade.domContentLoaded(fn);
        }
    };
    $.domContentLoaded = function(callBack) {
        facade.domContentLoaded(callBack);
    }
    $.fn.unbind = $.fn.off = function (name, callback) {
        this.each(function (dom, index) {
            facade.off(dom, name, callback);
        });
        return this;
    }
    $.fn.bind = $.fn.on = function (name, callback) {
        this.each(function (dom, index) {
            facade.on(dom, name, callback);
        });
        return this;
    }
    $.fn.mousedown = function (fn) {
        this.on('mousedown', fn);
        return this;
    }
    $.fn.mousemove = function (fn) {
        this.on('mousemove', fn);
        return this;
    }
    $.fn.mouseout = function (fn) {
        this.on('mouseout', fn);
        return this;
    }
    $.fn.mouseover = function(fn) {
        this.on('mouseover', fn);
        return this;
    }
    $.fn.hover = function (overCallback, outCallback) {//实现hover事件
        var isHover = false;//判断是否悬浮在上方
        var preOvTime = new Date().getTime();//上次悬浮时间
        function over(opt_evt) {
            var evt = opt_evt || window.event;
            var curOvTime = new Date().getTime();
            isHover = true;//处于over状态
            if (curOvTime - preOvTime > 10) {//时间间隔超过10毫秒，认为鼠标完成了mouseout事件
                overCallback.call(this, evt);
            }
            preOvTime = curOvTime;
        }

        function out(opt_evt) {
            var evt = opt_evt || window.event;
            var curOvTime = new Date().getTime();
            preOvTime = curOvTime;
            isHover = false;
            setTimeout(function () {
                if (!isHover) {
                    outCallback.call(this, evt);
                }
            }, 10);
        }
        return this.mouseover(over).mouseout(out);
    };
});

module.$.fn.package('基础', function($) {
    var filter = {
        pxSample: 'top bottom left right width height margin top border zindex',
        px:function(attr, value) {
            var cssSample = this.pxSample;
            if(cssSample.indexOf(attr)>-1) {
                return parseInt(value) + 'px';
            }
            return value;
        }
    };
    var regexMap = {
        className: function (className) {
            return new RegExp('(\\s|^)' + className + '(\\s|$)');
        }
    };
    var facade = {
        'viewportSize': function () {
            if (typeof window.innerWidth !== 'undefined') {
                facade.viewportSize = function () {
                    return {width: window.innerWidth, height: window.innerHeight};
                }
            } else {
                var el = document.documentElement;
                if (el !== 'undefined' && typeof el.clientWidth !== 'undefined' && el.clientWidth != 0) {
                    facade.viewportSize = function () {
                        return {width: el.clientWidth, height: el.clientHeight};
                    }
                } else {
                    var body = document.body;
                    facade.viewportSize = function () {
                        return {width: body.clientWidth, height: body.clientHeight};
                    }
                }
            }
            return facade.viewportSize();
        },
        'scrollPosition': function (dom) {
            if (typeof window.pageYOffset !== 'undefined') {
                facade.scrollPosition = function (dom) {
                    if (dom === window) {
                        return {scrollLeft: window.pageXOffset, scrollTop: window.pageYOffset};
                    } else {
                        return {scrollLeft: dom.scrollLeft, scrollTop: dom.scrollTop};
                    }
                }
            } else {
                var el = document.documentElement;
                if (typeof el.scrollTop !== 'undefined' && el.scrollTop > 0
                    || el.scrollLeft > 0) {
                    facade.scrollPosition = function (dom) {
                        if (dom === window) {
                            return {scrollLeft: el.scrollLeft, scrollTop: el.scrollTop};
                        } else {
                            return {scrollLeft: dom.scrollLeft, scrollTop: dom.scrollTop};
                        }
                    }
                } else {
                    var body = document.body;
                    if (typeof body.scrollTop !== 'undefined') {
                        facade.scrollPosition = function (dom) {
                            if (dom === window) {
                                return {scrollLeft: body.scrollLeft, scrollTop: body.scrollTop};
                            } else {
                                return {scrollLeft: dom.scrollLeft, scrollTop: dom.scrollTop};
                            }
                        }
                    }
                }
            }
            return facade.scrollPosition(dom);
        },
        'css': function (gear, attr, value) {
            if (typeof window.getComputedStyle != 'undefined')//W3C
            {
                facade.css = function (gear, attr, value) {
                    if (value !== undefined) {
                        gear.each(function (dom) {
                            dom.style[attr] = filter.px(attr, value);
                        });
                        return value;
                    } else {
                        return window.getComputedStyle(gear[0], null)[attr];
                    }
                };
            }
            else if (typeof gear[0].currentStyle != 'undefined') {
                facade.css = function (gear, attr, value) {
                    if (value !== undefined) {
                        gear.each(function (dom) {
                            dom.style[attr] = filter.px(attr, value);
                        });
                        return value;
                    } else {
                        return gear[0].currentStyle[attr];
                    }
                };
            }
            return facade.css(gear, attr, value);
        },
        'opacity': function (gear, value) {
            if (value !== undefined) {
                gear.each(function (dom) {
                    dom.style['opacity'] = value;
                    dom.style.filter = "alpha(opacity=" + parseInt(100 * value) + ")";
                });
                return value;
            } else {
                return gear.css("opacity");
            }
        }
    };
    $.fn.css = function (attr, value) {
        if (typeof attr === 'string') {
            return facade.css(this, attr, value);
        } else {
            for (var item in attr) {
                facade.css(this, item, attr[item]);
            }
            return this;
        }
    }
    $.fn.size = function (size) {
        if (size) {
            for (var item in size) {
                if (item !== 'width' && item !== 'height') {
                    delete size[item];
                }
            }
            this.css(size);
            return this;
        } else {
            if (window === this[0]) {
                return facade.viewportSize();
            }
            return {width: parseInt(this[0].offsetWidth), height: parseInt(this[0].offsetHeight)};
        }
    }
    $.fn.width = function (width) {
        if (width) {
            this.css({width: width});
            return this;
        } else {
            if (window === this[0]) {
                return facade.viewportSize().width;
            }
            return parseInt(this[0].offsetWidth);
        }
    }
    $.fn.height = function (height) {
        if (height) {
            this.css({height: height});
            return this;
        } else {
            if (window === this[0]) {
                return facade.viewportSize().height;
            }
            return parseInt(this[0].offsetHeight);
        }
    }
    $.fn.offsetParent = function() {
        return $(this[0].offsetParent);
    }
    $.fn.append = function(dom) {
        this[0].appendChild(dom);
        return this;
    }
    $.fn.scroll = function (x, y) {
        /*
         只有window 有scrollBy 和scrollTo函数
         普通dom元素只能操作scrollTop 与scrollLeft属性
         * */
        if (arguments.length > 0) {
            var el = this[0];
            if (el === window) {
                $.scrollTo(x, y);
            } else {
                el.scrollLeft = x;
                el.scrollTop = y;
            }
        } else {
            return facade.scrollPosition(this[0]);
        }
    }

    $.fn.removeClass = function (className) {
        this.each(function (dom) {
            dom.className = dom.className.replace(regexMap.className(className), " ");
        });
        return this;
    }
    $.fn.addClass = function (className) {
        this.each(function (dom) {
            if (!dom.className.match(regexMap.className(className))) {
                dom.className += ' ' + className;
            }
        });
        return this;
    }
    $.fn.offset = function (absolute) {
        var left = 0, top = 0;
        if (typeof absolute === 'object') {
            left = absolute['left'],
                top = absolute['top'];
            if (left !== undefined && top !== undefined) {
                this.css({left: left, top: top});
            } else if (left !== undefined) {
                this.css({left: left});
            } else if (top !== undefined) {
                this.css({top: top});
            }
            return this;
        } else {
            absolute = (absolute === undefined) ? true : false;
            if (!absolute) {
                left = this[0].offsetLeft;
                top = this[0].offsetTop;
            } else {
                var el = this[0];
                do {
                    left += el.offsetLeft;
                    top += el.offsetTop;
                    el = el.offsetParent
                } while (el != null)
            }
            left = left || 0;
            top = top || 0;
            return {left: left, top: top};
        }
    }
    $.fn.opacity = function (value) {
        return facade.opacity(this, value);
    }
});

module.$.fn.package('工具', function($) {
    var facade = {'cursorPosition': function (event) {
        if (typeof event.pageX !== 'undefined') {
            facade.cursorPosition = function (event) {
                return {x: event.pageX, y: event.pageY};
            }
        } else {
            facade.cursorPosition = function (event) {
                var scroll = $(window).scroll();
                return {x: event.clientX + scroll.scrollLeft, y: event.clientY + scroll.scrollTop};
            }
        }
        return facade.cursorPosition(event);
    }};
    $.extend = function (defaults, options) {
        options = options || {};
        for (var item in defaults) {
            if (!(item in options)) {
                options[item] = defaults[item];
            }
        }
        return options;
    }
    $.isFunction = function (fn) {
        return typeof fn === 'function';
    }
    $.isArray = function (array) {
        if (array instanceof Array) {
            return true;
        } else {
            return false;
        }
    }
    $.isString = function (str) {
        if (typeof str === 'string') {
            return true;
        } else {
            return false;
        }
    }
    $.toArray = function (array, index) {
        index = index || 0;
        return Array.prototype.slice.call(array, index);
    }
    $.cursorPosition = function (e) {
        return facade.cursorPosition(e);
    }
    $.fixEvent = function (event) {
        if (!event) {
            event = window.event;
            event.preventDefault = $.fixEvent.preventDefault;
            event.stopPropagation = $.fixEvent.stopPropagation;
            event.target = event.srcElement;
            event.relatedTarget = event.toElement || event.fromElement;//mouseout mouseover
        }
        return event;
    };
    $.fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    $.fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };
    $.injection = function (src) {
        var items = $.toArray(arguments, 1);
        return function (target) {
            var item;
            for (var i = 0, l = items.length; i < l; i++) {
                item = items[i];
                if (!(item in target)) {
                    target[item] = src[item];
                }
            }
        }
    }
});

module.$.fn.package('动画', function ($) {
    var regexMap = {
        color: /^#([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})/g,
        rgb: /^rgb\(([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})\)/g,
        rect: /rect\((.*)\)/g};

    function RGBToHex(re) {
        if (re[0] < 0) {
            return "transparent";
        }
        var hexColor = "#";
        var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        for (var i = 0; i < 3; i++) {
            var r = null;
            var c = re[i];
            var hexAr = [];
            while (c > 16) {
                r = c % 16;
                c = parseInt(c / 16);
                hexAr.push(hex[r]);
            }
            hexAr.push(hex[c]);
            hexColor += hexAr.reverse().join('');
        }
        return hexColor;
    }

    function HexToRGB(hex) {
        hex = hex.trim();
        if (hex === 'transparent') {
            return [-1000, -1000, -1000];
        }
        if (hex.charAt(0) === '#') {
            var hexColor = [];
            var re = hex.replace(regexMap.color, "$1 $2 $3").split(" ");
            for (var i = 0; i < 3; i++) {
                var r = null;
                var c = re[i];
                var hexAr = [];
                for (var index = 0; index < c.length; index++) {
                    var item = c[index].toUpperCase();
                    if (item > '9') {
                        item = 10 + (item.charCodeAt(0) - 'A'.charCodeAt(0));
                    } else {
                        item = item.charCodeAt(0) - '0'.charCodeAt(0);
                    }
                    hexAr.push(item);
                }
                if (hexAr.length > 1) {
                    hexColor.push(hexAr[0] * 16 + hexAr[1]);
                } else {
                    hexColor.push(hexAr[0]);
                }
            }
            return hexColor;
        } else {
            var hexColor;

            hexColor = hex.replace(regexMap.rgb, "$1 $2 $3").split(" ");
            hexColor.each(function (index) {
                hexColor[index] = parseInt(hexColor[index]);
            });
            return hexColor;
        }
    }

    var animator = {
        fixUpdater: function (config) {
            var updater = config.updater || "line";
            if (typeof updater === 'function') {
                return;
            }
            if (updater in animator.updater) {
                config.updater = animator.updater[updater];
            } else {
                config.updater = animator.updater['line'];
            }
        },
        updater: {
            line: function (offset, currentStep, step) {
                return offset / step * currentStep;
            },
            sin: function (offset, currentStep, step) {
                return Math.sin(Math.PI / 2 * currentStep / step) * offset;
            }
        },
        parser: function (config) {
            var attr = config.attr;
            var $animator;
            switch (attr) {
                case 'x':
                    attr = 'left';
                    $animator = animator.pxAnimator;
                    break;
                case 'y':
                    attr = 'top';
                    $animator = animator.pxAnimator;
                    break;
                case 'w':
                    attr = 'width';
                    $animator = animator.pxAnimator;
                    break;
                case 'h':
                    attr = 'height';
                    $animator = animator.pxAnimator;
                    break;
                case 'o':
                    attr = 'opacity';
                    $animator = animator.opacityAnimator;
                    break;
                case 'c':
                    attr = 'color';
                    $animator = animator.colorAnimator;
                    break;
                case 'b':
                    attr = 'backgroundColor';
                    $animator = animator.colorAnimator;
                    break;
                case 's':
                    attr = "clip";
                    $animator = animator.clipAnimator;
                    break;
                default :
                    $animator = animator.pxAnimator;
                    break;
            }
            config.attr = attr;
            return $animator;
        },
        $handler: function (config) {
            var items = config.items;
            items.each(function (item) {
                var $animator = item.$animator;
                animator.fixUpdater(item);
                $animator.init.call(item.gear, item, config.step);
            });
            var step = 0;
            var timer = setInterval(function () {
                step++;
                items.each(function (item) {
                    var $animator = item.$animator;
                    $animator.update.call(item.gear, item, step);
                });
                if (step >= config.step) {
                    clearInterval(timer);
                    if ('callback' in config) {
                        config.callback();
                    }
                }
            }, config['interval']);
        },
        handler: function (obj, key, emitter, scope, interval) {
            var that = this;
            animator.fixUpdater(obj);
            scope.init.call(that, obj, obj.step);
            var step = 0;
            var timer = setInterval(function () {
                step++;
                scope.update.call(that, obj, step);
                if (step >= obj.step) {
                    clearInterval(timer);
                    if ("callback" in obj) {
                        obj.callback();
                    }
                    emitter.emit(key);
                }
            }, interval);
        },
        pxAnimator: {
            init: function (obj, step) {
                var position = obj['from'];
                if (position !== undefined) {
                    this.each(function (dom) {
                        dom.style[obj.attr] = obj.from + "px";
                    });
                    obj.offset = parseFloat(obj.to - obj.from);
                } else {
                    obj.from = [];
                    obj.offset = [];

                    this.each(function (dom) {
                        var from = parseInt($(dom).css(obj['attr']));
                        from = from || 0;
                        obj.from.push(from);
                        obj.offset.push(parseFloat(obj.to - from));

                    });
                }
            },
            update: function (obj, step) {
                this.each(function (dom, index) {
                    if (obj.from instanceof Array) {
                        dom.style[obj['attr']] = (obj.from[index] + obj.updater(obj['offset'][index], step, obj.step)) + 'px';
                    } else {
                        dom.style[obj['attr']] = (obj.from + obj.updater(obj['offset'], step, obj.step)) + 'px';
                    }
                });
            }
        },
        clipAnimator: {
            init: function (obj, step) {
                var to = obj.to;
                obj.to = [to[1], to[2], to[3], to[0]];

                var position = obj['from'];
                if (position !== undefined) {
                    position = [position[1], position[2], position[3], position[0]];
                    obj['from'] = position;
                    this.each(function (dom) {
                        dom.style[obj.attr] = "rect(" + position[0] + "px," + position[1] + "px," + position[2] + "px," + position[3] + "px)";
                    });
                    obj.offset = [parseFloat(obj.to[0] - obj.from[0]), parseFloat(obj.to[1] - obj.from[1]), parseFloat(obj.to[2] - obj.from[2]), parseFloat(obj.to[3] - obj.from[3])];
                } else {
                    obj.from = [];
                    obj.offset = [];

                    this.each(function (dom) {
                        var clipValue = $(dom).css(obj['attr']);
                        if (!clipValue || clipValue === 'auto') {
                            var size = $(dom).size();
                            clipValue = [0, parseInt(size[0]), parseInt(size[1]), 0];
                        } else {
                            clipValue = clipValue.replace(regexMap.rect, "$1");
                            if (/,/.test(clipValue)) {
                                clipValue = clipValue.split(",");
                            } else {
                                clipValue = clipValue.split(" ");
                            }
                            clipValue.each(function (index) {
                                clipValue[index] = parseInt(clipValue[index]);
                            });
                        }
                        var from = clipValue;
                        obj.from.push(from);
                        obj.offset.push([parseFloat(obj.to[0] - from[0]), parseFloat(obj.to[1] - from[1]), parseFloat(obj.to[2] - from[2]), parseFloat(obj.to[3] - from[3])]);

                    });
                }
            },
            update: function (obj, step) {
                this.each(function (dom, index) {
                    var updater = obj.updater;
                    if (obj.from[0] instanceof Array) {
                        var from = obj.from[index];
                        var offset = obj.offset[index];
                        dom.style[obj['attr']] = "rect(" + (from[0] + updater(offset[0], step, obj.step)) + "px," + (from[1] + updater(offset[1], step, obj.step)) + "px," + (from[2] + updater(offset[2], step, obj.step)) + "px," + (from[3] + updater(offset[3], step, obj.step)) + "px)";
                    } else {
                        var from = obj.from;
                        var offset = obj.offset;
                        dom.style[obj['attr']] = "rect(" + (from[0] + updater(offset[0], step, obj.step)) + "px," + (from[1] + updater(offset[1], step, obj.step)) + "px," + (from[2] + updater(offset[2], step, obj.step)) + "px," + (from[3] + updater(offset[3], step, obj.step)) + "px)";
                    }
                });
            }
        },
        opacityAnimator: {
            init: function (obj, step) {
                var position = obj['from'];
                if (position !== undefined) {
                    this.each(function (dom) {
                        $(dom).opacity(obj.from);
                    });
                    obj.offset = parseFloat(obj.to - obj.from);
                } else {
                    obj.from = [];
                    obj.offset = [];
                    this.each(function (dom) {
                        var from = parseInt($(dom).css(obj['attr']));
                        from = from || 0;
                        obj.from.push(from);
                        obj.offset.push(parseFloat(obj.to - from));
                    });
                }
            },
            update: function (obj, step) {
                this.each(function (dom, index) {
                    if (obj.from instanceof Array) {
                        $(dom).opacity(obj.from[index] + obj.updater(obj['offset'][index], step, obj.step));
                    } else {
                        $(dom).opacity(obj.from + obj.updater(obj['offset'], step, obj.step));
                    }
                });
            }
        },
        colorAnimator: {
            init: function (obj, step) {
                var position = obj['from'];
                if (position !== undefined) {
                    this.each(function (dom) {
                        $(dom).css(obj.attr, obj.from);
                    });

                    var from = HexToRGB(obj.from);
                    var to = HexToRGB(obj.to);
                    obj.rgbFrom = from;
                    obj.offset = [(to[0] - from[0]), (to[1] - from[1]), (to[2] - from[2])];

                } else {
                    obj.rgbFrom = [];
                    obj.offset = [];
                    var to = HexToRGB(obj.to);
                    this.each(function (dom) {
                        var from = $(dom).css(obj['attr']);
                        from = from || 'transparent';
                        from = HexToRGB(from);
                        obj.rgbFrom.push(from);
                        obj.offset.push([(to[0] - from[0]), (to[1] - from[1]), (to[2] - from[2])]);
                    });

                }
            },
            update: function (obj, step) {
                var re, color;
                this.each(function (dom, index) {
                    var updater = obj.updater;
                    if (obj.rgbFrom[0] instanceof Array) {
                        var offset = obj.offset[index];
                        var from = obj.rgbFrom[index];
                        re = [parseInt(from[0] + updater(offset[0], step, obj.step)), parseInt(from[1] + updater(offset[1], step, obj.step)), parseInt(from[2] + updater(offset[2], step, obj.step))];

                    } else {
                        var offset = obj.offset;
                        var from = obj.rgbFrom;
                        re = [parseInt(from[0] + updater(offset[0], step, obj.step)), parseInt(from[1] + updater(offset[1], step, obj.step)), parseInt(from[2] + updater(offset[2], step, obj.step))];
                    }
                    color = RGBToHex(re);
                    $(dom).css(obj.attr, color);
                });
            }
        }
    };
    $.fn._animate = function (key, config, emitter) {
        var $animator = animator.parser(config);
        config.step = config.step || 10;
        config.duration = config.duration || 2000;
        config.interval = config.duration / config.step;
        animator.handler.call(this, config, key, emitter, $animator, config.interval);
    }
    $.fn.animate = function (deps) {
        var that = this;
        var emitter = ClassManager.create('EventEmitter');
        for (var key in deps) {
            var value = deps[key];
            if (value instanceof Array) {
                if (typeof value[value.length - 1] !== 'string') {
                    var config = value.pop();
                    emitter.all(value, function (key, config, emitter) {
                        return function () {
                            that._animate(key, config, emitter);
                        }
                    }(key, config, emitter));
                }
            } else {
                this._animate(key, value, emitter);
            }
        }
        return this;
    }
    $.animate = function (config) {
        config.duration = config.duration || 2000;
        config.step = config.step || 10;
        config.interval = config.duration / config.step;

        config.items.each(function () {
            this.duration = config.duration;
            this.step = config.step;
            this.base = $(this.selector);
            this.$animator = animator.parser(this);
        });
        animator.$handler(config);
    }
});

module.$.fn.package('拖拽', function($){
    var defaults = {
        limit: $(window),//是否限制拖放范围，默认限制当前窗口内
        drop: false,//是否drop
        handle: false,//拖动手柄
        el: $('body'),
        dragClass: false,
        start: false,
        move: false,
        reject: false,
        stop: false,
        finish: false,
        dropEnter: false,
        dropOut: false,
        dLeft: 0,
        dRight: 0,
        dTop: 0,
        dBottom: 0,
        sensitivity: 10
    };
    //被拖动元素不可以被选中，否则text，img默认行为很难看，text会选中文本，img会禁止拖拽
    var css = {'cursor': 'move', '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-o-user-select': 'none',
        'user-select': 'none'};
    var dropEnter;
    var dropOut;
    var reaction;
    var zIndex = 0;
    //IE禁止选中文本
    function selectstart() {
        return false;
    }
    function proxyDragStart(options, ThisO, This, tempBox, ThatO) {
        return function(e) {
            dragStart.call(this, e, options, ThisO, This, tempBox, ThatO);
        }
    }
    //拖动开始
    function dragStart (e, options, ThisO, This, tempBox, ThatO) {
        var pageXY = $.cursorPosition(e);
        var cX = pageXY.x;
        var cY = pageXY.y;
        ThisO = $(this);
        if (ThisO.length != 1) {
            return
        }//如果没有拖动对象就返回
        ThisO.css('z-index', zIndex++);
        var ThisOOffset = ThisO.offset();
        This.X = ThisOOffset.left;
        This.Y = ThisOOffset.top;
        var parentOffset = ThisO.offsetParent().offset();
        This.parentX = parentOffset.left;
        This.parentY = parentOffset.top;
        if (options.drop) {
            tempBox.html(ThisO.html());
            if (options.start) {
                options.start(e, ThisO, tempBox);
            } else {
                ThisO.html('');
            }
            options.el.append(tempBox);
            tempBox.css({left: This.X - This.parentX, top: This.Y - This.parentY});
        } else {
            if (options.start) {
                options.start(e, ThisO);
            }
            ThisO.css({margin:0, position: 'absolute', left: This.X - This.parentX, top: This.Y - This.parentY});
        }
        This.dx = cX - This.X;
        This.dy = cY - This.Y;
        $(document).mousemove(proxyDragMove(options, ThisO, This, tempBox, ThatO));
        $(document).mouseup(proxyDragStop(options, ThisO, This, tempBox, ThatO));
        //防止拖拽过程中选中其他元素
        $('body').bind('selectstart', selectstart);
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            ThisO[0].setCapture();
        }//IE,鼠标移到窗口外面也能释放
    }
    function proxyDragMove(options, ThisO, This, tempBox, ThatO) {
        return function(e){
            dragMove.call(this, e, options, ThisO, This, tempBox, ThatO);
        }
    }

    //拖动中
    function dragMove(e, options, ThisO, This, tempBox, ThatO) {
        var pageXY = $.cursorPosition(e);
        var cX = pageXY.x;
        var cY = pageXY.y;
        if (options.limit) {//限制拖动范围
            //容器的尺寸
            var $Limit = options.limit,
                $LimitOffset = $Limit.offset();
            var L = $LimitOffset.left + options.dLeft;
            var T = $LimitOffset.top + options.dTop;
            var R = L - options.dLeft + $Limit.width() + options.dRight;
            var B = T - options.dTop + $Limit.height() + options.dBottom;
            //获取拖动范围
            var iLeft = cX - This.dx, iTop = cY - This.dy;
            //获取超出长度
            var iRight = iLeft + parseInt(ThisO.width()) - R, iBottom = iTop + parseInt(ThisO.height()) - B;
            //先设置右下，再设置左上
            if (iRight > 0) iLeft -= iRight;
            if (iBottom > 0) iTop -= iBottom;
            if (L > iLeft) iLeft = L;
            if (T > iTop) iTop = T;
            iLeft = iLeft - This.parentX;
            iTop = iTop - This.parentY;
            if (options.move) {
                if (options.drop) {
                    options.move(e, iLeft, iTop, tempBox, options);
                } else {
                    options.move(e, iLeft, iTop, ThisO, options);
                }
            } else {
                if (options.drop) {
                    tempBox.css({left: iLeft, top: iTop})
                } else {
                    ThisO.css({left: iLeft, top: iTop})
                }
            }

        } else {
            //不限制范围
            var iLeft = cX - This.dx - This.parentX;
            var iTop = cY - This.dy - This.parentY;
            if (options.move) {
                if (options.drop) {
                    options.move(e, iLeft, iTop, tempBox, options);
                } else {
                    options.move(e, iLeft, iTop, ThisO, options);
                }
            } else{
                if (options.drop) {
                    tempBox.css({left: iLeft, top: iTop})
                } else {
                    ThisO.css({left: iLeft, top: iTop});
                }
            }
        }
        if (options.drop && (options.dropEnter || options.dropOut)) {
            reaction++;
            if(reaction >= options.sensitivity) {
                reaction = 0;
                dropOut = true;
                for (var i = 0; i < ThatO.length; i++) {
                    var $ThatO = $(ThatO[i]);
                    var XL = $ThatO.offset().left;
                    var XR = XL + $ThatO.width();
                    var YL = $ThatO.offset().top;
                    var YR = YL + $ThatO.height();
                    if (XL < cX && cX < XR && YL < cY && cY < YR) {//找到拖放目标，交换位置
                        dropEnter = true;
                        dropOut = false;
                        if (options.dropEnter) {
                            options.dropEnter(e, $ThatO, tempBox, ThisO);
                        }
                        break;//一旦找到，就终止循环
                    }
                }
                if (options.dropOut && dropOut && dropEnter) {
                    dropEnter = false;
                    options.dropOut(e, ThatO, tempBox, ThisO);
                }
            }
        }
    }
    function proxyDragStop(options, ThisO, This, tempBox, ThatO) {
        return function(e) {
            dragStop.call(this, e, options, ThisO, This, tempBox, ThatO);
        }
    }
    //拖动结束
    function dragStop(e, options,ThisO,This,tempBox, ThatO) {
        if (options.drop) {
            var flag = false;
            var pageXY = $.cursorPosition(e);
            var cX = pageXY.x;
            var cY = pageXY.y;
            var oLf = ThisO.offset().left;
            var oRt = oLf + ThisO.width();
            var oTp = ThisO.offset().top;
            var oBt = oTp + ThisO.height();
            if (!(cX > oLf && cX < oRt && cY > oTp && cY < oBt)) {//如果不是在原位
                for (var i = 0; i < ThatO.length; i++) {
                    var $ThatO = $(ThatO[i]);
                    var XL = $ThatO.offset().left;
                    var XR = XL + $ThatO.width();
                    var YL = $ThatO.offset().top;
                    var YR = YL + $ThatO.height();
                    if (XL < cX && cX < XR && YL < cY && cY < YR) {//找到拖放目标，交换位置
                        if (options.stop) {
                            options.stop(e, $ThatO, tempBox, ThisO);
                        } else {
                            var newElm = $ThatO.html();
                            $ThatO.html(tempBox.html());
                            ThisO.html(newElm);
                        }
                        tempBox.remove();
                        flag = true;
                        break;//一旦找到，就终止循环
                    }
                }
            }
            if (!flag) {//如果找不到拖放位置，归回原位
                tempBox.css({left: This.X - This.parentX, top: This.Y - This.parentY});
                if (options.reject) {
                    options.reject(e, ThisO, tempBox);
                } else {
                    ThisO.html(tempBox.html());
                }
                tempBox.remove();
            }
        } else if (options.stop) {
            options.stop(e, ThisO);
        }
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
        $('body').unbind('selectstart', selectstart);
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            ThisO[0].releaseCapture();
        }
    }
    $.fn.dragdrop = function (options) {
        options = $.extend(defaults, options);
        this.X = 0;//初始位置
        this.Y = 0;
        this.dx = 0;//位置差值
        this.dy = 0;
        var This = this;
        var ThisO = this;//被拖目标
        dropEnter = false;
        dropOut = true;
        reaction = 0;
        var ThatO;
        if (options.drop) {
            ThatO = $(options.drop);//可放下位置
            ThisO.css(css);
            var tempBox = $('<div style="position: absolute;z-index: 1000;"></div>');
            tempBox.css(css);
            if (options.dragClass) {
                tempBox.addClass(options.dragClass);
            }
        } else {
            options.handle ? ThisO.find(options.handle).css(css) : ThisO.css(css);
        }
        //绑定拖动
        options.handle ? ThisO.find(options.handle).mousedown(proxyDragStart(options, ThisO, This, tempBox, ThatO)) : ThisO.mousedown(proxyDragStart(options, ThisO, This, tempBox, ThatO));
        //IE
        /*document.body.onselectstart=function(){return false;}*/
    }
});

module.$.fn.package('cookie', function($) {
    //创建cookie
    $.setCookie = function (name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        if (expires instanceof Date) {
            cookieText += '; expires=' + expires;
        }
        if (path) {
            cookieText += '; expires=' + expires;
        }
        if (domain) {
            cookieText += '; domain=' + domain;
        }
        if (secure) {
            cookieText += '; secure';
        }
        document.cookie = cookieText;
    }

    //获取cookie
    $.getCookie = function (name) {
        var cookieName = encodeURIComponent(name) + '=';
        var cookieStart = document.cookie.indexOf(cookieName);
        var cookieValue = null;
        if (cookieStart > -1) {
            var cookieEnd = document.cookie.indexOf(';', cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }
        return cookieValue;
    }

    //删除cookie
    $.unsetCookie = function (name) {
        document.cookie = name + "= ; expires=" + new Date(0);
    }
});