const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "posts",
  },
  parent: {
    type: String,
    default: 0,
  },
  depth: {
    type: String,
    default: 1,
  },
  text: {
    type: String,
    required: true,
  },
  commentActive: {
    type: Boolean,
    default: 1,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Comment = mongoose.model("comment", CommentSchema);
