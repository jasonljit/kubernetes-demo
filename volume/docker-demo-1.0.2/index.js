const express = require('express');
const app = express();
const http = require('http').Server(app);

app.get('/', function(req, res) {
  res.send('Hello World!');
});

http.listen(3001, () => {
  console.log('Server running on port 3001');
});
