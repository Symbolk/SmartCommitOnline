
const express = require('express')
// var bodyParser = require('body-parser')

const app = express()

app.get('/', (req, res) => {
    res.send('No!')
})

app.listen(3000, () => {
    console.log("Listening on port: 3000")
})