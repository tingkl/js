/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-3-4
 * Time: 下午6:10
 * To change this template use File | Settings | File Templates.
 */
define('Template', function () {
    function Scanner(template) {
        this.tail = template;
        this.pos = 0;
        this.tokens = [];
    }

    Scanner.prototype.match = function (re) {
        var tokens = this.tokens,
            result = this.tail.match(re),
            index, token, start, length, end, tagText, tag, key;
        if (result !== null) {
            index = result.index;
            start = this.pos + index;
            if (index > 0) {
                token = ['text', this.tail.substring(0, index), this.pos, start ];
                tokens.push(token)
            }
            length = index + result[0].length;
            end = this.pos + length;
            tagText = result[1];
            tag = tagText.match(/[#^./!&@]\s*/);
            if (!tag) {
                tag = '=';
                key = tagText;
            } else {
                tag = tag[0];
                key = tagText.substring(tag.length);
                tag = tag.trim();
            }

            token = [tag, key, start, end];
            tokens.push(token);
            this.pos += length;
            this.tail = this.tail.substr(length);
        } else {
            token = ['text', this.tail, this.pos, this.pos + this.tail.length];
            tokens.push(token);
            this.pos += this.tail.length;
            this.tail = '';
        }
    }
    Scanner.prototype.eos = function () {
        return this.tail === '';
    }
    Scanner.prototype.extractTokens = function () {
        while (!this.eos()) {
            this.match(/\{\{\s*(.*?)\s*\}\}/);
        }
        return this.tokens;
    }
    function Context(view, parent) {
        this.view = view || {};
        this.parent = parent;
        this._cache = {};
    }

    Context.make = function (view) {
        return (view instanceof Context) ? view : new Context(view);
    };

    Context.prototype.push = function (view) {
        return new Context(view, this);
    };

    Context.prototype.lookup = function (name) {
        var value = this._cache[name];
        if (!value) {
            var context = this;
            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;
                    var names = name.split('.'), i = 0;
                    while (value && i < names.length) {
                        value = value[names[i++]];
                    }
                } else {
                    value = context.view[name];
                }
                if (value != null) break;
                context = context.parent;
            }
            this._cache[name] = value;
        }
        if (typeof value === 'function') value = value.call(this.view);
        return value;
    };
    var Object_toString = Object.prototype.toString;
    var isArray = Array.isArray || function (obj) {
        return Object_toString.call(obj) === '[object Array]';
    };

    function nestTokens(tokens) {
        var tree = [];
        var collector = tree;
        var sections = [];
        var token;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];
            switch (token[0]) {
                case '#':
                case '^':
                    sections.push(token);
                    collector.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    var section = sections.pop();
                    if (section[1] !== token[1]) {
                        throw new Error("Unclosed section:" + section[1] + ",position(" + section[2] + "," + section[3] + ")");
                    }
                    section[5] = token[3];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : tree;
                    break;
                default:
                    collector.push(token);
            }
        }
        return tree;
    }

    function renderTokens(tokens, context, template, index, length) {
        var buffer = '';
        var token, tokenValue, value;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];
            tokenValue = token[1];
            switch (token[0]) {
                case '#':
                    value = context.lookup(tokenValue);
                    if (typeof value === 'object') {
                        if (isArray(value)) {
                            for (var j = 0, jlen = value.length; j < jlen; ++j) {
                                buffer += renderTokens(token[4], context.push(value[j]), template, j, jlen);
                            }
                        } else if (value) {
                            buffer += renderTokens(token[4], context.push(value), template);
                        }
                    } else if (typeof value === 'function') {
                        var text = template == null ? null : template.slice(token[3], token[5]);
                        value = value.call(context.view, text);
                        if (value != null) buffer += value;
                    } else if (value) {
                        buffer += renderTokens(token[4], context, template);
                    } else {
                        if (tokenValue === 'first') {
                            if (index === 0) {
                                buffer += renderTokens(token[4], context, template);
                            }
                        } else if (tokenValue === 'last') {
                            if (index === length - 1) {
                                buffer += renderTokens(token[4], context, template);
                            }
                        }
                    }
                    break;
                case '^':
                    value = context.lookup(tokenValue);
                    if (!value || (isArray(value) && value.length === 0)) {
                        buffer += renderTokens(token[4], context, template);
                    }
                    break;
                case '&':
                    value = context.lookup(tokenValue);
                    if (value != null) buffer += value;
                    break;
                case '=':
                    value = context.lookup(tokenValue);
                    if (value != null) buffer += Template.escape(value);
                    break;
                case '@':
                    buffer += index;
                    break;
                case 'text':
                    buffer += tokenValue;
                    break;
                case '.':
                    buffer += context.view;
                    break;
            }
        }
        return buffer;
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    }
    var Template = {
        _cache: {},
        escape: function (string) {
            return String(string).replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });
        },
        render: function (template, view) {
            var fn = this._cache[template];
            if (!fn) {
                var tokens = new Scanner(template).extractTokens();
                tokens = nestTokens(tokens);
                this._cache[template] = fn = function (view) {
                    return renderTokens(tokens, Context.make(view), template)
                };
            }
            return fn(view);
        }
    }
    return Template;
})
