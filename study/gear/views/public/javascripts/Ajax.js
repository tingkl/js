/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-1-25
 * Time: 下午2:36
 * To change this template use File | Settings | File Templates.
 */
define('Deferred', 'Ajax', function (Deferred) {
    function Proxy(method, url, async, postVars) {
        this.request = function () {
            return Ajax.request(method, url, async, postVars);
        }
    }

    function Ajax(loadDir) {
        this.loadDir = loadDir;
    }

    Ajax.prototype.proxy = function (method, url, async, postVars) {
        return new Proxy(method, url, async, postVars);
    }
    Ajax.prototype.send = function(xhr, method, url, postVars, async) {
        //xhr.setRequestHeader("If-Modified-Since","Sat, 1 Jan 2000 00:00:00 GMT");
        xhr.open(method, url, async);
        if (method.toUpperCase() != "POST") {
            postVars = null;
        } else {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.send(postVars)
    }
    Ajax.prototype.domain2Path = function (domain, suffix) {
        return this.loadDir + domain.replace(/\./g, '/') + suffix;
    }
    Ajax.prototype.loadTemplate = function(domain) {
        return this.async('GET', this.domain2Path(domain, '.html') + "?random="  + Math.random());
    }
    Ajax.prototype.loadCss = function(domain) {
        var link = document.createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href =  this.domain2Path(domain, '.css');
        document.getElementsByTagName('head')[0].appendChild(link);
        /*this.async('GET', this.domain2Path(domain, '.css')).then(function(success, css){
            console.log(success, css);
            var style = document.createElement('style');
            style.innerHTML = css;
            document.getElementsByTagName('head')[0].appendChild(style);
        },function(error, msg) {
            throw new Error(msg);
        });*/
    }
    Ajax.prototype.sync = function(method, url, postVars) {
        var xhr = this.createXhrObject();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status === 200) {

            } else {
                throw new Error('Ajax.sync[xhr.status:' + xhr.status+ ']')
            }
        };
        this.send(xhr, method, url, postVars, false);
        return xhr.responseText;
    }
    Ajax.prototype.async = function (method, url, postVars) {
        var deferred = ClassManager.create('Deferred');
        var xhr = this.createXhrObject();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                deferred.progress(xhr.readyState);
                return;
            }
            (xhr.status == 200) ? deferred.resolve(xhr.responseText, url) : deferred.reject(xhr.status);
        };
        this.send(xhr, method, url, postVars, true);
        return deferred.promise;
    }
    Ajax.prototype.createXhrObject = function () {
        var methods = [
            function () {
                return new XMLHttpRequest();
            } ,
            function () {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }  ,
            function () {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        ];
        var xhrObject;
        for (var i = 0; i < methods.length; i++) {
            try {
                xhrObject = methods[i]();
            }
            catch (e) {
                continue;
            }
            this.createXhrObject = methods[i];
            return xhrObject;
        }
    }
    var ajax = new Ajax('/public/javascripts/');
    return ajax;
});