var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var routes = require('./routes/index');
var users = require('./routes/users');
var less = require('less')
var parser = new (less.Parser)({
    paths: [path.join(__dirname, 'views/public/stylesheets')], // 指定@import搜索的目录
    filename: path.join(__dirname, 'views/public/stylesheets/' + 'style.less') // 为了更好地输出错误信息，可以指定一个文件名
});
var fs = require('fs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', ejs.__express);
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use('', function (req, res, next) {
    var base = req.originalUrl;
    var end = base.lastIndexOf('?');
    if(end > -1) {
        base = base.substr(0, end);
    }
    if (base === '/') {
        base += 'public';
    }
    var filePath = path.join(__dirname, 'views' + base);
    fs.exists(filePath, function(exist) {
        if (exist) {
            var state = fs.statSync(filePath);
            if (state.isDirectory()) {
                if(base.lastIndexOf('/') !== base.length - 1) {
                    base += "/";
                }
                var fileList = [];
                var pathname;
                fs.readdirSync(filePath).forEach(function (file) {
                    pathname = path.join(filePath, file);
                    fileList.push({fileName: file, isDir:fs.statSync(pathname).isDirectory()});
                });
                res.render('fileList', {title:'fileList', fileList:fileList, base:base});
            } else {
                next();
            }
        } else {
            next();
        }
    });


});
app.use('/public*.css', function (req, res, next) {
    var cssPath = path.join(__dirname, 'views' + req.originalUrl);
    var lessPath = path.join(__dirname, 'views' + req.originalUrl.replace('.css', '.less'));
    var out_of_date = false;
    if (!fs.existsSync(cssPath)) {
        out_of_date = true;
    } else {
        var a = Date.parse(fs.statSync(lessPath).mtime),
            b = Date.parse(fs.statSync(cssPath).mtime);
        if (a > b) {
            // *.less was changed again
            out_of_date = true;
        }
    }
    if (out_of_date) {
        fs.readFile(lessPath, "utf-8", function (err, lessContent) {
            parser.parse(lessContent, function (err, tree) {
                if (err) {
                    next(err);
                } else {
                    fs.writeFile(cssPath, tree.toCSS(/*{ compress: true }*/), "utf-8", function (err) {
                        next(err);
                    })
                }
            });
        });
    } else {
        /*res.status(304);
         res.end();*/
        next();
    }
});
app.use('/public', express.static(path.join(__dirname, 'views/public'))); //只过滤以public开头的url
/*app.use(express.static(path.join(__dirname, 'views')));*/ //或过滤所有url

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title:'error',
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title:'error',
        message: err.message,
        error: {}
    });
});


module.exports = app;
