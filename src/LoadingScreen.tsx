import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

interface LoadingPoster {
  src: string;
  x: number;
  y: number;
  rot: number;
}

interface LoadingScreenProps {
  onComplete: () => void;
}

const posterModules = import.meta.glob('/src/assets/corsica test posters/*.{webp,jpg,jpeg,png}', { eager: true }) as Record<string, { default: string }>;

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const allPosters = useMemo(() => Object.values(posterModules).map(mod => mod.default), []);
  const [shownPosters, setShownPosters] = useState<LoadingPoster[]>([]);
  const [fadeInOverlay, setFadeInOverlay] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (allPosters.length === 0) {
      onComplete();
      return;
    }

    const shuffled = [...allPosters].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(70, shuffled.length));

    let index = 0;
    const interval = setInterval(() => {
      const src = selected[index];
      const next: LoadingPoster = {
        src,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rot: (Math.random() - 0.5) * 20,
      };
      setShownPosters(prev => [...prev, next]);
      index += 1;

      if (index >= selected.length) {
        clearInterval(interval);
        setFadeInOverlay(true);
        setTimeout(() => setShowTitle(true), 1500);
        setTimeout(() => setShowTitle(false), 3600);
        setTimeout(onComplete, 4200);
      }
    }, 41);

    return () => clearInterval(interval);
  }, [allPosters, onComplete]);

  return (
    <div className="loading-overlay" onClick={onComplete}>
      <div className={`loading-blackout ${fadeInOverlay ? 'visible' : ''}`} />
      <div className={`loading-title ${showTitle ? 'visible' : ''}`}>
        <span className="loading-title-word">CORSICA</span>
        <span className="loading-title-word">STUDIOS</span>
        <span className="loading-title-word">ARCHIVE</span>
      </div>
      <div className="loading-poster-field">
        {shownPosters.map((poster, i) => (
          <img
            key={`${poster.src}-${i}`}
            src={poster.src}
            alt="loading poster"
            className="loading-poster"
            style={{
              left: `${poster.x}vw`,
              top: `${poster.y}vh`,
              transform: `translate(-50%, -50%) rotate(${poster.rot}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
