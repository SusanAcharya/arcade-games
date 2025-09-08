import React from 'react'
import './actionButton.scss'

type Props = {
    children: React.ReactNode;
    handleClick: () => void;
    disabled?: boolean;
    className?: string;
}

const ActionButton = ({ disabled, handleClick, children, className }: Props) => {
  return (
    <div onClick={handleClick} role='button' tabIndex={0} className={`action-button ${className ?? ''}`.trim()}> 
        {children} 
    </div>
  )
}

export default ActionButton