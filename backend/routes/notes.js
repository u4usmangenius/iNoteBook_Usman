const express = require("express");
const Router = express.Router();
const Note = require("../models/Notes");
var fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
// ROUTE 1: Get All the Notes using: GET "/api/auth/getuser". Login required
Router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Add a new Note using: POST "/api/note/addnote". Login required
Router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      console.log(res.user);

      const { title, description, tag } = req.body;

      // If there are errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Update an existing Note using: POST "/api/notes/updatenote". Login required
Router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  // Create a newNote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }
  try {
    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //chech whether note belong to same user.
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    res.status(402).send("Internal Server Error");
  }
});

//// ROUTE 4: Delete an existing Note using: dlelte "/api/notes/deletenote". Login required
Router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
        return res.status(404).send("Not Found");
        }
        //chech whether note belong to same user.
        if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });
        
  } catch (error) {
    console.log(error);
    res.status(503).send("Internal Server Error");
  }
});

module.exports = Router;
