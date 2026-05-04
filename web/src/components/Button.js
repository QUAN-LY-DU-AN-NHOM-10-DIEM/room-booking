import React from 'react'

const Button = props => (
  <button disabled={props.disabled} className={`button ${props.className}`} onClick={props.onClick} >
    {props.text}
  </button>
)

export default Button
