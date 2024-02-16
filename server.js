// Required modules for app functionality
// Back-end web framework for routing, middleware, and API
const express = require('express');
// Join directory paths
const { join }  = require('path');
// To write data to files
const { writeFile } = require('fs/promises');
// Generate a random UUID
const { v4: uuidv4 } = require('uuid');
// Notes data
const notes = require('./db/db.json');
// Use default port set by provider or manually set it
const PORT = process.env.PORT || 3001;
// Create instance of express function
const app = express();


// Parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: true }));
// Parse incoming requestes with JSON payloads
app.use(express.json());
// Serve static assets
app.use(express.static('public'));


// HTML Routes...
// GET / returns index.html
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

  // Find the index of the note with the matching ID
  let index = notes.findIndex(note => note.id === id);

  // Return the note
  return res.json(notes[index]);
});

// POST /api/notes returns new note in request body,
// adds it to the db.json, and returns it to the client
app.post('/api/notes', (req, res) => {
  console.log(`${req.method} request received to add a new note.`);

  const { title, text } = req.body;

  // Ensure note has a title and text
  if (req.body) {
    // Create new note object with the title, text, and generate a random UUID
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

  // Find the index of the note with the matching ID
  let index = notes.findIndex(note => note.id === id);
  console.log(`This note will be deleted: ${JSON.stringify(notes[index])}`)
  // Remove the note from the array
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