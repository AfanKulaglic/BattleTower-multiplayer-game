import React, { useState, useEffect, useRef } from 'react';
import supabase from '../utils/supabaseClient';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import map from '../assets/map.jpg';
import tower from '../assets/tower.png';
import fire from '../assets/explosion1.gif';
import hole from '../assets/hole.png';
import ruin_fire from '../assets/ruin-fire.gif';
import ruin from '../assets/ruin.gif';
import '../Styles/game.css'

// Enum za stanja polja na ploči
enum CellState {
  Hidden,
  Miss,
  Hit,
}

// Enum za stanja igre
enum GameState {
  Playing,
  GameOver,
}

// Definicija tipova
type Cell = {
  state: CellState;
  ship: boolean;
};

type Board = Cell[][];

const BOARD_SIZE = 5;
const NUM_SHIPS = 4;

const BattleshipGame: React.FC = () => {
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board>([]);
  const [enemyBoard, setEnemyBoard] = useState<Board>([]);
  const [shipsRemaining, setShipsRemaining] = useState<number>(NUM_SHIPS);
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const username = useSelector((state: any) => state.username);
  const enemy = useSelector((state: any) => state.enemy);
  const [userData, setUserData] = useState<any>(null);
  const [enemyData, setEnemyData] = useState<any>(null);
  const ruinRef = useRef<HTMLDivElement>(null);

  async function fetchRound() {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_player, game_over')
        .eq('name', username)
        .single();
      if (userError) {
        throw userError;
      }
      if (userData) {
        setUserData(userData)
      }
      if (userData.game_over === true) {
        navigate('/')
      }

      const { data: enemyData, error: enemyError } = await supabase
        .from('users')
        .select('first_player, target_ships, game_over')
        .eq('name', enemy)
        .single();
      if (enemyError) {
        throw enemyError;
      }
      if (userData) {
        setEnemyData(enemyData)
      }
      if (enemyData.game_over === true) {
        navigate('/')
      }

    } catch (error) {
      console.error('Error fetching setup arrays:', error);
    }
  }

  useEffect(() => {
    async function fetchSetupArrays() {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('setup_ships, first_player')
          .eq('name', username)
          .single();
        if (userError) {
          throw userError;
        }
        if (userData) {
          setUserData(userData)
          const userSetupArray: string[][] = userData.setup_ships;
          setBoard(initializeBoard(userSetupArray));
        }

        const { data: enemyData, error: enemyError } = await supabase
          .from('users')
          .select('setup_ships')
          .eq('name', enemy)
          .single();
        if (enemyError) {
          throw enemyError;
        }
        if (enemyData) {
          const enemySetupArray: string[][] = enemyData.setup_ships;
          setEnemyBoard(initializeBoard(enemySetupArray));
        }
      } catch (error) {
        console.error('Error fetching setup arrays:', error);
      }
    }

    fetchSetupArrays();

    setInterval(() => {
      fetchRound();
    }, 500)
  }, [username, enemy]);

  // Inicijalizacija ploče sa zadatim array-om za postavljanje brodova
  function initializeBoard(shipsArray: string[][]): Board {
    const board: Board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        const shipInfo = JSON.parse(shipsArray[i][j]);
        row.push({ state: CellState.Hidden, ship: shipInfo.ship });
      }
      board.push(row);
    }
    return board;
  }
  // Funkcija za potez igrača na neprijateljskoj ploči
  async function handleEnemyMove(x: number, y: number) {
    if (gameState === GameState.GameOver) return;

    // Dodaj dodatnu provjeru da li userData postoji i da li first_player ima ispravnu vrijednost
    if (userData && userData.first_player === true) {
      console.log('Može igrati.');

      const cell = enemyBoard[x][y];
      if (cell.state !== CellState.Hidden) return;

      const newBoard = [...enemyBoard];
      if (cell.ship) {
        newBoard[x][y].state = CellState.Hit;
        setShipsRemaining(prev => prev - 1);
        if (shipsRemaining === 1) {
          setGameState(GameState.GameOver);

          // Ažuriranje stanja u Supabase kada je gameState GameOver
          try {
            await supabase
              .from('users')
              .update({ game_over: true })
              .eq('name', username)
              .single();
            console.log('Game Over stanje ažurirano u Supabase.');
          } catch (error) {
            console.error('Greška prilikom ažuriranja stanja igre u Supabase:', error);
          }
        }
      } else {
        newBoard[x][y].state = CellState.Miss;
      }
      setEnemyBoard(newBoard);

      try {
        await supabase
          .from('users')
          .update({ first_player: false })
          .eq('name', username)
          .single();

        await supabase
          .from('users')
          .update({ first_player: true })
          .eq('name', enemy)
          .single();

        await supabase
          .from('users')
          .update({ target_ships: [x, y] })
          .eq('name', username)
          .single();

        fetchRound();
        console.log('Uspješno ažurirani podaci korisnika.');
      } catch (error) {
        console.error('Greška prilikom ažuriranja podataka korisnika:', error);
      }
    }
  }

  const [lastX, setLastX] = useState<number>(-2)
  const [lastY, setLastY] = useState<number>(-2)

  // Renderiranje ploče
  function renderBoard(board: Board, onClick: (x: number, y: number) => void) {
    return (
      <div className='map' style={{ backgroundImage: `url(${map})` }}>
        {board.map((row, x) => (
          <div key={x} style={{ display: 'flex' }}>
            {row.map((cell, y) => {
              let backgroundStyle = {
                backgroundImage: getCellColor(cell, x, y),
              };
              return (
                <div
                  className='cell'
                  key={y}
                  onClick={() => {
                    onClick(x, y)
                    setLastX(x)
                    setLastY(y)
                  }}
                  style={backgroundStyle}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  function getCellColor(cell: Cell, x: number, y: number) {
    if (cell.state && x === lastX && y === lastY && enemyData.first_player === true) {
      if (cell.state === CellState.Miss) {
        return `url(${fire})`
      }
      if (cell.state === CellState.Hit) {
        return `url(${ruin_fire})`
      }
    }
    else {
      // U suprotnom, koristimo standardnu logiku za postavljanje boje pozadine ćelije
      switch (cell.state) {
        case CellState.Hidden:
          return `url()`; // Možete vratiti prazan string ako nema slike za hidden stanje
        case CellState.Miss:
          return `url(${hole})`;
        case CellState.Hit:
          // Ako je trenutna ćelija pogodjena, a nije posljednja pogodjena ćelija, ažuriraj lastHitPosition
          return `url(${ruin})`;
        default:
          return `url()`;
      }
    }
  }





  function RenderHitBoard() {
    const [lastHits, setLastHits] = useState<{ x: number; y: number }[]>([]);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLDivElement;
              target.classList.add('visible');
              observer.unobserve(target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.1
        }
      );

      document.querySelectorAll('.cell').forEach((cell) => {
        observer.observe(cell);
      });

      return () => {
        observer.disconnect();
      };
    }, []);

    if (!enemyData || !enemyData.target_ships || enemyData.target_ships.length !== 2) {
      return null;
    }

    const [hitX, hitY] = enemyData.target_ships;

    const updatedBoard: Board = JSON.parse(JSON.stringify(board));

    if (hitX >= 0 && hitX < BOARD_SIZE && hitY >= 0 && hitY < BOARD_SIZE) {
      const cell = board[hitX][hitY];
      if (!cell || cell.state === CellState.Hidden) {
        const hitExists = lastHits.some(hit => hit.x === hitX && hit.y === hitY);
        if (!hitExists) {
          setLastHits([{ x: hitX, y: hitY }, ...lastHits]);
        }
        updatedBoard[hitX][hitY] = { state: cell.ship ? CellState.Hit : CellState.Miss, ship: cell.ship };
      }
    }

    if (hitX >= 0 && hitX < BOARD_SIZE && hitY >= 0 && hitY < BOARD_SIZE) {
      const cell = board[hitX][hitY];
      if (!cell || cell.state === CellState.Hidden) {
        updatedBoard[hitX][hitY] = { state: cell.ship ? CellState.Hit : CellState.Miss, ship: cell.ship };
      }
    }

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j].ship === true && updatedBoard[i][j].state !== CellState.Hit) {
          updatedBoard[i][j] = { state: CellState.Hidden, ship: true };
        }
      }
    }

    return (
      <div ref={mapRef} className='map' style={{ backgroundImage: `url(${map})` }}>
        {updatedBoard.map((row, rowIndex) => (
          <div className='' key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => {
              const isLastHit = lastHits.some(hit => hit.x === rowIndex && hit.y === colIndex);
              const isFirstHit = lastHits.length > 0 && lastHits[0].x === rowIndex && lastHits[0].y === colIndex;
              const key = `${rowIndex}-${colIndex}-${isLastHit ? 'hit' : 'nohit'}`;
              return (
                <div
                  key={key} // Dynamically generated key
                  ref={ruinRef}
                  className='cell'
                  style={{
                    backgroundImage: getCellBackground(cell, isLastHit, isFirstHit) // Set background image
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }


  // Dobivanje pozadinske slike ćelije na temelju njezinog stanja
  function getCellBackground(cell: Cell, isLastHit: boolean, isFirstHit: boolean) {
    if (isLastHit) {
      if (isFirstHit && CellState.Hit && cell.ship && enemyData.first_player === false) {
        return `url(${ruin_fire})`; // Prva slika tornja
      }
      else if (CellState.Hit && cell.ship) {
        return `url(${ruin})`;
      }
      else if (isFirstHit && CellState.Hit && enemyData.first_player === false) {
        return `url(${fire})`;
      }
      else if (CellState.Hit) {
        return `url(${hole})`;
      }
    }
    if (cell.ship) {
      return `url(${tower})`; // Četvrta slika tornja
    }
    return 'none'; // Ako nije ni jedan od prethodnih slučajeva, vraćamo transparentnu pozadinu
  }




  return (
    <div className='game-mp-content'>
      {renderBoard(enemyBoard, handleEnemyMove)}
      <div className='scorebar'>
        <h1 id='user'>
          {username}
        </h1>
        {enemyData &&
          enemyData.first_player === false ?
          <p className='text-success'>Yours turn</p> 
          :
          <p className='text-danger'>{enemy}'s turn</p> 
        }
        <h1 id='enemy'>
          {enemy}
        </h1>
      </div>
      {RenderHitBoard()}
      {gameState === GameState.GameOver && <h2>Game Over</h2>}
    </div>
  );
};

export default BattleshipGame;
