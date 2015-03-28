/***************************************************************************
 * 
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * src/ad/fx/fx.js ~ 2013/04/29 13:51:25
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
goog.require('ad.base');
goog.provide('ad.fx.Timeline');
goog.provide('ad.fx.moveTo');
goog.provide('ad.fx.fadeIn');
goog.provide('ad.fx.fadeOut');


/**
 * @constructor
 * @extends {baidu.lang.Class}
 */
ad.fx.Timeline = function(options){
    baidu.lang.Class.call(this);

    this.interval = 16;
    this.duration = 500;
    this.dynamic  = true;

    /**
      * @type {boolean}
      */
    this.overlapping;

    /**
     * @type {Element}
     */
    this.element;

    /**
     * 用来保存初始状态的一些信息
     * @type {Object}
     */
    this.original;

    /**
     * @private
     * @type {string}
     */
    this.__type;

    /**
     * @private
     * @type {number}
     */
    this._btime;

    /**
     * @private
     * @type {number}
     */
    this._etime;

    /**
     * @private
     * @type {number}
     */
    this._timer;

    /**
     * 目的是让Ftangram把baidu.lang.Event相关的代码合并进来.
     * @private
     */
    this._dummy = new baidu.lang.Event('_dummy');

    baidu.object.extend(this, options);
};
baidu.inherits(ad.fx.Timeline, baidu.lang.Class);

/**
 * @return {ad.fx.Timeline}
 */
ad.fx.Timeline.prototype.launch = function(){
    var me = this;
    me.dispatchEvent("onbeforestart");

    this.initialize();
    this._btime = new Date().getTime();
    this._etime = this._btime + (me.dynamic ? me.duration : 0);
    this.pulsed();

    return me;
}

ad.fx.Timeline.prototype.pulsed = function(){
    var me = this;
    var now = new Date().getTime();
    // 当前时间线的进度百分比
    me.percent = (now - me._btime) / me.duration;
    me.dispatchEvent("onbeforeupdate");

    // 时间线已经走到终点
    if (now >= me._etime){
        me.render(me.transition(me.percent = 1));
        me.finish();
        me.dispatchEvent("onafterfinish");
        me.dispose();
        return;
    }

    me.render(me.transition(me.percent));
    me.dispatchEvent("onafterupdate");

    me._timer = ad.base.setTimeout(function(){me.pulsed()}, me.interval);
}

/**
 * @param {number} percent
 * @return {number}
 */
ad.fx.Timeline.prototype.transition = function(percent) {
    return percent;
}

ad.fx.Timeline.prototype.initialize = baidu.fn.blank;
ad.fx.Timeline.prototype.restore = baidu.fn.blank;
ad.fx.Timeline.prototype.finish = baidu.fn.blank;
ad.fx.Timeline.prototype.render = baidu.fn.blank;

ad.fx.Timeline.prototype.cancel = function() {
    this._timer && ad.base.clearTimeout(this._timer);
    this._etime = this._btime;
    this.restore();
    this.dispatchEvent("oncancel");
    this.dispose();
}

ad.fx.Timeline.prototype.end = function() {
    this._timer && ad.base.clearTimeout(this._timer);
    this._etime = this._btime;
    this.pulsed();
}

/**
 * @param {Element} element The element attached to the ad.fx.Timeline
 * @param {Object} options The ad.fx.Timeline configuration.
 * @param {string=} fxName the ad.fx.Timeline name.
 * @return {ad.fx.Timeline}
 */
ad.fx.create = function(element, options, fxName) {
    var timeline = new ad.fx.Timeline(options);

    timeline.element = element;
    timeline.__type = fxName || timeline.__type;
    timeline.original = {};   // 20100708

    var catt = "baidu_current_effect";

    /**
     * 将实例的guid记录到DOM元素上，以便多个效果叠加时的处理
     */
    timeline.addEventListener("onbeforestart", function(){
        var me = this, guid;
        me.attribName = "att_"+ me.__type.replace(/\W/g, "_");
        //otherGudi其实没有用，只是起到一个标识作用
        var otherGuid = me.element.getAttribute(catt);
        me.element.setAttribute(catt, (otherGuid||"") +"|"+ me.guid +"|", 0);

        if (!me.overlapping) {
            (guid = me.element.getAttribute(me.attribName)) 
                && window[baidu.guid]._instances[guid].cancel();

            //在DOM元素上记录当前效果的guid
            me.element.setAttribute(me.attribName, me.guid, 0);
        }
    });

    /**
     * 打扫dom元素上的痕迹，删除元素自定义属性
     * @this {ad.fx.Timeline}
     */
    timeline.clean = function(e) {
        var me = this, guid;
        if (e = me.element) {
            e.removeAttribute(me.attribName);
            guid = e.getAttribute(catt);
            guid = guid.replace("|"+ me.guid +"|", "");
            if (!guid) e.removeAttribute(catt);
            else e.setAttribute(catt, guid);
        }
    };

    /**
    * 在时间线结束时净化对DOM元素的污染
    */
    timeline.addEventListener("oncancel", function() {
        this.clean();
    });

    /**
    * 在时间线结束时净化对DOM元素的污染
    */
    timeline.addEventListener("onafterfinish", function() {
        this.clean();
        this.restoreAfterFinish && this.restore();
    });

    /**
     * 保存原始的CSS属性值 20100708
     * @this {ad.fx.Timeline}
     * @param {string} key 需要保存的值.
     */
    timeline.protect = function(key) {
        this.original[key] = this.element.style[key];
    };

    /**
     * @this {ad.fx.Timeline}
     * 时间线结束，恢复那些被改过的CSS属性值
     */
    timeline.restore = function() {
        var o = this.original,
            s = this.element.style,
            v;
        for (var i in o) {
            v = o[i];
            if (typeof v == "undefined") continue;

            s[i] = v;    // 还原初始值

            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
            if (!v && s.removeAttribute) s.removeAttribute(i);    // IE
            else if (!v && s.removeProperty) s.removeProperty(i); // !IE
        }
    };

    return timeline;
};

/**
 * @param {Element} element The element which Timeline was attached.
 * @param {Object} options The Timeline configuration.
 * @return {ad.fx.Timeline}
 */
ad.fx.move = function(element, options) {
    if (baidu.dom.getStyle(element, "position") == "static") {
        return null;
    }

    options = baidu.object.extend({x: 0, y: 0}, options);
    if (options.x == 0 && options.y == 0) return null;

    /**
     * @this {ad.fx.Timeline}
     */
    function initialize() {
        this.protect("top");
        this.protect("left");

        /** @type {number} */
        this.x;

        /** @type {number} */
        this.y;

        this.originX = parseInt(baidu.dom.getStyle(element, "left"), 10)|| 0;
        this.originY = parseInt(baidu.dom.getStyle(element, "top"), 10) || 0;
    }

    /**
     * @param {number} schedule The timeline schedule.
     * @this {ad.fx.Timeline}
     */
    function render(schedule) {
        element.style.top  = (this.y * schedule + this.originY) +"px";
        element.style.left = (this.x * schedule + this.originX) +"px";
    }

    /**
     * @param {number} percent
     * @return {number}
     */
    function transition(percent) {
        return (1 - Math.pow(1 - percent, 2));
    }

    var fx = ad.fx.create(element, baidu.object.extend({
        initialize : initialize,
        transition : transition,
        render : render
    }, options), "ad.fx.move");

    return fx.launch();
};

/**
 * @param {Element} element
 * @param {{x:number, y:number}} point
 * @param {Object=} options.
 */
ad.fx.moveTo = function(element, point, options) {
    if (baidu.dom.getStyle(element, "position") == "static") {
        return null;
    }

    var x = parseInt(baidu.dom.getStyle(element, "left"), 10) || 0;
    var y = parseInt(baidu.dom.getStyle(element, "top"), 10)  || 0;

    var fx = ad.fx.move(element,
        baidu.object.extend({x: point.x - x, y: point.y - y}, options||{}));

    return fx;
};

/**
 * 控制元素的透明度 渐变
 * @param {Element} element 元素或者元素的ID
 * @param {Object} options 选项。参数的详细说明如下表所示
 */

ad.fx.opacity = function(element, options) {
    options = baidu.object.extend({from: 0,to: 1}, options||{});

    var e = element;

    var fx = ad.fx.create(e, baidu.object.extend({
        /**
         * @this {ad.fx.Timeline}
         */
        initialize : function() {
        
            /** @type {number} */
            this.from;

            /** @type {number} */
            this.to;
            
            baidu.dom.show(element);

            if (baidu.browser.ie < 9) {
                this.protect("filter");
            } else {
                this.protect("opacity");
                this.protect("KHTMLOpacity");
            }

            this.distance = this.to - this.from;
        },

        /**
         * @this {ad.fx.Timeline}
         */
        render : function(schedule) {
            var n = this.distance * schedule + this.from;

            if(!(baidu.browser.ie < 9)) {
                e.style.opacity = n;
                e.style.KHTMLOpacity = n;
            } else {
                e.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
                    Math.floor(n * 100) +")";
            }
        }
    }, options), "ad.fx.opacity");

    return fx.launch();
};


 
/**
 * 渐隐渐变效果，效果执行结束后会将元素完全隐藏起来。
 * @param {Element} element 元素或者元素的ID
 * @param {Object} options 选项。参数的详细说明如下表所示
 */
ad.fx.fadeOut = function(element, options) {
    var fx = ad.fx.opacity(element,
        baidu.object.extend({from:1, to:0, restoreAfterFinish:true}, options||{})
    );
    fx.addEventListener("onafterfinish", function(){baidu.dom.hide(element);});
    fx.__type = "ad.fx.fadeOut";

    return fx;
};


/**
 * 渐现渐变效果。注意，如果元素的visibility属性如果为hidden，效果将表现不出来。
 * @param {Element} element 元素或者元素的ID
 * @param {Object} options 选项。参数的详细说明如下表所示
 */

ad.fx.fadeIn = function(element, options) {
    var fx = ad.fx.opacity(element,
        baidu.object.extend({from:0, to:1, restoreAfterFinish:true}, options||{})
    );
    fx.__type = "ad.fx.fadeIn";

    return fx;
};


















/* vim: set ts=4 sw=4 sts=4 tw=100: */
