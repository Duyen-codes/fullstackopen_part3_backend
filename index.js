// import http built-in web server module http
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

morgan.token("request-body", function getId(req) {
  const json = JSON.stringify(req.body);
  return json;
});
app.use(
  morgan(
    " :method :url :status :res[content-length] - :response-time ms :request-body"
  )
);

// middleware
app.use(express.static("build"));
app.use(express.json());
app.use(requestLogger);
app.use(cors());

// HTTP request is answered by using send method of the response object

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.status(200).json(persons);
  });
});

// route for fetching a single resource
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: "name or number is missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 10000),
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson.toJSON());
    })
    .catch((error) => next(error));
});

// 3.4 route for deleting a resource
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// route for updating person
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson.toJSON());
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

// this has to be the last loaded middlware, handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
