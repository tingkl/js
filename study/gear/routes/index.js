var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get('/ajax', function(req, res) {
    res.json([{'name':'ok',id:1},{'name':'no',id:2}]);
});

module.exports = router;
