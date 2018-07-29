const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const config = require('config')
const path = require('path')
const app = express()
const router = require('./routes')
const PORT = process.env.PORT || config.PORT
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI

app.use(bodyParser.json())

app.use(router)

// when a user requests GET /
// send them the build folder
app.use('/', express.static(path.join(__dirname, '../build')))

app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok'
  })
})

// if express can't find any other path that matches the reques
// instead of sending a 404.html page, send back index.html
// and let react-router decide what to do with the path
app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../build/index.html')
  )
})

app.listen(PORT, async () => {
  await mongoose.connect(MONGODB_URI)
  console.log(`Listening on ${PORT}`)
})
