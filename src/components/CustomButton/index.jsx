import { Button } from 'react-bootstrap';

const CustomButton = (props) => {
  const { title = 'Click', onClick = null, layout="dark",  className = "", type = 'button', disabled = false, isSubmitting = false } = props;
  return (
    <Button 
      className={`btn btn-${layout} rounded-pill px-3 py-2 h-48 w-100 ${className}`} 
      onClick={onClick} 
      type={type} 
      disabled={disabled || isSubmitting}
      id='custom-button'
      >
      {isSubmitting ? 'Please Wait...' : title}
    </Button> 
  )
}

export default CustomButton