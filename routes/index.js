var express = require('express');
var router = express.Router();
var http = require('http');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Contact Us' });
  // res.render('admin', { title: 'Admin' });
});

router.get('/admin', function(req, res, next) {
  // res.render('index', { title: 'Contact Us' });
  res.render('admin', { title: 'Admin Side' });
});

module.exports = router;
