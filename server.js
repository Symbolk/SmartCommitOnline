const express = require('express')
const config = require('./config/dev')

var bodyParser = require('body-parser')
require('./db')
// var RepoModel = require('./model/repo').Repo

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
let router = express.Router()
app.use('/getData', (req, res) => {
  res.send(req.query.email)
})

app.use('/', (req, res) => {
  res.send('No!')
})

app.listen(config.port, () => {
  console.log('Listening on port: 3000')
})
