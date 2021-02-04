import React from 'react';
import Button from './../Button/Button';
import './Input.css';

class Input extends React.Component {
  constructor(props){
    super(props);
    this.hiddenFileInput = React.createRef();
    this.state= {file: null};
  }

  onChange = (e) => {
    if(this.props.type === 'file'){
      this.setState({file: e.target.files[0]});
      this.props.onChange(e.target.files[0]);
    } else {
      this.props.onChange(e);
    }
  }

  onClick = (e) => {
    e.target.value = null;
    this.hiddenFileInput.current.click();
  }

  onBlur = (e) => {
    const { minLength, maxLength, required, onBlur, id } = this.props;
    const value =  e.target.value;
    let alert ={ type: 0, message: null};
    if(required && value.length === 0) {
      alert= { type: 3, message: "This is a required field"};
    } else if(value.length > 0 && value.length < minLength) {
      alert= { type: 2, message: "Input must be atleast 4 characters long."};
    } else if(value.length > maxLength ) {
      alert= { type: 2, message: "Input must be greater than 4 and less than 50 characters."};
    }  
    onBlur(alert, id);
  }

  render = () => {
    let output;
    const {type, placeholder, value, style, inputref, clearFileInput} = this.props;
    const autoFocus = this.props.autoFocus ? this.props.autoFocus : false;
    if(type === "text") {
      output = (<input
        type={type}
        ref={inputref}
        onChange={this.onChange}
        placeholder={placeholder}
        value={value}
        style={style}
        onBlur={this.onBlur}
        autoFocus={autoFocus}
      />);
    } else if(type === "file") {
      output = (
        <div>
          <Button onClick={this.onClick}>
            Upload a file
          </Button>
          <input
            type="file"
            ref={this.hiddenFileInput}
            onChange={this.onChange}
            style={{display: 'none'}}
          />
          <label>{!clearFileInput && this.state.file !== null ? this.state.file.name : "No files chosen"}</label>
        </div>
      );
    }

    return output;
  }

}

export default Input;