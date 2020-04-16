const mongoose = require('mongoose')

const EntrySchema = new mongoose.Schema({
  repo_name: String,
  commit_id: String,
})

const RepoSchema = new mongoose.Schema({
  repo: String,
})

const ContactSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true, unique: true },
    name: { type: String },
    repos: [RepoSchema],
    commits: [EntrySchema],
  },
  { collection: 'contacts' }
)

console.log('[DB] Contact Schema Created.')

exports.Contact = mongoose.model('Contact', ContactSchema)
