import './Button.css';
//Button class properties
// type: 1 - primaryAction
//       2 - primaryNavigation
//       3 - primaryLight
//       4 - primaryDelete
//       5 - secondaryAction
//       6 - secondaryNavigation
//       7 - secondaryLight
//       8 - tertiaryNavigation
//       9 - tertiaryLight
// className: customize button style
// onClick: onClick event handler
// children: string (button name)
var classNames = require('classnames');

function Button(props) {
  const {type, style, onClick, children } = props;
  let output;
  let buttonClasses;

  switch(type) {
    default:
    case 1: {
      buttonClasses= classNames('primary', 'primaryAction');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;
    }
    case 2: {
      buttonClasses= classNames( 'primary', 'primaryNavigation');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;
    }
    case 3: {
      buttonClasses= classNames( 'primary', 'primaryLight');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
    case 4: {
      buttonClasses= classNames('primary', 'primaryDelete');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
    case 5: {
      buttonClasses= classNames( 'secondary', 'secondaryAction');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
    case 6: {
      buttonClasses= classNames( 'secondary', 'secondaryNavigation');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
    case 7: {
      buttonClasses= classNames( 'secondary', 'secondaryLight');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
    case 8: {
      buttonClasses= classNames( 'tertiary', 'tertiaryNavigation');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
    case 9: {
      buttonClasses= classNames( 'tertiary', 'tertiaryLight');
      output=(<button type="button" style={style} className={buttonClasses} onClick={onClick}>{children}</button>);
      break;    
    }
  }
  return output;
}

export default Button;