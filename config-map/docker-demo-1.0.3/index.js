const express = require('express');
const app = express();
const http = require('http').Server(app);

const { mode, db } = require('./config/config.json');

app.get('/', function(req, res) {
  res.send(`Hello World!`);
});

app.get('/config', function(req, res) {
  res.send(`In ${mode} mode, using ${db} as DB!`);
});

http.listen(3000, () => {
  console.log('Server running on port 3000');
});
