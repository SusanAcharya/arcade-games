import React from 'react'
import './home.scss'
import { PATHS } from '../../path/paths'
import { useNavigate } from 'react-router-dom'

type Props = {}

const Home = (props: Props) => {
    const navigate = useNavigate();
  return (
    <div className="home-container">
        <div className="home-container-content">
            <button onClick={() => navigate(PATHS.LIBRARY)} className='play-now-btn'>play now</button>
        </div>
    </div>
  )
}

export default Home