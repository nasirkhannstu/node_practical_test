const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const User = require("../../models/User");
const Comment = require("../../models/Comment");

// @route    GET api/comment/:id
// @desc     Comments of a post
// @access   Private
router.get("/:id", [auth], async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id });

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let depth = 1;
    if (req.body.parent) {
      const parent = await Comment.findById(req.body.parent);
      depth = parseInt(parent.depth);
      depth = depth + 1;
    } else {
      req.body.parent = 0;
    }
    if (depth > 3) {
      res.status(404).send("Invalid Comment");
    }
    try {
      const comment = new Comment({
        user: req.user.id,
        post: req.params.id,
        text: req.body.text,
        parent: req.body.parent,
        depth: depth,
      });

      await comment.save();

      res.json(comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    POST api/comment/:id/can_comment/:comment_id
// @desc     Can Comment Status
// @access   Private
router.post("/:id/can_comment/:comment_id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    if (comment.commentActive) {
      comment.commentActive = 0;
    } else {
      comment.commentActive = 1;
    }

    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
