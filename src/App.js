import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes, getNote } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import Alert from './component/Alert/Alert';
import Button from './component/Button/Button';

const initialFormState = { 
  name: '',
  description: '',
  image: 'No files chosen',
  alert: {
    type: 0,
    message: null,
  }
};

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const style = {marginBottom: '10px'};

  //Responsive image css
  const imageStyle = {
    maxWidth: '100%',
    height: 'auto'
  }

  const deleteButtonStyle = {
    height: '40px',
    padding: '0 40px'
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  async function onClose () {
    setFormData({...formData, 'alert': {'type': 0}, 'image': 'No file chosen'});
  }

  //Function to handle change in file input.
  async function onChange(e) {
    e.preventDefault();
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    //Check if file exists in S3 storage
    Storage.get(file.name, { download: true })
    .then(res => {
      // If response has body field with type as Blob and size > 0 which means file exists.
      // Display warning message and reset the form.
      if(res.Body.size > 0) {
        setFormData({ ...formData,
          'alert': {
            'type': 2,
            'message': "This image is already associated with another note. Please select another image.",
          },
        });
      } else {
        //File added to S3 Storage
        Storage.put(file.name, file)
        .then ()
        .catch(err => console.log(err));
      }
    })
    .catch(err => {
      //If file doesn't exist in S3 storage then add it.
      if(err.response.status === 404) {
        Storage.put(file.name, file)
        .then ()
        .catch(err => console.log(err));       
      } else {
        console.log(err);
      }
    })
    /*setFormData({ ...formData,
       'alert': {
        'type': 2,
        'message': "This image is already associated with another note. Please select another image.",
      },
    });*/
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
  async function createNote(e) {
    e.preventDefault();
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
  async function deleteNote({id}, e) {
    e.preventDefault();
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
      <header>
        <h1>Notes</h1>
      </header>
      <form className="main">
        <div className="container">
          <input
            onChange={e => setFormData({ ...formData, 'name': e.target.value})}
            placeholder="Note name"
            value={formData.name}
            style={style}
            minLength={4}
            maxLength={50}
            size={50}
            spellCheck
            required
          />
          <input
            onChange={e => setFormData({ ...formData, 'description': e.target.value})}
            placeholder="Note description"
            value={formData.description}
            style={style}
            minLength={4}
            maxLength={50}
            size={50}
            spellCheck
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
          {formData.alert.type !== 0 &&
          <Alert 
            type={formData.alert.type}
            message={formData.alert.message}
            onClose={(isClosed, e) => onClose(isClosed, e)}
          />}
          <div style={{paddingTop: '10px'}}>
            <Button type={1} onClick={createNote}>Create Note</Button>
          </div>
          <div style={{marginBottom: 30}}>
            {
              notes.map(note => (
                <div key={note.id || note.name}>
                  <h2>{note.name}</h2>
                  <p>{note.description}</p>
                  <div>
                    {
                      note.image && <img src={note.image} alt='preview unavailable' style={imageStyle} />
                    }
                  </div>
                  <Button type={4} onClick={e=>deleteNote(note,e)} style={deleteButtonStyle}>Delete</Button>
                </div>
              ))
            }
          </div>
        </div>
        <AmplifySignOut />
      </form>
      <footer>
        <div className="copyright">
          <p>Copyright 2020 - Soumya Sundarrajan</p>
        </div>
        <div className="contactUs">
          <p>Contact Us - soumya.rajan86@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}

export default withAuthenticator(App);
