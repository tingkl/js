/**
 * Created by dingguoliang01 on 2014/12/31.
 */
var less = require('less');
var parser = new(less.Parser)({
    paths: [__dirname], // Specify search paths for @import directives
    filename: 'style.less' // Specify a filename, for better error messages
});

var fs = require('fs');
var lessContent = fs.readFileSync('styles.less').toString();
parser.parse(lessContent, function (e, tree) {
    var css = tree.toCSS({ compress: false }); // Minify CSS output
    fs.writeFileSync('out.css', css);
});