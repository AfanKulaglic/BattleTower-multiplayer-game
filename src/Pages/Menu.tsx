import { useNavigate } from 'react-router-dom';
import '../Styles/menu.css'
import { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import logo from '../assets/logo.png'
import { useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import card1 from '../assets/card1.png'
import card2 from '../assets/card2.png'
import card3 from '../assets/card3.png'
import card4 from '../assets/card4.png'
import fbIcon from '../assets/fb.png'
import vbIcon from '../assets/vb.png'
import ytIcon from '../assets/yt.png'
import historyIcon from '../assets/history.png'
import loadingBg from '../assets/loading-background.jpg'
import menuBg from '../assets/background.jpg'
import scoreBar from '../assets/scorebar.jpg'
import btn from '../assets/btn.png'
import medievalBanner from '../assets/medieval-banner.png'
import btnDisable from '../assets/btnDisable.png'
import tower from '../assets/tower.png'
import ruin from '../assets/ruin.gif'
import ruinF from '../assets/ruin-fire.gif'
import hole from '../assets/hole.png'
import explosion from '../assets/explosion.gif'
import gameBg from '../assets/game-background.jpg'
import coin from '../assets/coin.png'
import supabase from '../utils/supabaseClient';

export const Menu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const username = useSelector((state: any) => state.username);
  const [enemyNameRequest,setEnemyNameRequest] = useState<string>('');

  const handleClick = () => {
    navigate('/lobby');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
          const { data, error } = await supabase
              .from('users')
              .select('lobby')
              .eq('name', username);
          if (error) {
              throw error;
          }
          if (data) {
            setEnemyNameRequest(data[0].lobby)
        }
      } catch (error) {
        console.error('Error fetching user data:');
      }
    };

    fetchUserData()

    const loadImage = () => {
      const images = [
        loadingBg,
        menuBg,
        scoreBar,
        logo,
        card1,
        card2,
        card3,
        card4,
        fbIcon,
        vbIcon,
        ytIcon,
        historyIcon,
        btn,
        medievalBanner,
        btnDisable,
        tower,
        ruin,
        ruinF,
        hole,
        explosion,
        gameBg,
        coin
      ];

      let loadedImages = 0;

      images.forEach(imageSrc => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
          loadedImages++;
          if (loadedImages === images.length) {
            setLoading(false);
          }
        };
      });
    };

    loadImage();

    return () => {
      // Cleanup code if necessary
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay" style={{ backgroundImage: `url(${loadingBg})` }} >
        <img src={logo} />
        <BarLoader id='loader' color="#36d7b7" height={4} width={200} />
      </div>
    )
  }

  return (
    <div className='menu-overlay' style={{ backgroundImage: `url(${menuBg})` }}>
      <div className='navbar' style={{ backgroundImage: `url(${scoreBar})` }}>
        <h3>{username}</h3>
        <p>100 <img src={coin} /></p>
      </div>
      <div className='main'>
        <div className='row mt-0'>
          <div className='col1 pt-4' style={{ backgroundImage: `url(${medievalBanner})` }}>
            <img src={fbIcon} className='navigation-icon' />
            <span>Facebook</span>
            <img src={vbIcon} className='navigation-icon' />
            <span>Viber</span>
          </div>
          <div className='col2 pt-4' style={{ backgroundImage: `url(${medievalBanner})` }}>
            <img src={ytIcon} className='navigation-icon' />
            <span>YouTube</span>
            <img src={historyIcon} className='navigation-icon' />
            <span>History</span>
          </div>
        </div>
        <img src={logo} id='logo' />
        <Row className='row'>
          <Col xs={6} className='col'>
            <img src={card1} className='menu-icon' />
            <button className='disable-btn' style={{ backgroundImage: `url(${btn})` }}>PLAY</button>
          </Col>
          <Col xs={6} className='col'>
            <img src={card2} className='menu-icon' />
            <button onClick={handleClick} style={{ backgroundImage: `url(${btn})` }}>MULTIPLAYER</button>
          </Col>
          <Col xs={6} className='col'>
            <img src={card3} className='menu-icon' />
            <button className='btn' style={{ backgroundImage: `url(${btnDisable})` }}>SETTINGS</button>
          </Col>
          <Col xs={6} className='col'>
            <img src={card4} className='menu-icon' />
            <button className='btn' style={{ backgroundImage: `url(${btnDisable})` }}>ABOUT</button>
          </Col>
        </Row>
      </div>
    </div>
  );
};
