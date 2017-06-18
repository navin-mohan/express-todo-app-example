const express = require('express');
const mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var exphbs  = require('express-handlebars');


var app = express(); // create an express application

// set handlebars as the template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// for handling post requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// some helper functions
function insertTodo(obj,callback) {
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


// routes

app.get('/',(req,res,next) => {

  // retrieve todos from the database
  getTodos((result) => {
    res.render('home',{
      todos: result, // pass it to the template
      empty: result.lenght === 0,
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


// listen for requests on port 3000
app.listen(3000,()=>{
  console.log("Listening on 3000!");
});
