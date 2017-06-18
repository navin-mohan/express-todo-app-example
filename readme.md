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
Awesome! You just built your first Express application. Now let's build something more sophisticated.

## The To-Do App
Before we jump in and write any code, let's take a minute and make a clear picture of what we are building here.

We need two main things to make our application functional.
* #### Store
A place to store our to-dos and other information related to it. We can use a database system for this purpose.
* #### View
An interface for the user to play around with the to-dos. We can use a template engine to build our view.

Fortunately, Express makes it very easy to integrate everything.

### The store

As mentioned above we need a store to keep all our data. Here, we will be using [MongoDB](https://www.mongodb.com/) to set up our store. There are plenty of other options too.

For convenience, let's use a [cloud](https://www.coderew.com/tech/computers/cloud-computing-intro/) hosted version of MongoDB instead of installing it on our machine. MongoDB has their own **Database as a Service(DaaS)** platform called [Atlas](https://www.mongodb.com/cloud/atlas). So sign-up(they've a free plan) for an account and create a new cluster for our project. Let's call it **todo-cluster**. Also provide a username and password which we will use later to connect to the database from Express.

Hit Confirm and Deploy. It'll take a few minutes.

Once that is complete, click on connect and grab the **URI Connection String**. Also set the IP whitelist to **ACCESS FROM ANYWHERE**(not recommended in production environment).
[mongodb-connect](images/mongodb-connect.png)

We also need to install mongodb so that Express can access it. So let's do that
```bash
npm install mongodb --save
```
Let's call the database **todo-store** (we need this later).

### Template Engine

To build our **view** we need a template engine. You got plenty of options here too but we will stick with [Handlebars](http://handlebarsjs.com/). The syntax is very simple and intuitive but flexible enough for our little to-do app.

Since Express doesn't come with Handlebars out-of-the-box we need to install it. So let's do another npm install
```bash
npm install express-handlebars --save
```
Once that is installed, create a directory to contain our views.
```bash
mkdir views
```
And another directory for our layouts(just to stay organized).
```bash
mkdir views/layouts
```

Great Job!
Now with all of that out of the way, let's get back to coding.

## Building the App

It is time put everything together with code. So create a new file called **app.js** in our project directory.

First we need to import our dependencies.
```js
const express = require('express');
const mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var exphbs  = require('express-handlebars');
```

Now let's set-up our database connection.
```js
// replace it with your URI Connection String
const url = 'mongodb://todo-db:<password>@mycluster0-shard-00-00-wpeiv.mongodb.net:27017,mycluster0-shard-00-01-wpeiv.mongodb.net:27017,mycluster0-shard-00-02-wpeiv.mongodb.net:27017/<database-name>?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin';

// initial setup
MongoClient.connect(url,(err,db) => { // connect to the database
  if (err) throw err;

  db.createCollection("todos",(err,res) => { // create a new collection called todos
    if (err) throw err;
    console.log("todos collection created");
    db.close();
  });
});

// some helper functions

function insertTodo(obj,callback) { // insert a todo into the database
  MongoClient.connect(url,(err,db) => {
    if (err) throw err;

    db.collection("todos").insertOne(obj,(err,res) => { // insert obj into todos collection
      if (err) throw err;
      console.log("Todo inserted!\n",obj);
      db.close();
    });
  });
  callback();
}

function deleteTodo(id,callback) { // delete a todo by id
  MongoClient.connect(url,(err,db) => {
    if (err) throw err;

    const query = { _id: new mongodb.ObjectId(id) }; // create a query to identify the item to be deleted

    console.log("Query: ",query);

    db.collection("todos").deleteOne(query,(err,obj) => { // delete the item
      if (err) throw err;

      console.log(obj.result.n + " document(s) deleted!");
      db.close();
    });

  });
  callback();
}

function getTodos(callback){ // get todos from the database
  MongoClient.connect(url,(err,db) => {
    if (err) throw err;

    db.collection("todos").find({}).toArray((err,res) => { // retrieve all the todos
      if (err) throw err;
      console.log("retrieved " + res.length + " todos");
      callback(res); // pass it to the callback function after retrieval
      db.close();
    });
  });
}

```

Now let's set-up the template engine.
```js
var app = express(); // create an express application

// set handlebars as the template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
```

We are ready to build our view. Let's start with our main layout.
The **{{{body}}}** part will be replaced by other views based on our code.
```html
<!-- views/layouts/main.handlebars -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>To-Do App</title>
</head>
<body>

    {{{body}}}

</body>
</html>
```

Now let's build the interface

```html
<!-- views/home.handlebars -->
<h1>
  To-Do App
</h1>
<ul>
  {{#if empty}}
    No Todos found.
  {{/if}}
  {{#each todos}}
  <li>
    <p>{{title}}</p>
    <button class="delete-btn" type="button" data-id="{{_id}}">x</button>
  </li>
  {{/each}}
</ul>

<form action="/add" method="post">
  <input type="text" name="title" placeholder="todo">
  <input type="submit" name="add" value="Add Todo">
</form>

<script>
  function deleteTodo(id) {
    // place a requests to delete todo with id
    console.log("Deleting todo ",id);

    // prepare the request
    const req = new Request('/delete',{
      headers: new Headers({
        'Content-Type': 'application/json',
      })
    });

    // send the request
    fetch(req,{
      method: 'POST',
      body: JSON.stringify({
        "id": id, // id of the todo to be deleted
      })
    }).then(function(res) {
      setTimeout(() => {location.reload();},600); // reload the page after request
    });
  }

  var btns = document.getElementsByClassName("delete-btn");
  Array.from(btns).forEach((element) => { // attach onclick listeners to all the todo delete buttons
    element.addEventListener('click',(e) => {
      console.log("Clicked!",e.target.getAttribute("data-id"));
      deleteTodo(e.target.getAttribute("data-id"));
    });
  });
</script>

```

The interface code is pretty much self-explanatory. It simply lists the todos fetched from the database, each with a delete button having an event-listener attached to them, and also provides a form for adding new todos.

**Note:** It contains ES6 code. So [transpile](https://babeljs.io/) it before deployment to get maximum browser compatibility.

Now let's move on to the routes but before that we need one more dependency to help handle JSON responses from forms.

```bash
npm install body-parser --save
```

[Body Parser](https://github.com/expressjs/body-parser) is a middle-ware that helps parse incoming request bodies. We also need to tell express to use it.
```js
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
```
Let's define our routes.

We have three different functions here
- List To-Do
- Add To-Do
- Delete To-Do

For ease of use we have already built a common interface for all these functionalities. So how do we link them together?

Since the List function is always required as the user need to see his/her To-Dos we can define that as our home(root) route. And the additional functionalities could be linked from there.

The Add and Delete routes are defined as post methods because it is simpler handle these functions as basic form submissions (see the home template).
```js
app.get('/',(req,res) => {

  // retrieve todos from the database
  getTodos((result) => {
    res.render('home',{
      todos: result, // pass it to the template
      empty: result.lenght === 0, //check if to-do list is empty
    });
  });


});

app.post('/add',(req,res)=>{

  // process an add todo request

  console.log("Post recieved!",req.body);
  insertTodo(req.body,() => {
    res.redirect('/'); // after adding redirect to the home page
  });
});

app.post('/delete',(req,res) => {

  // process a delete todo request
  console.log("Post recieved!", req.body);
  deleteTodo(req.body.id,() => { // delete todo by id
    console.log("todo deleted!");
    res.send("Done");
  });
});
```

Finally, we have to tell express to listen for our requests
```js
app.listen(3000,()=>{
  console.log("Listening on 3000!");
});
```

The app is complete! Try running it.

## Run the Application

You can start the app by executing the **app.js** file.
```bash
node app.js
```
After that go to [http://localhost:3000](http://localhost:3000) on your browser. You should see the to-do app. Initially it will be empty, try adding a to-do and play around with it.

That's it!
You have your first Express App.
