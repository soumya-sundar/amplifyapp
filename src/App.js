import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes, getNote } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '', image: 'No files chosen' };

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const style = {marginBottom: '10px'};

  useEffect(() => {
    fetchNotes();
  }, []);


  //Function to handle change in file input.
  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });

    //Check if file exists in S3 storage
    Storage.get(file.name, { download: true })
    .then(res => {
      console.log(res);
      // If response has body field with type as Blob which means file exists.
      //Display warning message and reset the form.
      res.blob().then(function(myBlob) {
        console.log(myBlob);
        alert("This image is already associated with another note. Please select another image.")
        setFormData(initialFormState);
      })
      .catch((err) =>{
        //File added to S3 Storage
        Storage.put(file.name, file)
        .then (result => console.log(result))
        .catch(err => console.log(err));
      })
    })
    .catch(err => {
      Storage.put(file.name, file)
      .then (result => console.log(result))
      .catch(err => console.log(err));
    })
    fetchNotes();
  }

  // Function to set event target value to null to prevent form reload
  async function onClick(e) {
    e.target.value = null;
  }

  //Function to display notes on the form.
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        //Check image in S3 Storage
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
    let data = {
      name: formData.name,
      description: formData.description,
      image: formData.image !== "No files chosen" ? formData.image : null
    }
    await API.graphql({ query: createNoteMutation, variables: { input: data } });
    if (data.image) {
      //Check image in S3 storage
      const image = await Storage.get(data.image);
      //Set form data image field
      formData.image = image;
    }
    setFormData(initialFormState);
    fetchNotes();
  }

  //Deletes a note by calling delete note mutation.
  async function deleteNote({ id }) {
    //GraphQL query to find image name using note id    
    API.graphql({ query: getNote, variables: { id: id }})
    .then(result => {
      const image = result.data.getNote.image;
      if(image !== null){
        //Delete image from S3 storage
        Storage.remove(image)
        .then()
        .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err))
    .finally(() => {
      API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
      fetchNotes();
    })
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
                    note.image && <img src={note.image} alt='source unavailable' style={{width: 400}} />
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
