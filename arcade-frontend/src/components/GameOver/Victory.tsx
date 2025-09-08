import React from 'react'
import './gameOver.scss'
import victoryImage from '../../assets/images/misc/victory.png';
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../path/paths';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type Props = {}

const Victory = (props: Props) => {
    const navigate = useNavigate()
    const { user } = useAuth();
    React.useEffect(() => {
      (async () => {
        // Award points only if logged in
        if (user) {
          await api.recordWin('dice-shootout', 50);
        }
      })();
    }, [user]);
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