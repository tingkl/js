(function (module, factory) {
    if (module.require) {
        return;
    } else {
        var fac = factory(module);
        module.require = fac.require;
        module.define = fac.define;
    }
})(window, function (module) {

    function Require() {
        Require.superClass.call(this);
    }
    ClassManager.define('Require', Require);
    ClassManager.extend('Require', 'EventEmitter');
    Require.prototype.injection = function(dependency, callback) {
        return function() {
            var Clz;
            if(typeof dependency === 'string') {
                Clz = callback.call(module, ClassManager.get(dependency));
            } else if (dependency instanceof Array) {
                var vars = [];
                dependency.each(function(dep){
                    vars.push(ClassManager.get(dep));
                });

                Clz = callback.apply(module, vars);
            } else {
                Clz = callback();
            }
            return Clz;
        }
    }
    Require.prototype.proxy = function (dependency, domain, callback) {
        var me = this;
        var inject = this.injection(dependency, callback);
        return function () {
            var Clz = inject();
            if (!Clz) {
                throw new Error('未返回类定义!');
            } else {
                ClassManager.define(domain, Clz);
            }
           /* console.log(ClassManager._require.routes);*/
            me.emit(domain);
        }
    }
    Require.prototype.define = function (domain, callback) {
        var Clz = callback();
        if (!Clz) {
            throw new Error('未返回的class！');
        } else {
            ClassManager.define(domain, Clz);
            this.emit(domain);
        }
    }
    Require.prototype.require = function (dependency, domain, callback) {
        var status = ClassManager.status(dependency);
        if (!status) {
            ClassManager.status(dependency, 'loading');
            this.once(dependency, this.proxy(dependency, domain, callback));
            this.loadScript(dependency);
        } else if (status === 'loading') {
            this.once(dependency, this.proxy(dependency, domain, callback));
           // console.log('class:' + dependency + '正在被加载......');
        } else if (status === 'loaded') {
            this.proxy(dependency, domain, callback)();
            //console.log('class:' + dependency + '已加载.');
        }
    }

    Require.prototype.loadScript = function (domain) {
        var script = document.createElement('script');
        script.setAttribute('src', this.domain2Path(domain));
        var loaded = false;
        script.onload = function () {
            if (loaded) {
            } else {
                loaded = true;
            }
            script.onload = null;
            script.onreadystatechange = null;
        };
        script.onreadystatechange = function () {
            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                if (loaded) {

                } else {
                    loaded = true;
                }
                script.onload = null;
                script.onreadystatechange = null;
            }
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    Require.prototype.requireLoad = function (dependency, callback) {
        var lacks = ClassManager.filterExist(dependency),
            lack,
            status;
        this.all(lacks, this.injection(dependency, callback));
        for (var i = 0, l = lacks.length; i < l; i++) {
            lack = lacks[i];
            status = ClassManager.status(lack);
            if (!status) {
                ClassManager.status(lack, 'loading');
                this.loadScript(lack);
            } else if (status === 'loaded') {
                throw new Error('class:' + lack + '异步加载错误!');
            }
        }

    }
    Require.prototype.requireAll = function (dependency, domain, callback) {
        var lacks = ClassManager.filterExist(dependency),
            lack,
            status;
        this.all(lacks, this.proxy(dependency, domain, callback));
        for (var i = 0, l = lacks.length; i < l; i++) {
            lack = lacks[i];
            status = ClassManager.status(lack);
            if (!status) {
                ClassManager.status(lack, 'loading');
                this.loadScript(lack);
            } else if (status === 'loaded') {
                throw new Error('class:' + lack + '异步加载错误!');
            }
        }
    }

    Require.prototype.domain2Path = function (domain) {
        return this.loadDir + domain.replace(/\./g, '/') + '.js';
    }
    var require = new Require();
    require.loadDir = "/public/javascripts/";
    ClassManager._require = require;
    return {
        define: function () {
            if (arguments.length === 2) {
                var paramOne = arguments[0];
                var paramTwo = arguments[1];
                if (typeof paramTwo !== 'function') {
                    throw new Error('2个参数，参数2不为function，错误的类型！');
                } else {
                    if (typeof  paramOne === 'string') {
                        require.define(paramOne, paramTwo);
                    } else {
                        throw new Error('2个参数，参数1不为string，错误的参数类型！');
                    }
                }
            } else if (arguments.length === 3) {
                var paramOne = arguments[0];
                var paramTwo = arguments[1];
                var paramThree = arguments[2];
                if (typeof paramThree !== 'function') {
                    throw new Error('3个参数，参数3不为function，错误的类型！');
                } else {
                    if (typeof paramTwo !== 'string') {
                        throw new Error('3个参数，参数2不为string，错误的类型！');
                    } else {
                        if (typeof paramOne === 'string') {
                            require.require(paramOne, paramTwo, paramThree);
                        } else if (paramOne instanceof Array) {
                            require.requireAll(paramOne, paramTwo, paramThree);
                        } else {
                            throw new Error('3个参数，参数1不为string or array，错误的类型！');
                        }
                    }
                }
            } else {
                throw new Error('错误的参数个数！');
            }
        },
        require: function () {
            if (arguments.length === 1) {
                var paramOne = arguments[0];
                var type = typeof paramOne;
                if (type === 'function') {
                    paramOne();
                } else if (type === 'string') {
                    require.loadScript(paramOne);
                } else if (paramOne instanceof Array) {
                    for (var i = 0, l = paramOne.length; i < l; i++) {
                        require.loadScript(paramOne[i]);
                    }
                } else {
                    throw new Error('paramOne:错误的参数类型!');
                }
            } else if (arguments.length === 2) {
                var paramOne = arguments[0];
                var paramTwo = arguments[1];
                if (typeof paramTwo !== 'function') {
                    throw new Error('2个参数，参数2不为function，错误的类型！');
                } else if (paramOne instanceof Array) {
                    require.requireLoad(paramOne, paramTwo);
                } else {
                    throw new Error('2个参数，参数1不为array，错误的参数类型！');
                }
            }
        }
    };
});
