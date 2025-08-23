import React from 'react'
import './gameLibrary.scss'
import { IMAGES } from '../../constant/images'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../path/paths'

type Props = {}

const allArcades = [
    {
        id: 1,
        title: 'Dice shootout',
        image: IMAGES.ALL_ARCADES.ARCADE_GAME_1,
        route: PATHS.DICE_SHOOTOUT,
        bg: "#416E80"
    },
    {
        id: 2,
        title: 'Degen Sweeper',
        image: IMAGES.ALL_ARCADES.ARCADE_GAME_1,
        route: PATHS.DEGEN_SWEEPER,
        bg: "#B83954"
    },
    {
        id: 3,
        title: 'Gang War 21',
        image: IMAGES.ALL_ARCADES.ARCADE_GAME_1,
        route: '/game-one',
        bg: "#B05A36"
    },
    {
        id: 4,
        title: 'Dice Risk',
        image: IMAGES.ALL_ARCADES.ARCADE_GAME_1,
        route: '/game-one',
        bg: "#E5B936"
    },
    {
        id: 5,
        title: 'Last Poker Hand',
        image: IMAGES.ALL_ARCADES.ARCADE_GAME_1,
        route: '/game-one',
        bg: "#DF829D"
    },
    {
        id: 6,
        title: 'High Roller',
        image: IMAGES.ALL_ARCADES.ARCADE_GAME_1,
        route: '/game-one',
        bg: "#0F648F"
    },
]

const GameLibrary = (props: Props) => {
    const navigate = useNavigate()
  return (
    <div className="game-library">
        <div className="game-library-header">
            <h3>Game Library</h3>
        </div>

        <div className="game-library-wrapper">
            {allArcades.map((arcade) => (
                <div onClick={() => navigate(arcade.route)} key={arcade.id} className="game-item" style={{ backgroundColor: arcade.bg }}>
                    <h4>{arcade.title}</h4>
                    <img src={arcade.image} alt={arcade.title} />
                </div>
            ))}
        </div>

    </div>
  )
}

export default GameLibrary