const express = require('express');
const app     = express();

// define the routes
app.get('/',(req,res) => { // get root
  console.log("GET request recieved");
  res.send('Hello Express!');
});

// listen for requests on port 3000
app.listen(3000,() => {
  console.log("Hello Express running on port 3000!");
});
