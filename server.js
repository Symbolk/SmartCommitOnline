const express = require('express')
const config = require('./config/dev')

var bodyParser = require('body-parser')
require('./db')
var RepoModel = require('./models/repo').Repo

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// let router = express.Router()

app.use('/getData', (req, res) => {
  // let user = { email: req.query.email }
  // console.log(req)
  res.send('Hello ' + req.query.email)
  // res.send('Hello ' + req.body.email)
  // let condition = { email: user.email }
  // RepoModel.findOne(condition, function(err, doc) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     if (doc) {
  //       res.send(doc)
  //     }
  //   }
  // })
})

app.use('/', (req, res) => {
  res.send('No!')
})

app.listen(config.port, () => {
  console.log('Listening on port: 3000')
})
