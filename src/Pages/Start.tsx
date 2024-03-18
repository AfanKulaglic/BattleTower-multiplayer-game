import React, { useState } from 'react';
import supabase from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUsername } from '../app/actions';
import logo from '../assets/logo.png'
import '../Styles/start.css'

const Start = () => {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>();
    const navigate = useNavigate();


    // Funkcija koja se poziva prilikom klika na gumb za slanje
    const handleSubmit = async () => {
        if (inputValue.length < 3) {
            setErrorMessage("Entry must be at least 3 characters long");
            return;
        }

        try {
            // Pošaljite string u Supabase koristeći insert metodu
            const { error } = await supabase
                .from('users')
                .insert({ name: inputValue });

            if (error) {
                console.error('Greška prilikom dodavanja stringa u Supabase:', error.message);
                setErrorMessage("Username entered is already in use");
                return;
            }
            console.log('String uspješno dodan u Supabase:');

            // Očistite input polje nakon uspješnog slanja
            setInputValue('');
            dispatch(setUsername(inputValue));
            navigate('/main');
        } catch (error) {
            console.error('Greška prilikom slanja u Supabase:', error);
            setErrorMessage("Username entered is already in use");
        }
    };

    // Resetovanje poruke o grešci kada se promeni sadržaj input polja
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setErrorMessage('');
    };

    // Prikaži loading indikator dok se podaci učitavaju

    return (
        <div className='sign-up-overlay'>
            <div className='main'>
                <img src={logo} />
                <input
                    placeholder='username'
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                />
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};

export default Start;