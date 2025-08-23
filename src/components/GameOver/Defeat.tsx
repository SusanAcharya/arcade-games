import React from 'react'
import './gameOver.scss'
import defeatImage from '../../assets/images/misc/defeat.png';
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../path/paths';

type Props = {}

const Defeat = (props: Props) => {
    const navigate = useNavigate()
  return (
    <div  className='game-over-container'>
        <div className="game-over-content">
            <img src={defeatImage} alt="" />
            <div onClick={() => navigate(PATHS.LIBRARY)} className="play-again"></div>
            <div onClick={() => navigate(PATHS.LIBRARY)} className="main-menu"></div>
        </div>
    </div>
  )
}

export default Defeat