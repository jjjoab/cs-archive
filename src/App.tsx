import React, { useState } from 'react';
import CorsicaNew from './corsicanew';
import IndexList from './IndexList';
import LoadingScreen from './LoadingScreen';
import LandingPage from './LandingPage';
import { AudioProvider } from './components/AudioProvider';
import { SearchProvider } from './contexts/SearchContext';
import SearchBar from './components/SearchBar';
import headerLogo from './assets/icons/corsica logo white small.png';

// Toggle between loading screens: 'images' or 'video'
const LOADING_SCREEN_TYPE: 'images' | 'video' = 'video';

const App: React.FC = () => {
  const [view, setView] = useState<'json' | 'filename' | 'list'>('filename');
  const [hasEnteredArchive, setHasEnteredArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHorizontalScroll, setIsHorizontalScroll] = useState(false);
  const [openFilenameInTimeline, setOpenFilenameInTimeline] = useState(false);
  const useVideoLoadingScreen = LOADING_SCREEN_TYPE === 'video' && window.innerWidth > 768;

  const ActiveLoadingScreen = useVideoLoadingScreen ? LoadingScreen : LoadingScreen;

  const handleEnterArchive = () => {
    setHasEnteredArchive(true);
    setIsLoading(true);
  };

  return (
    <>
    <SearchProvider>
    <AudioProvider>
      {!hasEnteredArchive ? (
        <LandingPage onEnterArchive={handleEnterArchive} />
      ) : (
        <>
      {isLoading && <ActiveLoadingScreen onComplete={() => setIsLoading(false)} />}
      <div className="archive-header">
        <div
          role="button"
          tabIndex={0}
          aria-label="Go to index art"
          onClick={() => { setView('filename'); setTimeout(() => setOpenFilenameInTimeline(false), 0); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView('filename'); setTimeout(() => setOpenFilenameInTimeline(false), 0); } }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
        >
          <img src={headerLogo} alt="Archive logo" style={{ height: '26px', width: 'auto', display: 'block' }} />
          <div className="archive-title">ARCHIVE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchBar />
        </div>
      </div>
      <div className="main-content" style={{ display: isLoading ? 'none' : 'block' }}>
        {/*
        <div className="view-toggle-container">
          <button 
            onClick={() => setView('json')}
            className={`source-toggle-btn ${view === 'json' ? 'active' : ''}`}
          >
            JSON Dates
          </button>
          <button 
            onClick={() => setView('filename')}
            className={`source-toggle-btn ${view === 'filename' ? 'active' : ''}`}
          >
            Filename Dates
          </button>
          <button 
            onClick={() => setView('list')}
            className={`source-toggle-btn ${view === 'list' ? 'active' : ''}`}
          >
            Index List
          </button>
        </div>
        */}
        {view === 'list' ? (
          <IndexList
            onShowIndexRegular={() => {
              setOpenFilenameInTimeline(false);
              setView('filename');
            }}
            onShowTimeline={() => {
              setOpenFilenameInTimeline(true);
              setView('filename');
            }}
          />
        ) : view === 'filename' ? (
          <CorsicaNew
            source="filename"
            onShowIndexList={() => setView('list')}
            onShowIndexRegular={() => {
              setOpenFilenameInTimeline(false);
              setView('filename');
            }}
            isHorizontalScroll={isHorizontalScroll}
            setIsHorizontalScroll={setIsHorizontalScroll}
            initialTimeline={openFilenameInTimeline}
          />
        ) : (
          <CorsicaNew
            source="json"
            onShowIndexList={() => setView('list')}
            onShowIndexRegular={() => setView('filename')}
            isHorizontalScroll={isHorizontalScroll}
            setIsHorizontalScroll={setIsHorizontalScroll}
          />
        )}
      </div>
      <div className="site-footer">Corsicastudios.com | @Corsicastudios</div>
        </>
      )}
    </AudioProvider>
    </SearchProvider>
    </>
  );
};

export default App;
