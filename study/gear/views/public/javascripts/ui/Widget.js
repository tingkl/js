/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-1-22
 * Time: 下午1:23
 * To change this template use File | Settings | File Templates.
 */
define(['Template', 'EventEmitter', 'Ajax'], 'ui.Widget', function (Template, EventEmitter, Ajax) {
    var templateManager = {},
        guid = 0,
        blank = function() {
           //todo
        };
    function Widget(config) {
        Widget.superClass.call(this);
        this.all([Widget.event.config, Widget.event.template, Widget.event.render], this._render, {scope:this});
        this.fillConfig(config/*, Widget.caller.Config*/);
        this.loadTemplate();
    }
    Widget.event = {
        config: 'config',
        template: 'template',
        render: 'render'
    };
    ClassManager.extend(Widget, EventEmitter);
    Widget.prototype.render = function (callback) {
        this.emit(Widget.event.render, callback);
    }

    Widget.prototype.loadTemplate = function (allise) {
        allise = this.constructor.allise;
        var that = this;
        if (!(allise in templateManager)) {
            Ajax.loadCss(allise);
            var promise = Ajax.loadTemplate(allise);
            promise.then(function (success, template) {
                that.constructor.template = template;
                that.emit(Widget.event.template, template);
                promise.over = true;
            }, function () {
                throw new Error("加载" + allise + "模板失败！");
            });
            templateManager[allise] = promise;
        } else {
            var promise = templateManager[allise];
            if (promise.over) {
                this.emit(Widget.event.template, this.constructor.template);
            } else {
                promise.then(function () {
                    that.emit(Widget.event.template, that.constructor.template);
                    console.log(allise + ".template早已被加载!");
                });
            }
        }
    }
    Widget.prototype.fillConfig = function (config/*, Config*/) {
        this.config = config || {};
        /*for (item in Config) {
            if (!(item in config)) {
                config[item] = Config[item];
            }
        }*/
        if (!('_id' in this.config)) {
            this.emit(Widget.event.config, this.config);
            this.config._id = this.constructor.allise.replace(/\./g, "-").toLocaleLowerCase() + "-" + (guid++);
        }
        this.patchConfig(this.config);
    }
    Widget.prototype._render = function (config, template, callback) {
        this.beforeRender();
        if (!this.root) {
            var allise = this.constructor.allise;
            this.root = document.createElement("div");//document.createDocumentFragment();
            this.root.id = config._id;
            this.root.className = allise.replace(/\./g, "-").toLocaleLowerCase();
            this.root.innerHTML = Template.render(template, config);
            this.delegateTrigger(); //初始化委托事件
            this.confirmDomReady();
        } else {
            this.root.innerHTML = Template.render(template, config);
            this.confirmDomReady();
        }
        this.appendWidget();
        this.afterRender();
        if (callback) {
            callback.call(this);
        }
    }
    Widget.prototype.appendWidget = function() {
        if ('contentEl' in this.config) {
            $(this.config['contentEl']).append(this.root);
        } else {
            $('body').append(this.root);
        }
    }
    Widget.prototype.confirmDomReady = function (that, id) { //that,id声明变量用，不必传参
        that = this;
        id = setInterval(function () {
            if (that.root.children.length > 0) {
                clearInterval(id);
                that.domReady.call(that);
                that.initTrigger.call(that);
            }
        }, 5);
    }
    Widget.prototype.refresh = function () {
        this._render(this.config, this.constructor.template);
    }
    Widget.prototype.show = function() {
        $(this.root).show();
    }
    Widget.prototype.hide = function() {
        $(this.root).hide();
    }
    Widget.prototype.getMainHTML = function() {
        if (this.root) {
            return this.root.outerHTML;
        } else {
            var config = this.config,
                allise = this.constructor.allise,
                template = this.constructor.template;
            var mainHTML = '<div id="{{config._id}}" class="{{allise.replace(/\\./g, "-").toLocaleLowerCase()}}">' +
                '{{Template.render(template, config)}}' +
                '</div>';
            mainHTML = mainHTML.replace(/\{\{(.*?)\}\}/g, function($0) {
                return eval($0);
            })
            return mainHTML;
        }
    }
    Widget.prototype.patchConfig = blank;
    Widget.prototype.afterRender = blank;
    Widget.prototype.beforeRender = blank;
    Widget.prototype.delegateTrigger = blank;
    Widget.prototype.domReady = blank;
    Widget.prototype.initTrigger = blank;
    return Widget;
});
