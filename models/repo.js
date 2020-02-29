const mongoose = require('mongoose')

var RepoSchema = new mongoose.Schema({
  repo_id: { type: Number, required: true, index: true },
  repo_name: { type: String }
})

console.log('[DB] Repo Schema Created.')

exports.Repo = mongoose.model('Repo', RepoSchema)
