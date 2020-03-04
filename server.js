const express = require('express')
const config = require('./config/dev')

var bodyParser = require('body-parser')
require('./db')
var CommitModel = require('./models/commit').Commit

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// let router = express.Router()

app.use('/getData', (req, res) => {
  let user = { email: req.query.email }
  console.log(user.email)
  // res.send('Hello ' + req.query.email)
  // res.send('Hello ' + req.body.email)
  let condition = { committer_email: user.email }
  CommitModel.find(condition, function(err, docs) {
    if (err) {
      console.log(err)
    } else {
      console.log(docs.length)
      res.send(docs)
    }
  })
})

var fs = require('fs')
const readLocalFile = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}
app.use('/getFileContent', (req, res) => {
  readLocalFile(req.query.file_path)
    .then(content => {
      res.send(content)
    })
    .catch(err => {
      console.log(err)
    })
})

app.use('/', (req, res) => {
  res.send('No!')
})

app.listen(config.port, () => {
  console.log('Listening on port: 3000')
})
