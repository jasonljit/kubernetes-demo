const express = require('express');
const app = express();
const http = require('http').Server(app);

let isHealthy = true;

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/health', function(req, res) {
  if (isHealthy) {
    res.send('Still Alive!');
  }
});

app.get('/sick', function(req, res) {
  isHealthy = false;

  res.send("I'm Sick!");
});

http.listen(3000, () => {
  console.log('Server running on port 3000');
});
