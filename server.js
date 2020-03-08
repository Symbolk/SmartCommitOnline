const express = require('express')
const config = require('./config/dev')

var bodyParser = require('body-parser')
require('./db')
var CommitModel = require('./models/commit').Commit

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// let router = express.Router()

app.get('/getData', (req, res) => {
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

const fs = require('fs')
const readLocalFileSync = path => {
  return fs.readFileSync(path, 'utf-8').toString()
}

app.get('/getFileContents', (req, res) => {
  res.send({
    left_content: readLocalFileSync(req.query.left_file_path),
    right_content: readLocalFileSync(req.query.right_file_path)
  })
})

// post and save manual results
app.post('/saveResult', (req, res) => {
  console.log(req.body)
  let condition = {
    repo_name: req.body.repo_name,
    commit_id: req.body.commit_id
  }
  let result = req.body.result
  let operation = { $push: { manual_results: result } }
  CommitModel.findOneAndUpdate(condition, operation, err => {
    if (err) {
      console.log(err)
      res.send(err)
    } else {
      res.sendStatus(200)
    }
  })
})

app.use('/', (req, res) => {
  res.send('Plese run yarn serve!')
})

app.listen(config.port, () => {
  console.log('Listening on port: 3000')
})
