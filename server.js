const express = require('express')
const config = require('./config/dev')
const logger = require('morgan')
const FileStreamRotator = require('file-stream-rotator')
const fs = require('fs')

var bodyParser = require('body-parser')
require('./db')
var CommitModel = require('./models/commit').Commit

const app = express()

var logDir = __dirname + '/logs'
console.log('Access logs:' + logDir)
// ensure log directory exists
fs.existsSync(logDir) || fs.mkdirSync(logDir)
// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDir + '/%DATE%.log',
  frequency: 'daily',
  verbose: false
})
// setup the logger
app.use(
  logger(
    'dev',
    {
      // skip: function(req, res) {
      //   return (
      //     res.statusCode == 304 ||
      //     res.statusCode == 302 ||
      //     res.statusCode == 200
      //   )
      // }
    },
    { stream: accessLogStream }
  )
)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// let router = express.Router()
// app.disable('etag')

// Control-Allow-Origin
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next()
})

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
app.use('/saveResult', (req, res) => {
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
      console.log(req.body)
      res.send('OK')
    }
  })
})

app.use('/', (req, res) => {
  res.send('Plese run yarn serve!')
})

app.listen(config.port, () => {
  console.log('Listening on port: 3000')
})
