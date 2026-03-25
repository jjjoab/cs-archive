import React, { useMemo } from 'react';
import headerLogo from './assets/icons/corsica logo white small.png';

const bigPicModules = import.meta.glob('/src/assets/big pics/*.{webp,jpg,jpeg,png}', { eager: true }) as Record<string, { default: string }>;
const bigPicSources = Object.values(bigPicModules).map((mod) => mod.default);

interface LandingPageProps {
  onEnterArchive: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterArchive }) => {
  const overlaySrc = useMemo(() => {
    if (bigPicSources.length === 0) return null;
    return bigPicSources[Math.floor(Math.random() * bigPicSources.length)];
  }, []);

  return (
    <div className="landing-page landing-page--large">
      {overlaySrc && (
        <img
          src={overlaySrc}
          alt=""
          aria-hidden="true"
          className="landing-page__blend-overlay"
        />
      )}
      <div className="landing-page__topbar">
        <img src={headerLogo} alt="Corsica Studios" className="landing-page__logo" />
      </div>

      <div className="landing-page__menu" role="navigation" aria-label="Main site sections">
        <button
          type="button"
          className="landing-page__row landing-page__row--interactive"
          onClick={onEnterArchive}
          aria-label="Enter archive"
        >
          <span className="landing-page__label">ARCHIVE</span>
        </button>

        <div className="landing-page__row" aria-disabled="true">
          <span className="landing-page__label">GALLERY</span>
        </div>

        <a
          href="https://everpress.com/profile/corsica-studios"
          target="_blank"
          rel="noopener noreferrer"
          className="landing-page__row landing-page__row--interactive"
          aria-label="Visit Merch store (opens in new tab)"
        >
          <span className="landing-page__label">MERCH</span>
        </a>

        <div className="landing-page__row" aria-disabled="true">
          <span className="landing-page__label">RECORDINGS</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;