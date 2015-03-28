/**
 * Created by dingguoliang01 on 2014/6/9.
 */
(function (module, factory) {
    if (module.ejs) {
        return;
    } else {
        module.ejs = factory();
    }
})(window, function () {
    var ejs = {
        cache: {},
        escape: function (content) {
            return content.replace(/('|")/g, '\\$1');
        },
        _escape: function () {
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
            };
            return function (str) {
                return String(str).replace(/[&<>"'\/]/g, function (s) {
                    return entityMap[s];
                });
            }
        }(),
        render: function (tpl, config) {
            var fn;
            if (tpl in ejs.cache) {
                fn = ejs.cache[tpl];
            } else {
                fn = this.compile(this.parse(tpl));
                ejs.cache[tpl] = fn;
            }
            return fn(config, ejs._escape);
        }
    };
    ejs.compress = function (content) {
        /*return content.replace(/\n/g, '\\n');*/
        //return content.replace(/\n|\r|\t/g, '');
        var char, length, fragment = "", end, escape = false, stack = [], fragments = [];
        for (var i = 0, l = content.length; i < l; i++) {
            char = content[i];
            if ('\n\t\r'.indexOf(char) > -1) {
                continue;
            }
            if (escape) {
                escape = false;
                fragment += char;
                continue;
            }
            if (char === "'" || char === '"') {
                length = stack.length;
                if (length > 0) {
                    if (stack[length - 1] === char) {
                        stack.length = length - 1;
                        fragments.push(fragment + char);
                        fragment = "";
                    } else {
                        fragment += char;
                    }
                } else {
                    if (fragment.length) {
                        fragments.push(fragment);
                        fragment = "";
                    }
                    fragment += char;
                    stack.push(char);
                }
            } else if (char === ' ') {
                if (stack.length) {
                    fragment += char;
                } else if (fragment.length > 1) {
                    end = fragment[fragment.length - 1];
                    if (' {}();,+-*%=<>'.indexOf(end) === -1) {
                        fragment += char;
                    }
                }
            } else {
                if (char === "\\") {
                    escape = !escape;
                } else if ("(){};,+-*%=<>".indexOf(char) > -1) {
                    fragment = fragment.trim();
                }
                fragment += char;
            }
        }
        fragment = fragment.trim();
        if (fragment.length) {
            fragments.push(fragment);
        }
        return fragments.join('');
    }
    ejs.parse = function(tpl) {
        var ptn = /<%((\s|\S)*?)%>/,
            tye = /^\s*([=-])\s*/, pfx, rst, dct = [];
        var compress = ejs.compress, escape = ejs.escape;
        while (rst = tpl.match(ptn)) {
            dct.push(['html', escape(compress(tpl.substring(0, rst.index)))]);
            pfx = rst[1].match(tye);
            if (pfx) {
                dct.push([pfx[1], compress(rst[1].substring(pfx.index + pfx[1].length))]);
            } else {
                dct.push(['js', compress(rst[1])]);
            }
            tpl = tpl.substr(rst.index + rst[0].length);
        }
        if (tpl && tpl.length > 0) {
            dct.push(['html', escape(compress(tpl))]);
        }
        return dct;
    }
    ejs.compile = function (dct) {
        var item, result = "with(config){var result= '';";
        function appendStr(str) {
            result += str;
        }
        result = ejs.compress(appendStr.toString() + ";") + result;
        for (var i = 0, l = dct.length; i < l; i++) {
            item = dct[i];
            switch (item[0]) {
                case 'html':
                    result += "appendStr('" + item[1] + "');";
                    break;
                case 'js':
                    result += item[1];
                    break;
                case '=':
                    result += "appendStr(escapeStr(" + item[1] + "));";
                    break;
                case '-':
                    result += "appendStr(" + item[1] + ");";
                    break;
            }
        }
        return new Function("config", 'escapeStr', result + "return result;}");
    }
    return ejs;
});