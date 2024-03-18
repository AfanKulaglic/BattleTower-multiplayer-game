import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { useDispatch, useSelector } from 'react-redux';
import { setEnemy } from '../app/actions';
import '../Styles/lobby.css'
import scoreBar from '../assets/scorebar.jpg'
import coin from '../assets/coin.png'

export const Lobby = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState<string>('');
    const [userData, setUserData] = useState<any[]>([]);
    const username = useSelector((state: any) => state.username);
    const dispatch = useDispatch()

    useEffect(() => {
        fetchUserData();
    }, [inputValue]);

    const fetchUserData = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('name')
                .eq('name', inputValue);
            if (error) {
                throw error;
            }
            if (data) {
                setUserData(data);
            }
        } catch (error) {
            console.error('Error fetching user data:');
        }

        dispatch(setEnemy(inputValue));
    };

    const handleClick = async () => {
        if (!inputValue) {
            console.error('Molimo unesite vrijednost');
            return;
        }

        try {
            const intervalId = setInterval(async () => {
                // Dodaj svoje korisničko ime redux v;;;;;;;;;;rijednosti u polje "lobby" za korisnika koji ima ime "inputValue"
                const { data: updateData, error: updateError } = await supabase
                    .from('users')
                    .update({ lobby: username })
                    .eq('name', inputValue);

                if (updateError) {
                    throw updateError;
                }

                // Provjeri postoji li korisnik s istim imenom kao "inputValue" u polju "lobby" u reduksu
                const { data: lobbyUsers, error: lobbyError } = await supabase
                    .from('users')
                    .select('name')
                    .eq('lobby', inputValue);

                if (lobbyError) {
                    throw lobbyError;
                }

                if (lobbyUsers[0].name === username) {
                    console.log(`Korisnik ${inputValue} se već nalazi u vašem lobbyu.` + updateData);
                    clearInterval(intervalId);
                    navigate('/setup')
                } else {
                    console.log(`Zahtjev je uspješno poslan korisniku ${inputValue}.`);
                }
            }, 3000);
        } catch (error) {
            console.error('Greška prilikom obrade zahtjeva:');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <div className='lobby-overlay'>
            <div className='navbar' style={{ backgroundImage: `url(${scoreBar})` }}>
                <h3>{username}</h3>
                <p>100 <img src={coin} /></p>
            </div>
            <div className='main'>
                <p>ENTER ENEMY USERNAME</p>
                <input value={inputValue} onChange={handleChange} />
                <ul>
                    {userData.map((user, index) => (
                        user.name !== username &&
                        <li key={index}>{user.name}</li>
                    ))}
                </ul>
                <button onClick={handleClick}>Send request</button>
            </div>
        </div>
    );
};

export default Lobby;
