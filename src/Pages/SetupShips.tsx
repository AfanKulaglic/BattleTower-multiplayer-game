import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { useSelector } from 'react-redux';
import '../Styles/setup.css'
import map from '../assets/map.jpg'
import tower from '../assets/tower.png'

enum CellState {
  Hidden,
  Miss,
  Hit,
}

type Cell = {
  state: CellState;
  ship: boolean;
};

type Board = Cell[][];

const BOARD_SIZE = 5;
const MAX_SHIPS = 4;

const SetupShips: React.FC = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [shipsPlaced, setShipsPlaced] = useState<number>(0);
  const username = useSelector((state: any) => state.username);
  const enemy = useSelector((state: any) => state.enemy);
  const [enemyReady, setEnemyReady] = useState<boolean>(false);
  const [userReady, setuserReady] = useState<boolean>(false);

  let intervalId: NodeJS.Timeout; // Define intervalId here

  function initializeBoard(): Board {
    const board: Board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        row.push({ state: CellState.Hidden, ship: false });
      }
      board.push(row);
    }
    return board;
  }

  function placeShip(x: number, y: number) {
    if (shipsPlaced >= MAX_SHIPS || board[x][y].ship) return;

    const newBoard = [...board];
    newBoard[x][y].ship = true;
    setBoard(newBoard);
    setShipsPlaced(prev => prev + 1);
  }

  useEffect(() => {
    intervalId = setInterval(() => { // Assign to intervalId directly
      fetchUserData();
    }, 1000);

    if (enemyReady && userReady) {
      navigate('/game');
    }

    return () => clearInterval(intervalId);
  }, [enemyReady, userReady]);

  const fetchUserData = async () => {
    try {
      const { data: enemyData, error } = await supabase
        .from('users')
        .select('setup_ships')
        .eq('name', enemy);
      if (error) {
        throw error;
      }
      console.log(enemyData)
      if (enemyData[0].setup_ships !== null) {
        console.log(enemyData[0].setup_ships, 'podaci o korisniku');
        setEnemyReady(true)
        clearInterval(intervalId); // Clear interval here
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  async function startGame(): Promise<void> {
    if (shipsPlaced !== MAX_SHIPS) {
      alert('Please place exactly 4 ships before starting the game.');
      return;
    }
    try {
      await supabase
        .from('users')
        .update({ setup_ships: board, first_player: true })
        .eq('name', username);

      // Postavite prvo igrača na true za neprijatelja
      await supabase
        .from('users')
        .update({ first_player: false })
        .eq('name', enemy);

      setuserReady(true);

    } catch (error) {
      console.error('Error starting the game:', error);
    }
  }

  function renderBoard() {
    return (
      <div className='map' style={{ backgroundImage: `url(${map})` }}>
        {board.map((row, x) => (
          <div key={x} style={{ display: 'flex' }}>
            {row.map((cell, y) => (
              <div
                key={y}
                onClick={() => placeShip(x, y)}
                className='cell'
                style={{
                  backgroundImage: cell.ship ? `url(${tower})` : `url(})`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='setup-overlay'>
      <h3>PLACE THE TOWER IN A CERTAIN POSITION</h3>
      {renderBoard()}
      <div className='d-flex'>
        {shipsPlaced === MAX_SHIPS ?
          <button onClick={startGame}>
            {userReady ?
              `You are ready`
              :
              `Start game`
            }
          </button>
          :
          <button className='disable-btn'>Start Game</button>
        }
      </div>
      {enemyReady ?
        <p className='text-success'>{enemy} is ready and waiting for your</p>
        :
        <p className='text-danger'>{enemy} hasn't placed his towers</p>
      }
    </div>
  );
};

export default SetupShips;
