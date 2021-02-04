import React from 'react';
import './Alert.css';
import Button from './../Button/Button';

//Alert Box props - type 1-information, 2-warning, 3-error
class Alert extends React.Component {
  constructor(props){
    super();
    this.state = { close: false };
  }

  onClick = () => {
    this.setState({close: true});
    this.props.onClose();
  }

  render() {
    let output, colorStyle;
    const {type , message } =  this.props;
    let alertStyle = this.state.close ? { display: 'none' }: { display: 'block' };  
    const alertContentLength = (message.length + 10) * 8;
    const alertContentStyle = {width: alertContentLength+'px'}
    
    // Props type 1 is an information message
    if(type===1) {
      colorStyle = {color: 'rgb(0,0,128)', backgroundColor: 'rgb(173,216,230)', borderColor: 'black'};
      output = (
        <div className="alert" style={alertStyle}>
          <div className="alert-content" style={{...alertContentStyle, ...colorStyle}}>
            <p><b>Info! </b>{message}</p>
            <Button type={1} focus={true} onClick={this.onClick} style={colorStyle}>Close</Button>
          </div>
        </div>
      );
    }

    // Props type 2 is a warning message
    if(type===2) {
      colorStyle = {color: 'rgb(139,69,19)', backgroundColor: 'rgb(245,222,179)', borderColor: 'black'};
      output = (
        <div className="alert" style={alertStyle}>
          <div className="alert-content" style={{...alertContentStyle, ...colorStyle}}>
            <p><b>Warning! </b>{message}</p>
            <Button type={1} focus={true} onClick={this.onClick} style={colorStyle}>Close</Button>
          </div>
        </div>
      );
    }


    // Props type 3 is an error message
    if(type===3) {
      colorStyle = {color: 'rgb(139,0,0)', backgroundColor: 'rgb(255,228,225)', borderColor: 'black'};
      output = (
        <div className="alert" style={alertStyle}>
          <div className="alert-content" style={{...alertContentStyle, ...colorStyle}}>
            <p><b>Error! </b>{message}</p>
            <Button type={1} focus={true} onClick={this.onClick} style={colorStyle}>Close</Button>
          </div>
        </div>
      );
    }
    return output;
  }
}

export default Alert;