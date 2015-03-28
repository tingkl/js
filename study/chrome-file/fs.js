/**
 * Created by dingguoliang01 on 2014/7/9.
 */
var require = require || (function() {
    var libs = {};
    function store(name) {
        if (name in libs) {
            return libs[name];
        }
    }
    store.register = function(name, lib) {
        if (name in libs) {
            return;
        } else {
            libs[name] = lib;
        }
    }
    return store;
})();

require.register('fs', (function () {
    function errorHandler(e) {
        var msg = '';
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        }

        return msg + e.message;
    }

    var scope = {};
    scope.P = window.PERSISTENT;
    scope.T = window.TEMPORARY;
    function successProxy(callback) {
        if (callback) {
            return function () {
                Array.prototype.splice.call(arguments, 0, 0, false);
                callback.apply(null, arguments);
            }
        }
        return callback;
    }

    function failProxy(callback) {
        return function (e) {
            Array.prototype.splice.call(arguments, 0, 0, errorHandler(e));
            callback.apply(null, arguments);
        }
    }

    scope.exists = function (path, callback) {
        this.fs.root.getFile(path, {create: false}, function (fileEntry) {
            callback(true, fileEntry);
        }, function () {
            scope.fs.root.getDirectory(path, {create: false}, function (dirEntry) {
                callback(true, dirEntry);
            }, function () {
                callback(false);
            });
        });
    }
    scope.rmdir = function (path, callback) {
        var fail = failProxy(callback);
        if (typeof path === 'string') {
            this.fs.root.getDirectory(path, {create: false}, function (dirEntry) {
                scope.rmdir(dirEntry, callback);
            }, fail);
        } else {
            var dirEntry = path;
            scope.readdir(dirEntry, function (err, entrys) {
                if (err) {
                    throw err;
                }
                function next() {
                    var entry = Array.prototype.shift.call(entrys);
                    if (!entry) {
                        dirEntry.remove(successProxy(callback), fail);
                    }
                    else if (entry.isFile) {
                        scope.unlink(entry, next, fail);
                    } else if (entry.isDirectory) {
                        scope.rmdir(entry, next, fail);
                    }
                }

                next();
            });
        }
    }
    scope.unlink = function (path, callback) {
        var fail = failProxy(callback);
        if (typeof path === 'string') {
            this.fs.root.getFile(path, {create: false}, function (fileEntry) {
                fileEntry.remove(successProxy(callback), fail);
            }, fail);
        } else {
            var fileEntry = path;
            fileEntry.remove(successProxy(callback), fail);
        }
    }
    scope.link = function (path, callback) {
        path = path.trim();
        var ps = path.lastIndexOf('/');
        if (ps > 0) {
            var dir = path.substr(0, ps);
            this.mkdir(dir, function (err, dirEntry) {
                if (err) {
                    throw err;
                } else {
                    scope.fs.root.getFile(path, {create: true}, successProxy(callback), failProxy(callback));
                }
            });
        } else {
            this.fs.root.getFile(path, {create: true}, successProxy(callback), failProxy(callback));
        }
    }
    scope.readdir = function (path, callback) {
        if (typeof path === 'string') {
            path = path || '';
            this.fs.root.getDirectory(path, {create: false}, function (dirEntry) {
                scope.readdir(dirEntry, callback);
            }, failProxy(callback));
        } else {
            var dirEntry = path;
            var dirReader = (dirEntry || scope.fs.root).createReader();
            var entries = [];
            var readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        callback(false, entries.sort().reverse());
                    } else {
                        entries = entries.concat(Array.prototype.slice.call(results, 0));
                        readEntries();
                    }
                });
            }
            readEntries();
        }
    }
    scope.mkdir = function (path, callback) {
        var fail = failProxy(callback);

        function createDir(rootDir, folders) {
            rootDir.getDirectory(folders[0], {create: true}, function (dirEntry) {
                if (folders.length) {
                    createDir(dirEntry, folders.slice(1));
                } else {
                    callback(false, dirEntry);
                }
            }, fail);
        }

        createDir(this.fs.root, path.split('/'))
    }
    scope.readFile = function (path, option, callback) {
        var fail = failProxy(callback);

        this.fs.root.getFile(path, {create: false}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    callback(false, this.result, e);
                }
                var type = option.type || file.type;

                switch (type) {
                    case 'image/png':
                        reader.readAsDataURL(file);
                        break;
                    default :
                        reader.readAsText(file);
                        break;
                }
                //readAsArrayBuffer  readAsBinaryBuffer readAsDataURL
            }, fail);
        }, fail);
    }
    scope.rename = function (opt_path1, opt_path2, callback) {
        var path2 = this.resolve(opt_path2);
        this.exists(opt_path1, function (exist, entry) {
            if (exist) {
                scope.mkdir(path2.parent, function (err, dirEntry) {
                    if (err) {
                        throw err;
                    }
                    entry.moveTo(dirEntry, path2.name, successProxy(callback), failProxy(callback));
                });
            } else {
                throw new Error(opt_path1 + ' not exist!');
            }
        });
    }
    scope.copy = function (opt_path1, opt_path2, callback) {
        var path2 = this.resolve(opt_path2);
        this.exists(opt_path1, function (exist, entry) {
            if (exist) {
                scope.mkdir(path2.parent, function (err, dirEntry) {
                    if (err) {
                        throw err;
                    }
                    entry.copyTo(dirEntry, path2.name, successProxy(callback), failProxy(callback));
                });
            } else {
                throw new Error(opt_path1 + ' not exist!');
            }
        });
    }
    scope.resolve = function (path) {
        path = path.trim();
        var ps = path.lastIndexOf('/');
        var item = {};
        if (ps > -1) {
            item.name = path.substring(ps);
            item.parent = path.substring(0, ps);
            if (item.name === '/') {
                item.name = '';
                item.ext = '';
            } else {
                item.name = item.name.substr(1);
                ps = item.name.lastIndexOf('.');
                if (ps > -1) {
                    item.ext = item.name.substring(ps);
                    item.name = item.name.substring(0, ps);
                    if (item.ext === '.') {
                        item.ext = '';
                    } else {
                        item.ext = item.ext.substr(1);
                    }
                } else {
                    item.ext = '';
                }
            }
        }
        return item;
    }
    scope._writeFile = function (path, option, callback) {
        var fail = failProxy(callback);
        this.fs.root.getFile(path, {create: true}, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                if (typeof option.append === 'number') {
                    fileWriter.seek(append);
                } else if (option.append) {
                    fileWriter.seek(fileWriter.length);
                }
                fileWriter.onwriteend = function (e) {
                    callback(false, e);
                }
                fileWriter.onerror = fail;
                var contentBlob = new Blob([option.data], option);
                fileWriter.write(contentBlob);
            }, fail);
        }, fail);
    }
    scope.writeFile = function (path, option, callback) {
        if (!('append' in option)) {
            option.append = false;
        }
        if (!('type' in option)) {
            option.type = 'text/plain';
        }
        path = path.trim();
        var ps = path.lastIndexOf('/');
        if (ps > 0) {
            var dir = path.substr(0, ps);
            this.mkdir(dir, function (err, dirEntry) {
                if (err) {
                    throw err;
                } else {
                    scope._writeFile(path, option, callback);
                }
            });
        } else {
            scope._writeFile(path, option, callback);
        }
    }
    scope.appendFile = function (path, option, callback) {
        option.append = true;
        this.writeFile(path, option, callback);
    }

    scope.requestFileSystem = function (type, size, callback) {
        var success = successProxy(function (err, fs) {
            scope.fs = fs;
            callback.apply(null, [err, scope, size]);
        });
        var fail = failProxy(callback);
        if (window.requestFileSystem) {
            window.requestFileSystem(type, size, success, fail);
        } else if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(type, size, success, fail);
        } else {
            throw new Error("not possible!");
        }
    };

    scope.requestQuota = function (type, size, callback) {
        var success = function (grantedBytes) {
            scope.requestFileSystem(type, grantedBytes, callback);
        }
        var fail = failProxy(callback);
        if (navigator.webkitPersistentStorage && navigator.webkitTemporaryStorage) {
            if (type === scope.P) {
                navigator.webkitPersistentStorage.requestQuota(size, success, fail);
            } else if (type === scope.T) {
                navigator.webkitTemporaryStorage.requestQuota(size, success, fail);
            } else {
                throw new Error("not possible!");
            }
        } else {
            window.webkitStorageInfo.requestQuota(type, size, success, fail);
        }
    };
    return scope;
})());
