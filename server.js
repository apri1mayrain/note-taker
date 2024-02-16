const express = require('express');
const { writeFile } = require('fs/promises');
const { join }  = require('path');
const { v4: uuidv4 } = require('uuid');

const notes = require('./db/db.json');

const PORT = process.env.PORT || 3001;

const app = express();

// Parse incoming urlencoded payloads
app.use(express.urlencoded({ extended: true }));
// Parse incoming JSON payloads
app.use(express.json());
app.use(express.static('public'));


// HTML Routes...
app.get('/', (req, res) =>
  res.sendFile(join(__dirname, 'index.html'))
);

// GET /notes returns notes.html
app.get('/notes', (req, res) => 
  res.sendFile(join(__dirname, '/public/pages/notes.html'))
);

// API Routes...
// GET /api/notes returns all notes saved in db.json
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

// GET /api/notes/:id that returns the note of the queried ID
app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  console.log(`${req.method} request received to view note with ID: ${id}`);

  // Search for the note with the ID
  let index = notes.findIndex(note => note.id === id);
  return res.json(notes[index]);
});

// POST /api/notes returns new note in request body,
// adds it to the db.json, and returns it to the client
app.post('/api/notes', (req, res) => {
  console.log(`${req.method} request received to add a new note.`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    // New note returned in POST request body
    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);

    // Save new note to db.json
    notes.push(newNote)
    writeFile('./db/db.json', 
              JSON.stringify(notes), 
              (error) => 
                console.error(`There was an error saving notes to db.json: ${error}`));

    // Return notes to client
    return res.json(notes);
  }
});

// DELETE /api/notes/:id will remove the note with the given id property,
// and then rewrite the notes to the db.json file
app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  console.log(`${req.method} request received to delete note with ID: ${id}`);

  // Search for the note with the ID
  let index = notes.findIndex(note => note.id === id);
  console.log(`This note will be deleted: ${JSON.stringify(notes[index])}`)
  notes.splice(index, 1);
  
  // Save updated notes to db.json
  writeFile('./db/db.json', 
            JSON.stringify(notes), 
            (error) => 
              console.error(`There was an error saving notes to db.json: ${error}`));

  // Return notes to client
  return res.json(notes);
});


// Fallback HTML route...
// GET * returns index.html
app.get('*', (req, res) =>
  res.sendFile(join(__dirname, '/public/index.html'))
);

// Start app
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);