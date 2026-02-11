import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import emailjs from '@emailjs/browser';
import './App.css';

const PHASES = {
  CHASE: 'CHASE',
  PERSUASION: 'PERSUASION',
  SUCCESS: 'SUCCESS',
  READ_MORE: 'READ_MORE',
};

const NO_TEXTS = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again please?",
  "Can we talk about this?",
  "I promise I'll be sweet!",
  "Please give me a chance!",
  "Is that your final answer?",
  "You're breaking my heart ;(",
  "Just one yes?",
  "Okay, but hear me out...",
  "Pretty please?",
  "there's a reason why you should say yes......",
  "to know, please say 'yes' ",
  "I'm waiting.....",
  "Pretty please!!!"
];

function App() {
  const [phase, setPhase] = useState(PHASES.CHASE);
  const [hoverCount, setHoverCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNoMove = () => {
    if (phase === PHASES.CHASE) {
      // Calculate boundaries to keep button visible within the card/viewport
      // We want to avoid the button going too far off or overlapping the "Yes" button too much
      const padding = 20;

      // Use window bounds but keep it relative to the button's natural position
      // For mobile, we should be more restrictive with the range
      const isMobile = windowSize.width < 768;
      const xRange = isMobile ? (windowSize.width / 2) - 60 : (windowSize.width / 2) - 100;
      const yRange = isMobile ? (windowSize.height / 2) - 80 : (windowSize.height / 2) - 120;

      // Generate random positions
      let newX = (Math.random() * (xRange * 2)) - xRange;
      // Restrict newY to be strictly negative (upward) relative to initial position
      let newY = -(Math.random() * yRange);

      // Avoid overlapping too much with the "Yes" button (center-ish)
      if (Math.abs(newX) < 60 && Math.abs(newY) < 60) {
        newX += newX > 0 ? 80 : -80;
        newY -= 80; // Always move further up if too close
      }

      setNoPosition({ x: newX, y: newY });

      const newHoverCount = hoverCount + 1;
      setHoverCount(newHoverCount);

      if (newHoverCount >= 10) {
        setPhase(PHASES.PERSUASION);
        setNoPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleNoClick = () => {
    if (phase === PHASES.PERSUASION) {
      setClickCount(prev => prev + 1);
      setYesScale(prev => prev + 0.2);
    }
  };

  const handleYesClick = () => {
    setPhase(PHASES.SUCCESS);
    triggerConfetti();
    sendNotification();
  };

  const sendNotification = () => {
    // ⚠️ REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS ⚠️
    const serviceID = 'service_6bu2dl9';
    const templateID = 'template_lfbol48';
    const publicKey = 'SYFSJtL29geCuA3ma';

    const templateParams = {
      to_name: 'My Love',
      from_name: 'Valentine App',
      message: 'She said YES! 💖'
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
      }, (err) => {
        console.log('FAILED...', err);
      });
  };

  const handleReadMore = () => {
    setPhase(PHASES.READ_MORE);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const random = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const getNoText = () => {
    return NO_TEXTS[Math.min(clickCount, NO_TEXTS.length - 1)];
  };

  return (
    <div className="container">
      {phase === PHASES.SUCCESS ? (
        <Celebration onReadMore={handleReadMore} />
      ) : phase === PHASES.READ_MORE ? (
        <Letter />
      ) : (
        <Proposal
          phase={phase}
          yesScale={yesScale}
          noPosition={noPosition}
          noText={getNoText()}
          onYesClick={handleYesClick}
          onNoHover={handleNoMove}
          onNoClick={handleNoClick}
          onNoTouch={handleNoMove}
        />
      )}
    </div>
  );
}

const Proposal = ({ phase, yesScale, noPosition, noText, onYesClick, onNoHover, onNoClick, onNoTouch }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
    >
      <div className="gif-container">
        <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmM2Z3BzZ2h4b3l4eGl4eXl4eXl4eXl4eXl4eXl4eXl4eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/cLS1cfxvGOPVpf9g3y/giphy.gif" alt="Cute Bear Asking" />
      </div>
      <h1>Will you be my Valentine?</h1>

      {/* Clean Flex Layout */}
      <div className="button-group">

        <motion.button
          className="yes-btn"
          style={{
            scale: yesScale,
            zIndex: 10
          }}
          whileHover={{ scale: yesScale * 1.1 }}
          whileTap={{ scale: yesScale * 0.9 }}
          onClick={onYesClick}
        >
          Yes 💖
        </motion.button>

        <motion.button
          className="no-btn"
          // Use transform (x/y) to move relative to its natural position
          animate={phase === 'CHASE' ? { x: noPosition.x, y: noPosition.y } : { x: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onMouseEnter={onNoHover}
          onTouchStart={onNoTouch}
          onClick={onNoClick}
          style={{
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}
        >
          {noText}
        </motion.button>
      </div>
    </motion.div>
  );
};

const IMAGES = [
  `${import.meta.env.BASE_URL}us1.jpeg`,
  `${import.meta.env.BASE_URL}us2.jpeg`,
  `${import.meta.env.BASE_URL}us3.jpeg`,
  `${import.meta.env.BASE_URL}us4.jpeg`,
];

const Celebration = ({ onReadMore }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card celebration-card"
    >
      <div className="gif-container" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        height: '250px',
        overflow: 'hidden',
        borderRadius: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <AnimatePresence mode='wait'>
          <motion.img
            key={index}
            src={IMAGES[index]}
            alt={`Us ${index + 1}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </AnimatePresence>
      </div>
      <h1>Yay!!! 💖🎉</h1>
      <p className="celebration-text" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        I knew you'd say yes! <br />
        Can't wait to be your Valentine for my entire life! 🥰
        <strong>P.S.</strong> I love you a lot and we do look great together see for yourself.
      </p>

      <motion.button
        onClick={onReadMore}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: '#ff4d6d',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(255, 77, 109, 0.4)',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '20px auto 0',
        }}
        whileHover={{ scale: 1.05, backgroundColor: '#ff3355' }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Read More</span>
        <span>💌</span>
      </motion.button>

    </motion.div>
  );
};

const Letter = () => {
  const floatingItems = [
    '🧸', '🍫', '💖', '✨', '🌹', '🦋', '🥰', '💌', '💑', '💝'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="card letter-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      }}
    >
      {/* Floating Background Effects */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            x: Math.random() * 600 - 300,
            y: Math.random() * 600 - 300,
            scale: 0
          }}
          animate={{
            opacity: [0, 0.5, 0],
            x: Math.random() * 600 - 300,
            y: Math.random() * 600 - 300,
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            fontSize: `${Math.random() * 30 + 10}px`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {floatingItems[Math.floor(Math.random() * floatingItems.length)]}
        </motion.div>
      ))}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            color: '#ff4d6d',
            fontSize: '2.5rem',
            marginBottom: '2rem',
            textAlign: 'center',
            fontFamily: "'Brush Script MT', cursive"
          }}
        >
          My Dearest Valentine,
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '1.2rem',
            lineHeight: '1.9',
            color: '#4a4a4a',
            fontFamily: "Georgia, serif",
          }}
        >
          <p style={{ marginBottom: '1.5rem' }}>
            I knew you'd say yes! Can't wait to be your Valentine for my entire life! 🥰
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>My gorgeous!!!</strong>
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Also, I'm really glad that I met you. When we met after our issue, I felt like we had a very little time to talk. I wanted to stay with you much longer time, as I felt so good, lively and felt like I found a gem which I thought had lost.
          </p>
          <p style={{
            marginTop: '2.5rem',
            textAlign: 'center',
            color: '#d90429',
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: '1.4rem'
          }}>
            You are my everything. ❤️
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default App;