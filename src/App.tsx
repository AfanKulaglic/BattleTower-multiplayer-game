import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import BattleshipGame from './Pages/BattleshipGame'
import SetupShips from './Pages/SetupShips'
import Start from './Pages/Start'
import { Menu } from './Pages/Menu'
import Lobby from './Pages/Lobby'
import { Provider } from 'react-redux';
import store from './app/store';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className='p-0 m-0'>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/setup" element={<SetupShips />} />
            <Route path="/game" element={<BattleshipGame />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  )
}

export default App
