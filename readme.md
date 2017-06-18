# A Simple To-do Application using Expressjs
Express is a fast and minimalist web framework based on Nodejs.

---
## Getting Started

Install [Nodejs](https://nodejs.org/) before proceeding to the next steps.

### Installing Expressjs

Let's begin by creating a new directory to contain our application.
```bash
mkdir express-todo
cd express-todo
```

Once inside the directory create the **package.json** file for our application.

```bash
npm init
```

Provide the required information. In our case we will leave them as default.

Now let's actually install Express.
```bash
npm install express --save
```
If everything went fine there will be a new directory called **node_modules** in our project directory. This is where npm stores all the dependencies for our project.

## Hello Express!

Now that we've got everything installed, let's run a classic helloworld example to see if everything is working.

For that create a new file , let's call it **helloworld.js**.
```bash
touch helloworld.js
```
Open it using your favourite text editor ([Atom :heart:](https://atom.io/)) and add the following code to it.
```js
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

```

Now save and run it.
```bash
# you must be inside your project directory
node helloworld.js
```
Go to **http://localhost:3000** in your browser. You should see the Hello Express! message there.
```bash
# you should see something like this on your terminal
Hello Express running on port 3000!
GET request recieved
```
