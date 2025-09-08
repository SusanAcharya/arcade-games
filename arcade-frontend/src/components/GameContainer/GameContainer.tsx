import React from 'react'
import './gameContainer.scss'
import { IMAGES } from '../../constant/images'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type Props = {
    title: string,
    bg: string,
    children: React.ReactNode,
    arcadeWidth?: string;
    headerRight?: React.ReactNode;
}

const GameContainer = ({ title, bg, children, arcadeWidth = '100%', headerRight }: Props) => {
    const navigate = useNavigate();
    const { user } = useAuth();
  return (
    <div className='main-game-container'>
        <div className="main-game-container-header">
            <div onClick={() => navigate(-1)} className="gv-logo">
                <img src={IMAGES.ICONS.GV_ICON} alt="GV" />
            </div>
            <h3 className='game-title'>{title}</h3>
            <div className="header-right">
                {headerRight}
                {user && (
                    <div className="header-username">{user.username}</div>
                )}
            </div>
        </div>
        <div style={{width: `${arcadeWidth}`, background: `url(${bg})`}} className="arcade-game-wrapper">
            {children}
        </div>
    </div>
  )
}

export default GameContainer