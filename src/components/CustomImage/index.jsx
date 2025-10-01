import React from 'react'

const CustomImage = (props) => {
  const { src, alt, className="", otherProps } = props
  return (
    <img src={src} alt={alt} className={`custom-image ${className}`} {...otherProps} />
  )
}

export default CustomImage