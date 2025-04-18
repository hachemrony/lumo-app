import './AnimatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="waves-container">
      {/* Back wave */}
      <svg className="wave wave-back" viewBox="0 0 1440 320">
        <path
          fill="#ff6ec4"
          fillOpacity="0.9"
          d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,208C840,224,960,192,1080,165.3C1200,139,1320,117,1380,106.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        ></path>
      </svg>

      {/* Mid wave */}
      <svg className="wave wave-mid" viewBox="0 0 1440 320">
        <path
          fill="#7367f0"
          fillOpacity="1"
          d="M0,224L80,213.3C160,203,320,181,480,176C640,171,800,181,960,192C1120,203,1280,213,1360,213.3L1440,213.3L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        ></path>
      </svg>

      {/* Front wave */}
      <svg className="wave wave-front" viewBox="0 0 1440 320">
        <path
          fill="#32ff7e"
          fillOpacity="1"
          d="M0,288L80,272C160,256,320,240,480,208C640,176,800,128,960,112C1120,96,1280,128,1360,144L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        ></path>
      </svg>
    </div>
  );
};

export default AnimatedBackground;
