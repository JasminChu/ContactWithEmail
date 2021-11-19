var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sendEmail', (req, res) => {
 let emailData = req.body
console.log(`title: ${emailData.title} 
body: ${emailData.body}`)
  res.send('Book is added to the database');
});

module.exports = router;
