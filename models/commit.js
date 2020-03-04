const mongoose = require('mongoose')
const HunkSchema = new mongoose.Schema({
  git_path: String,
  file_path: String,
  start_line: Number,
  end_line: Number,
  content: String,
  content_type: String
})

const DiffHunkSchema = new mongoose.Schema({
  file_index: Number,
  diff_hunk_index: Number,
  file_type: String,
  change_type: String,
  description: String,
  a_hunk: HunkSchema,
  b_hunk: HunkSchema
})

const GroupSchema = new mongoose.Schema({
  group_id: { type: String, required: true, index: true },
  group_label: String,
  diff_hunks: [DiffHunkSchema]
})

const CommitSchema = new mongoose.Schema(
  {
    //   repo_id: { type: Number, required: true, index: true },
    repo_name: { type: String, required: true },
    commit_id: { type: String, required: true, index: true },
    committer_name: { type: String, required: true },
    committer_email: { type: String, required: true, index: true },
    groups: [GroupSchema]
  },
  { collection: 'commits' }
)

console.log('[DB] Commit Schema Created.')

exports.Commit = mongoose.model('Commit', CommitSchema)
