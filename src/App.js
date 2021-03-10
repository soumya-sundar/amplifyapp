import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes, getNote } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import Alert from './component/Alert/Alert';
import Button from './component/Button/Button';
import Input from './component/Input/Input';

const initialFormState = {
  name:'',
  description: '',
  image: 'No files chosen',
  alert: {
    type: 0,
    message: null,
  },
  field: '',
  clearFileInput: true
};

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const style = {marginBottom: '10px'};
  const inputName = useRef(null);
  const inputDescription = useRef(null);
  const inputFile = useRef(null);

  //Responsive image css
  const imageStyle = {
    maxWidth: '100%',
    height: 'auto'
  }

  const deleteButtonStyle = {
    height: '40px',
    padding: '0 40px',
    border: 'none'
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  async function onClose () {
    setFormData({...formData, 'alert': {'type': 0, message: null}});
    if(formData.field === 'name') {
      inputName.current.focus();
    } else if(formData.field === 'description') {
      inputDescription.current.focus();
    } else if(formData.field === 'image') {
      inputFile.current.focus();
    }
  }

  //Function to handle onBlur event for input controls.
  async function onBlur(alert, id) {
    if(alert.type !== 0) {
      if(id === 'name') {
        setFormData({ ...formData,
          'alert': {
            type: alert.type,
            message: alert.message
          },
          'name': '',
          'field': id
        });
      } else if(id === 'description'){
        setFormData({ ...formData,
          'alert': {
            type: alert.type,
            message: alert.message
          },
          'description': '',
          'field': id
        });
      }
    }
  }

  //Function to handle change in file input.
  async function onChange(file) {
    const fileName = file.name;
    if (!file) return
    setFormData({ ...formData, image: fileName, clearFileInput: false });
    //Check if file exists in S3 storage
    Storage.get(fileName, { download: true })
    .then(res => {
      // If response has body field with type as Blob and size > 0 which means file exists.
      // Display warning message and reset the form.
      if(res.Body.size > 0) {
        setFormData({ ...formData,
          'alert': {
            'type': 2,
            'message': "This image is already associated with another note. Please select another image.",
          },
          'image': '',
          'field': "image"
        });
      } else {
        //File added to S3 Storage
        Storage.put(fileName, file)
        .then ()
        .catch(err => console.log(err));
      }
    })
    .catch(err => {
      //If file doesn't exist in S3 storage then add it.
      if(err.response.status === 404) {
        Storage.put(fileName, file)
        .then ()
        .catch(err => console.log(err));       
      } else {
        console.log(err);
      }
    })
    fetchNotes();
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
    if (!formData.name) {
      setFormData({ ...formData,
        'alert': {
          'type': 3,
          'message': "Please enter a note name. This is a required field.",
        },
      });
      return;
    };
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
      <form className="container">
        <main>
          <section>
            <Input
              id={"name"}
              type="text"
              inputref={inputName}
              onChange={e => setFormData({ ...formData, 'name': e.target.value })}
              placeholder="Note name"
              value={formData.name}
              style={style}
              minLength={4}
              maxLength={50}
              size={50}
              onBlur={onBlur}
              required
            />
            <Input
              id={"description"}
              type="text"
              inputref={inputDescription}
              onChange={e => setFormData({ ...formData, 'description': e.target.value })}
              placeholder="Note description"
              value={formData.description}
              style={style}
              minLength={4}
              maxLength={50}
              size={50}
              onBlur={onBlur}
            />
            <Input
              type="file"
              inputref={inputFile}
              onChange={onChange}
              clearFileInput={formData.clearFileInput}
            />
            {formData.alert.type !== 0 &&
            <Alert
              type={formData.alert.type}
              message={formData.alert.message}
              onClose={onClose}
            />}
            <div style={{paddingTop: '10px'}}>
              <Button focus={false} type={1} onClick={createNote} style={{border: 'none'}}>Create Note</Button>
            </div>
          </section>
          <aside>
            {
              notes.map(note => (
                <div key={note.id || note.name} style={{paddingBottom: '32px'}}>
                  <h2>{note.name}</h2>
                  <p>{note.description}</p>
                  <figure>
                    {
                      note.image && <img src={note.image} alt='preview unavailable' style={imageStyle} />
                    }
                  </figure>
                  <Button focus={false} type={4} onClick={e=>deleteNote(note,e)} style={deleteButtonStyle}>Delete</Button>
                </div>
              ))
            }
          </aside>
        </main>
        <AmplifySignOut />
      </form>
      <footer>
        <div className="copyright">
          <p>Copyright 2020 - Soumya Sundarrajan</p>
        </div>
        <div className="contactUs">
          <p>Contact Us - soumya.sundar@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}

export default withAuthenticator(App);
