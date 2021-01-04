import React from 'react';
import './Alert.css';

//Alert Box props - type 1-information, 2-warning, 3-error
class Alert extends React.Component {
  constructor(props){
    super();
    this.state = { close: false };
  }

  onClick = (e) => {
    e.preventDefault();
    this.setState({close: true});
    this.props.onClose();
  }

  render() {
    let output, colorStyle;
    const {type , message } =  this.props;
    let displayStyle = this.state.close ? { display: 'none' }: { display: 'block' };  

    // Props type 1 is an information message
    if(type===1) {
      colorStyle = {color: 'rgb(0,0,128)', backgroundColor: 'rgb(173,216,230)'};
      output = (
        <div className="alert" style={displayStyle}>
          <div className="alert-content" style={colorStyle}>
            <p><b>Info! </b>{message}</p>
            <button className="close" onClick={this.onClick} style={colorStyle}>Close</button>
          </div>
        </div>
      );
    }

    // Props type 2 is a warning message
    if(type===2) {
      colorStyle = {color: 'rgb(139,69,19)', backgroundColor: 'rgb(245,222,179)'};
      output = (
        <div className="alert" style={displayStyle}>
          <div className="alert-content" style={colorStyle}>
            <p><b>Warning! </b>{message}</p>
            <button className="close" onClick={this.onClick} style={colorStyle}>Close</button>
          </div>
        </div>
      );
    }

    // Props type 3 is a error message
    if(type===3) {
      colorStyle = {color: 'rgb(139,0,0)', backgroundColor: 'rgb(255,228,225)'};
      output = (
        <div className="alert" style={displayStyle}>
          <div className="alert-content" style={colorStyle}>
            <p><b>Error! </b>{message}</p>
            <button className="close" onClick={this.onClick} style={colorStyle}>Close</button>
          </div>
        </div>
      );
    }
    return output;
  }
}

export default Alert;