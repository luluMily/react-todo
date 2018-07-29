const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema({
  description: { type: String, required: true },
  index: { type: Number, required: false },
  user: { type: Schema.Types.ObjectId, ref: 'user' },
  completed: { type: Boolean, default: false }
})

module.exports = mongoose.model('todo', todoSchema)
