var express = require('express');
var app = express();
app.get('/', function(req, res) {
  res.send('Hello World!');
});
app.get('/health', function(req, res) {
  res.send('Still alive!');
});
app.get('/shut-down', function(req, res) {
  process.exit();
});
var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at 'http://%s:%s'", host, port);
})
