(function (module, factory) {
    if (module.ClassManager) {
        return;
    } else {
        module.ClassManager = factory(module);
    }
})(window, function (module) {
    var classes = {};
    var status = {};
    var single = {};
    var classManager = {
        classes: classes,
        st: status,
        define: function (name, Clz) {
            if (name in classes) {
                throw new Error('Class:' + name + '已定义！');
            } else {
                if (typeof Clz === 'function' ) {
                    Clz.allise = name;
                    classes[name] = Clz;
                } else {
                    var con = Clz.constructor;
                    con.allise = name;
                    classes[name] = con;
                    module[name] = Clz;
                    single[name] = Clz;
                }
                this.status(name, 'loaded');
                //console.log("after class:" + name + " defined!");
            }

        },
        status: function (name, value) {
            if (!value) {
                return status[name];
            } else {
                status[name] = value;
               // console.log('更新' + name + '状态:' + value);
            }
        },
        create: function (name, config) {
            var Clz = classes[name];
            if (Clz) {
                return new Clz(config);
            } else {
                throw new Error('Class:' + name + '未定义!');
            }
        },
        exist: function(domain) {
            return domain in classes;
        },
        filterExist: function(domains) {
            var lack = [],
                domain;
            for (var i = 0, l = domains.length; i < l; i++) {
                domain = domains[i];
                if (domain in classes) {
                } else {
                    lack.push(domain);
                }
            }
            return lack;
        },
        get: function(name) {
            if(name in single) {
                return single[name];
            } else if(name in classes) {
                return classes[name];
            } else {
                throw new Error('Class:' + name + '未定义!');
            }
        },
        extend: function (child, parent) {
            var Child = null,
                Parent = null;
            if (typeof child === 'function') {
                Child = child;
            } else if (typeof child === 'string') {
                Child = this.get(child);
            }
            if (Child === null) {
                throw new Error('Child类型错误！');
            }
            if (typeof parent === 'function') {
                Parent = parent;
            } else if (typeof parent === 'string') {
                Parent = this.get(parent);
            }
            if (Parent === null) {
                throw new Error('Parent类型错误！');
            }
            var Clz = new Function();
            Clz.prototype = Parent.prototype;
            Child.prototype = new Clz();
            Child.prototype.constructor = Child;
            Child.superClass = Parent;
        }
    };
    return classManager;
});