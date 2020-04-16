const express = require('express')
const config = require('./config/dev')
const logger = require('morgan')
const FileStreamRotator = require('file-stream-rotator')
const fs = require('fs')
const path = require('path')
// const mongoose = require('mongoose')

var bodyParser = require('body-parser')
const mg = require('./db')
var CommitModel = require('./models/commit').Commit
var ContactModel = require('./models/contact').Contact

const app = express()

var logDir = __dirname + '/logs'
console.log('Access logs:' + logDir)
// ensure log directory exists
fs.existsSync(logDir) || fs.mkdirSync(logDir)
// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDir, '%DATE%.log'),
  frequency: 'daily',
  verbose: false,
})
// let singleLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

// setup the logger
app.use(
  logger(
    'dev',
    {
      skip: function(req, res) {
        return (
          res.statusCode == 304 ||
          res.statusCode == 302 ||
          res.statusCode == 200
        )
      },
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

const findInCol = (name, query, cb) => {
  mg.connection.db.collection(name, function(err, collection) {
    collection.find(query).toArray(cb)
  })
}

app.get('/getData', (req, res) => {
  let user = { email: req.query.email }
  // find repo/col name by email in contacts
  console.log(user.email)
  ContactModel.findOne(user, function(err, doc) {
    if (err) {
      console.log(err)
    } else {
      if (doc) {
        let repo = doc.repos[0].repo
        console.log(repo)
        // find commits data
        let condition = { committer_email: user.email }
        findInCol(repo, condition, (err, docs) => {
          if (err) {
            console.log(err)
          } else {
            console.log(docs.length)
            res.send(docs)
          }
        })
      } else {
        res.send([])
      }
    }
  })
})

const readLocalFileSync = (path) => {
  return fs.readFileSync(path, 'utf-8').toString()
}

app.get('/getFileContents', (req, res) => {
  res.send({
    left_content: readLocalFileSync(req.query.left_file_path),
    right_content: readLocalFileSync(req.query.right_file_path),
  })
})

// post and save manual results
app.use('/saveResult', (req, res) => {
  let condition = {
    repo_name: req.body.repo_name,
    commit_id: req.body.commit_id,
  }
  let result = req.body.result
  let operation = { $push: { manual_results: result } }
  CommitModel.findOneAndUpdate(condition, operation, (err) => {
    if (err) {
      console.log(err)
      res.send(err)
    } else {
      console.log(req.body)
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
