const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const existUser = users.findIndex((value) => {
    return value.username === request.headers.username;
  });

  if (existUser === -1) {
    return response.status(404).json({ error: new Error("user not exist") });
  }

  request.userIndex = existUser;

  next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const existUser = users.findIndex((value) => {
    return value.username === username;
  });

  if (existUser !== -1) {
    return response
      .status(400)
      .json({ error: new Error("user already exist") });
  }

  const newUser = {
    id: uuidv4(),
    todos: [],
    username,
    name,
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const userIndex = request.userIndex;

  const todos = users[userIndex].todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const userIndex = request.userIndex;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(),
  };

  users[userIndex].todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const userIndex = request.userIndex;
  const todos = users[userIndex].todos;

  const todoIndex = todos.findIndex((value) => {
    return value.id === request.params.id;
  });

  if (todoIndex === -1) {
    return response.status(404).json({ error: new Error("todo not exist") });
  }

  const updateTodo = { ...todos[todoIndex], ...request.body };
  users[userIndex].todos[todoIndex] = updateTodo;

  return response.status(200).json(updateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const userIndex = request.userIndex;
  const todos = users[userIndex].todos;

  const todoIndex = todos.findIndex((value) => {
    return value.id === request.params.id;
  });

  if (todoIndex === -1) {
    return response.status(404).json({ error: new Error("todo not exist") });
  }

  const updateTodo = { ...todos[todoIndex], done: true };
  users[userIndex].todos[todoIndex] = updateTodo;

  return response.status(200).json(updateTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const userIndex = request.userIndex;
  const todos = users[userIndex].todos;

  const todoIndex = todos.findIndex((value) => {
    return value.id === request.params.id;
  });

  if (todoIndex === -1) {
    return response.status(404).json({ error: new Error("todo not exist") });
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
