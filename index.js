/**
 * Created by Ale on 1/29/16.
 */
var mysql = require('mysql');
var prompt = require('prompt');

prompt.start();
prompt.message = "";

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'zoo_db'
});

connection.connect(function(err){
  if(err){
    console.error('error connection: ' + err.stack);
    return;
  }
  //console.log('connected as id ' + connection.threadId);
});

var zoo = {
  welcome: function(){
    console.log("--------------------     Hello, welcome to the Zoo And Friends App~!      ------------------\n");
  },
  menu: function(){
    console.log("                         Enter (A): Add a new animal to the Zoo!\n");
    console.log("                      Enter (U): Update info on an animal in the Zoo!\n");
    console.log("                         Enter (V): Visit the animals in the Zoo!\n");
    console.log("                         Enter (D): Adopt an animal from the Zoo!\n");
    console.log("                             Enter (Q): Quit and exit the Zoo!\n");
  },
  add: function(input_scope){
    var currentScope = input_scope;
    console.log("To add an animal to the zoo please fill out the following form for us!");

    prompt.get(['caretaker_id','name','type','age'], function(err, result){
      if(err) throw err;
      var post = {caretaker_id: result.caretaker_id,name: result.name, type: result.type, age: result.age};

      connection.query('INSERT INTO animals SET ?', post, function(err, result){
        if(err) throw err;
        console.log("SUCCESS!");

        console.log("-------------------------------         Main menu!        ------------------------------------\n");
        currentScope.menu();
        currentScope.promptUser();
      });
    });
  },
  visit: function(){
    console.log("-------------------------------         Here are your choices!        ------------------------------------\n");
    console.log("               Enter (I): Do you know the animal by it's id? We will visit that animal!\n");
    console.log("              Enter (N): Do you know the animal by it's name? We will visit that animal!\n");
    console.log("                    Enter (A): Here's the count for all animals in all locations!\n");
    console.log("                    Enter (C): Here's the count for all animals in this one city!\n");
    console.log("       Enter (O): Here's the count for all the animals in all locations by the type you specified!\n");
    console.log("                              Enter (Q): Quits to the main menu!\n");
  },
  view: function(input_scope){
    var currentScope = input_scope;

    console.log("Please choose what you would like to visit!");
    prompt.get(['visit'],function(err, result){
      if(err) throw err;

      if(result.visit === "Q"){
        console.log("-------------------------------         Main menu!        ------------------------------------\n");
        currentScope.menu();
        currentScope.promptUser();
      }else if(result.visit === "O") {
        currentScope.type(input_scope);
      }else if(result.visit === "I") {
        currentScope.animId(input_scope);
      }else if(result.visit === "N") {
        currentScope.name(input_scope);
      }else if(result.visit === "A"){
        currentScope.all(input_scope);
      }else if(result.visit === "C"){
        currentScope.care(input_scope);
      }else{
        console.log("Sorry didn't get that, come again?\n");
        currentScope.visit();
        currentScope.view(currentScope);
      }
    });
  },
  type: function(input_scope){
    var currentScope = input_scope;
    console.log("\nEnter animal type to find how many animals we have of those type.");

    prompt.get(['animal_type'], function(err, result){
      if(err) throw err;

      var post = result.animal_type;
      connection.query('SELECT COUNT(*) AS theCount FROM animals WHERE type = ?', post, function(err, result){
        if(err) throw err;

        console.log("The count of type " + post + " is " + result[0].theCount);
        console.log("-------------------------------         Main menu!        ------------------------------------\n");
        currentScope.menu();
        currentScope.promptUser();
      });
    });
  },
  care: function(input_scope){
    var currentScope = input_scope;

    console.log("Enter city name NY/SF");
    prompt.get(['city_name'], function(err, result){
      if(err) throw err;

      //SELECT *
      //FROM animals
      //INNER JOIN caretakers
      //WHERE caretakers.id = animals.caretaker_id AND caretakers.city = city_name
      var post = result.city_name;
      connection.query('SELECT COUNT(*) AS theCount FROM animals INNER JOIN caretakers WHERE caretakers.id = animals.caretaker_id AND caretakers.city = ?', post, function(err, result){
        if(err) throw err;

        console.log("The number of animals in " + post + " is: " + result[0].theCount);
        currentScope.visit();
        currentScope.view(currentScope);
      });
    });
  },
  animId: function(input_scope){
    var currentScope = input_scope;

    console.log("Enter ID of the animal you want to visit");

    prompt.get(['animal_id'], function(err, result){
      if(err) throw err;

      var post = result.animal_id;
      connection.query('SELECT * FROM animals WHERE id = ?', post, function(err, rows){
        if(err) throw err;

        console.log("\n-------- Animal Information with ID: " + rows[0].id + " ---------");
        console.log("             Care Taker Id: " + rows[0].caretaker_id);
        console.log("             Type of animal: " + rows[0].type);
        console.log("             Name: " + rows[0].name);
        console.log("             Age: " + rows[0].age + "\n");
        currentScope.visit();
        currentScope.view(currentScope);
      });
    });
  },
  name: function(input_scope){
    var currentScope = input_scope;

    console.log("Enter Name of the animal you want to visit");

    prompt.get(['animal_name'], function(err, result){
      if(err) throw err;

      var post = result.animal_name;
      connection.query('SELECT * FROM animals WHERE name = ?', post, function(err, rows){
        if(err) throw err;

        console.log("\n-------- Animal Information with Name: " + rows[0].name + " ---------");
        console.log("             Care Taker Id: " + rows[0].caretaker_id);
        console.log("             Type of animal: " + rows[0].type);
        console.log("             Name: " + rows[0].name);
        console.log("             Age: " + rows[0].age + "\n");
        currentScope.visit();
        currentScope.view(currentScope);
      });
    });
  },
  all: function(input_scope) {
    var currentScope = input_scope;

    connection.query('SELECT COUNT(*) AS theCount FROM animals', function (err, result){
      if(err) throw err;

      console.log("The total amount of animals is " + result[0].theCount);
      currentScope.visit();
      currentScope.view(currentScope);
    });

  },
  update: function(input_scope){
    var currentScope = input_scope;

    prompt.get(['id','new_name','new_age','new_type','new_caretaker_id'], function(err, result){
      if(err) throw err;

      var post = {name: result.new_name, age: result.new_age, type: result.new_type, caretaker_id: result.new_caretaker_id};
      var theId = result.id;
      connection.query('UPDATE animals SET ? WHERE id = ?', [post, theId], function(err, result){
        if(err) throw err;

        console.log("SUCCESS!");
        console.log("-------------------------------         Main menu!        ------------------------------------\n");
        currentScope.menu();
        currentScope.promptUser();
      });
    });
  },
  adopt: function(input_scope){
    var currentScope = input_scope;

    prompt.get(['animal_id'],function(err, result){
      if(err) throw err;

      var post = result.animal_id;
      connection.query('DELETE FROM animals WHERE id = ?', post, function(err, result){
        if(err) throw err;

        console.log("ADOPTION COMPLETE!");
        currentScope.visit();
        currentScope.view(currentScope);
      });
    });
  },
  promptUser: function(){
    var self = this;
    console.log("Please make a selection!");

    prompt.get(['input'], function(err, result){
      if(err) throw err;

      if(result.input === "Q"){
        self.exit();
      }else if(result.input === "A"){
        self.add(self);
      }else if(result.input === "U"){
        self.update(self);
      }else if(result.input === "V"){
        self.visit();
        self.view(self);
      }else if(result.input === "D"){
        self.adopt(self);
      }else{
        console.log("Sorry didn't get that, come again?\n");
        self.promptUser();
      }
    });
  },
  exit: function(){
    console.log("\nThank you for visitings us, good bye~!\n");
    process.exit();
  },
  open: function(){
    this.welcome();
    this.menu();
    this.promptUser();
  }
}

zoo.open();
