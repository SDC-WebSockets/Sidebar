const express = require('express');
const app = express();
const port = 3004;
const path = require('path');

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})