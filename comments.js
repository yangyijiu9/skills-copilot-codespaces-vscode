// Create web server
const express = require("express");
const router = express.Router();
const passport = require("passport");
const Comment = require("../../models/Comment");
const validateCommentInput = require("../../validation/comment");

// @route   GET api/comments/test
// @desc    Tests comments route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Comments Works" }));

// @route   GET api/comments
// @desc    Get comments
// @access  Public
router.get("/", (req, res) => {
  Comment.find()
    .sort({ date: -1 })
    .then(comments => res.json(comments))
    .catch(err =>
      res.status(404).json({ nocommentsfound: "No comments found" })
    );
});

// @route   GET api/comments/:id
// @desc    Get comment by id
// @access  Public
router.get("/:id", (req, res) => {
  Comment.findById(req.params.id)
    .then(comment => res.json(comment))
    .catch(err =>
      res.status(404).json({ nocommentfound: "No comment found with that ID" })
    );
});

// @route   POST api/comments
// @desc    Create comment
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newComment = new Comment({
      text: req.body.text,
      user: req.user.id,
      post: req.body.post
    });

    const { errors, isValid } = validateCommentInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    newComment.save().then(comment => res.json(comment));
  }
);

// @route   DELETE api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comment.findById(req.params.id)
      .then(comment => {
        // Check for comment owner
        if (comment.user.toString() !== req.user.id) {
          return res
            .status(401)
            .json({ notauthorized: "User not authorized to delete comment" });
        }

        // Delete
        comment.remove().then(() => res.json({ success: true }));
    })
    .catch(err => res.status(404).json({ commentnotfound: "No comment found" }));
  })