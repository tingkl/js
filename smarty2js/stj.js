/**
 * Created by dingguoliang01 on 2014/6/9.
 */

var stj = {
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
stj.compress = function (content) {
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
stj.parse = function (tpl) {
    // \s是指空白，包括空格、换行、tab缩进等所有的空白，而\S刚好相反
    // 这样一正一反下来，就表示所有的字符，完全的，一字不漏的
    var ptn = /{%((\s|\S)*?)%}/,
        tye = /^\s*([=-])\s*/, pfx, rst, dct = [];
    var compress = stj.compress, escape = stj.escape, smarty2JS = stj.smarty2JS;
    while (rst = tpl.match(ptn)) {
        dct.push(['html', escape(compress(tpl.substring(0, rst.index)))]);
        // rst[1]为smarty代码
        /*pfx = rst[1].match(tye);
        // 至于怎么解析smarty代码之后考虑
        if (pfx) {
            dct.push([pfx[1], compress(rst[1].substring(pfx.index + pfx[1].length))]);
        } else {
            dct.push(['js', compress(rst[1])]);
        }*/
        dct.push(['smarty', compress(smarty2JS(rst[1]))]);
        tpl = tpl.substr(rst.index + rst[0].length);
    }
    if (tpl && tpl.length > 0) {
        dct.push(['html', escape(compress(tpl))]);
    }
    return dct;
};
var sum = 0;
var token = '';
var p = 0;
var item;
stj.prefetching = function (state, offset) {
    offset = offset || 0;
    this.deSpace(state);
    return state.prog[state.p + offset];
};
stj.deSpace = function (state) {
    var p = state.p;
    var prog = state.prog;
    while (prog[p] === ' ') {
        p++;
    }
    state.p = p;
};
// {prog:'', p: 0}
stj.scaner = function (state) {
    sum = 0;
    token = '';
    var ch = this.prefetching(state);
    if ((ch === '$')) {
        while(((ch <= 'z')&&(ch>='a'))||((ch>='A')&&(ch<='Z'))) {
            token += ch;
            ch = state.prog[state.p++]
        }
        state.p--;
        item = {variable: token, wrap: []};
        ch = this.prefetching(state);
        if (ch === '@') {

        }
        else if (ch === '|') {
            if (this.prefetching(state, 1) !== '|') {
                item.wrap.push({prefix: '|'});
            }
            else {

            }
        }
    }
};
stj.smarty2JS = function (smarty) {

};
/*stj.smarty2JS = function (smarty) {
    var res;
    if (res = smarty.match(/\s*foreach\s*(.*?)\s*as\s*(.*?)\s*//*)) {
        var array = res[1];
        var cell = res[2];
        return '$.each(' + array + ', function(index, ' + cell + ') {';
    }
    // if $item@last if $item@first && $displayNone>=2  if !$item.date[0]
    else if (res = smarty.match(/\s*if\s*(.*)/)) {
        var conditions = res[1].trim();

    }
    // /if
    else if (res = smarty.match(/\s*\/if\s*//*)) {
        return '}';
    }
    else if (res = smarty.match(/\s*\/foreach\s*//*)) {
        return '});'
    }
    // call name=\"patchUrl\"url=$item.href
    else if (res = smarty.match(/call\s*name=\\"patchUrl\\"\s*url=([^\s]*)/)) {
        return res[1];
    }
    else if
    // $item.img|ssl_url_r  $item.name|limitlen: 89
    // $okDate=array()
    // $item.date=array($item.date)
    // $ary=preg_split(\"/年|月|日/\",$date)
    // $compareDate=$ary[0]|cat:'年'
};*/
stj.compile = function (dct) {
    var item, result = "with(config){var result= '';";

    function appendStr(str) {
        result += str;
    }

    result = stj.compress(appendStr.toString() + ";") + result;
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

var fs = require('fs');
var text = fs.readFileSync('test.html', 'utf-8').toString();
fs.writeFileSync('result.json', JSON.stringify(stj.parse(text), true, 4));
