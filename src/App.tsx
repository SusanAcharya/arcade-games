import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PATHS } from "./path/paths";
import Home from './pages/Homepage/Home';
import GameLibrary from './pages/GameLibrary/GameLibrary';
import DiceShootout from './pages/DiceShootout/DiceShootout';
import DegenSweeper from './pages/DegenSweeper/DegenSweeper';
import GangWar21 from './pages/GangWar21/GangWar21';


function App() {

  return (
    <div className='arcade-container'>
      <BrowserRouter>
        <Routes>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.LIBRARY} element={<GameLibrary />} />
          <Route path={PATHS.DICE_SHOOTOUT} element={<DiceShootout />} />
          <Route path={PATHS.DEGEN_SWEEPER} element={<DegenSweeper />} />
          <Route path={PATHS.GANG_WAR_21} element={<GangWar21 />} />
        </Routes>

      </BrowserRouter>
    </div>
  )
}

export default App
