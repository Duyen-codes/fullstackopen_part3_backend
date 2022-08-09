const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.hhxjjuj.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true });

//define a schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// create a model, mongoose.model(modelName, schema)
const Person = mongoose.model("Person", personSchema);

if (process.argv.length > 3) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });
  person.save().then((result) => {
    console.log("new person added");
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log("phonebook", person);
    });
    mongoose.connection.close();
  });
}
