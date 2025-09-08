import React, { useState, useEffect } from 'react'
import './gameLibrary.scss'
import { IMAGES } from '../../constant/images'
import machine1 from '../../assets/images/library/machine1.png'
import machine2 from '../../assets/images/library/machine2.png'
import machine3 from '../../assets/images/library/machine3.png'
import hoverBadge from '../../assets/images/library/hover-machine.png'
// Remove the character sprite import - we'll create a CSS-based character
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../path/paths'

type Props = {}

const machines = [
  { id: 1, img: machine1, route: PATHS.DICE_SHOOTOUT },
  { id: 2, img: machine2, route: PATHS.DEGEN_SWEEPER },
  { id: 3, img: machine3, route: PATHS.GANG_WAR_21 },
]

const GameLibrary = (props: Props) => {
    const navigate = useNavigate()
    const [characterPosition, setCharacterPosition] = useState(1) // 1, 2, or 3
    const [hoveredMachine, setHoveredMachine] = useState<number | null>(null)
    const [isWalking, setIsWalking] = useState(false)
    const [walkDirection, setWalkDirection] = useState<'left' | 'right' | null>(null)
    const [gifKey, setGifKey] = useState(0) // Key to force gif restart
    const [currentDirection, setCurrentDirection] = useState<'left' | 'right'>('right') // Track current facing direction

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'a') {
                // Instantly flip to face left
                setCurrentDirection('left')
                setCharacterPosition(prev => {
                    const newPos = Math.max(1, prev - 1)
                    if (newPos !== prev) {
                        setIsWalking(true)
                        setWalkDirection('left')
                        setGifKey(prev => prev + 1) // Force gif restart
                        setTimeout(() => {
                            setIsWalking(false)
                            setWalkDirection(null)
                        }, 1500) // 1.5 seconds to match gif duration
                    }
                    return newPos
                })
            } else if (event.key.toLowerCase() === 'd') {
                // Instantly flip to face right
                setCurrentDirection('right')
                setCharacterPosition(prev => {
                    const newPos = Math.min(3, prev + 1)
                    if (newPos !== prev) {
                        setIsWalking(true)
                        setWalkDirection('right')
                        setGifKey(prev => prev + 1) // Force gif restart
                        setTimeout(() => {
                            setIsWalking(false)
                            setWalkDirection(null)
                        }, 1500) // 1.5 seconds to match gif duration
                    }
                    return newPos
                })
            } else if (event.key === 'Enter') {
                // Enter key to play the game where character is positioned
                const currentMachine = machines[characterPosition - 1]
                if (currentMachine) {
                    navigate(currentMachine.route)
                }
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [characterPosition, navigate])

    // Update hovered machine based on character position
    useEffect(() => {
        setHoveredMachine(characterPosition)
    }, [characterPosition])

    const handleMachineClick = (machineId: number) => {
        if (characterPosition === machineId) {
            navigate(machines[machineId - 1].route)
        }
    }

  return (
    <div className="game-library">
        <div className="game-library-header">
            <h3>Game Library</h3>
        </div>
        <div className="controls-hint">
            <p>Use A/D keys to move, Enter or click to play!</p>
        </div>

        <div className="game-library-wrapper">
          {machines.map(m => (
            <div 
              className={`machine ${hoveredMachine === m.id ? 'character-hovered' : ''}`} 
              key={m.id} 
              onClick={() => handleMachineClick(m.id)}
            >
              <img className="hover-badge" src={hoverBadge} alt="hover badge" />
              <div className="glow" />
              <img className="cab" src={m.img} alt={`machine ${m.id}`} />
            </div>
          ))}
          
          {/* Walker Character */}
          <div 
            className={`walker-character ${isWalking ? 'walking' : ''} ${currentDirection === 'left' ? 'facing-left' : 'facing-right'}`}
            style={{ 
              left: `${(characterPosition - 1) * 33.33 + 16.67}%` 
            }}
          >
            {isWalking ? (
              <img 
                key={gifKey}
                src={IMAGES.WALKER_GIF} 
                alt="Walker character walking" 
                className="walker-gif"
              />
            ) : (
              <img 
                src={IMAGES.WALKER_STILL} 
                alt="Walker character still" 
                className="walker-still"
              />
            )}
          </div>
        </div>

    </div>
  )
}

export default GameLibrary