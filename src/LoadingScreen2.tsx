import React, { useEffect, useState } from 'react';
import './App.css';

// The original import attempted to load the video from `src/assets/video/...`.
// The actual file lives in `public/videos/IMAG0029.MOV` and is served at `/videos/...`.
const videoSrc = '/videos/IMAG0029.MOV';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen2: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [fadeInOverlay, setFadeInOverlay] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [videoRevealed, setVideoRevealed] = useState(false);

  useEffect(() => {
    // Fade in from black after 500ms
    const revealTimeout = setTimeout(() => setVideoRevealed(true), 500);

    // Show title after 2 seconds of play time
    const titleTimeout = setTimeout(() => setShowTitle(true), 2000);
    
    // Fade to black together after longer display
    const fadeTimeout = setTimeout(() => {
      setFadeInOverlay(true);
      setShowTitle(false);
    }, 5000);
    
    // Complete loading
    const completeTimeout = setTimeout(onComplete, 5600);

    return () => {
      clearTimeout(revealTimeout);
      clearTimeout(titleTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="loading-overlay" onClick={onComplete}>
      <video
        className="loading-video"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
        onLoadedMetadata={(e) => {
          const videoElement = e.currentTarget;
          videoElement.playbackRate = 1.0;
          videoElement.currentTime = 4.5;
        }}
      />
      <div className={`loading-intro-black ${videoRevealed ? 'revealed' : ''}`} />
      <div className={`loading-blackout ${fadeInOverlay ? 'visible' : ''}`} />
      <div className={`loading-title ${showTitle ? 'visible' : ''}`}>
        <span className="loading-title-word">CORSICA</span>
        <span className="loading-title-word">STUDIOS</span>
        <span className="loading-title-word">ARCHIVE</span>
      </div>
    </div>
  );
};

export default LoadingScreen2;
