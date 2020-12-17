import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '', image: 'No files chosen' };

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const style = {marginBottom: '10px'};

  useEffect(() => {
    fetchNotes();
  }, []);


  //Function invoked when file input is changed
  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  async function onClick(e) {
    // Set event target value to null to prevent form reload
    e.target.value = null;
  }

  //List notes on the form by calling graphql query.
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        console.log(note.image);
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  //Creates a note by calling create note mutation.
  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      console.log(formData.image);
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setFormData(initialFormState);
    fetchNotes();
  }

  //Deletes a note by calling delete note mutation.
  async function deleteNote({ id }) {
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
    fetchNotes();
  }

  return (
    <div className="App">
      <div className="main">
        <h1>My Notes App</h1>
        <div className="container">
          <input
            onChange={e => setFormData({ ...formData, 'name': e.target.value})}
            placeholder="Note name"
            value={formData.name}
            style={style}
          />
          <input
            onChange={e => setFormData({ ...formData, 'description': e.target.value})}
            placeholder="Note description"
            value={formData.description}
            style={style}
          />
          <div className="inputFileContainer" style={style}>
            Choose File
            <input 
              type="file"
              className="file"
              onChange={onChange}
              onClick={onClick}
            />
          </div>
          <label>{formData.image}</label>
          <div style={{paddingTop: '10px'}}>
            <button type="button" onClick={createNote}>Create Note</button>
          </div>
          <div style={{marginBottom: 30}}>
            {
              notes.map(note => (
                <div key={note.id || note.name}>
                  <h2>{note.name}</h2>
                  <p>{note.description}</p>
                  <button onClick={() => deleteNote(note)}>Delete note</button>
                  {
                    note.image && <img src={note.image} style={{width: 400}} />
                  } 
                </div>
              ))
            }
          </div>
        </div>
        <AmplifySignOut/>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
