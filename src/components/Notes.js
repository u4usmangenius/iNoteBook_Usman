import React, { useContext } from "react";
import Noteitem from "./Noteitem";
// here is ther error

// import NoteContext from "../context/notes/NoteState";
import NoteContext from "../context/notes/NoteContext";
const Notes = () => {
  const context = useContext(NoteContext);
  const { notes, setNotes } = context;

  // const { notes, setNotes } = useContext(NoteContext);

  //   const { notes } = useContext(NoteContext);

  console.log("------------------------------------------");
  console.log(notes, "notes");
  return (
    <div className="row my-3">
      <h2>You Notes</h2>
      {notes.map((note) => {
        return <Noteitem note={note} />;
        // return <Noteitem key={note._id} note={note} />;
      })}
    </div>
  );
};

export default Notes;
