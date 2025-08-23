import React from 'react'
import './gameOver.scss'
import victoryImage from '../../assets/images/misc/victory.png';
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../path/paths';

type Props = {}

const Victory = (props: Props) => {
    const navigate = useNavigate()
  return (
    <div  className='game-over-container'>
        <div className="game-over-content">
            <img src={victoryImage} alt="" />
            <div onClick={() => navigate(PATHS.LIBRARY)} className="play-again"></div>
            <div onClick={() => navigate(PATHS.LIBRARY)} className="main-menu"></div>
        </div>
    </div>
  )
}

export default Victory