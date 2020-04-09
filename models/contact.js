const mongoose = require('mongoose')

const ContactSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    repo_name: { type: [String]},
  },
  { collection: 'contacts' }
)

console.log('[DB] Contact Schema Created.')

exports.Contact = mongoose.model('Commit', ContactSchema)
