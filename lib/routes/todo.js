const express = require("express");
const Router = express.Router;
const router = Router();
const Todo = require("../models/todo");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, (req, res) => {
  const { user } = req.decoded;
  Todo.find({ user: user.id })
    .then(docs => {
      res.status(200).send({
        message: "success",
        payload: docs
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

router.post("/", verifyToken, (req, res) => {
  const { description, index, completed } = req.body
  const { user } = req.decoded
  const todo = new Todo({
    description,
    index,
    completed,
    user: user.id
  });
  todo
    .save()
    .then(doc => {
      res.status(200).send({ message: "success", payload: doc });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

router.put("/", verifyToken, (req, res, next) => {
  const todos = req.body;
  console.log(req)
  try {
    todos.forEach ((todo) => {
      Todo.updateOne({_id : todo._id}, todo, () => {
        console.log(todo);
      })
    })

    res.status(200).send({ message: "success", payload: todos });

    } catch (e) {
    next(e)
  }
})

module.exports = router;
