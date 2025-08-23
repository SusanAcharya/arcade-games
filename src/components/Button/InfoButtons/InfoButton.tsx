import React from 'react'
import './InfoButton.scss'

type Props = {
    variant: 'primary' | 'secondary' | 'tertiary' | 'general';
    children?: React.ReactNode;
    onClick?: () => void;
    width?: string;
    height?: string;
}

const InfoButton = ({variant, children, onClick, width = '137px', height = '40px'}: Props) => {
  return (
    <button style={{ width, height }} className={['info-btn', variant].join(' ')} onClick={onClick}> 
        {children}
    </button>
  )
}

export default InfoButton