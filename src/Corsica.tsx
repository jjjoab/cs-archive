import React, { useEffect, useState } from 'react';
import datesData from './assets/corsica test posters/dates.json';

// Vite glob import for corsica test posters
const corsicaFiles = import.meta.glob('/src/assets/corsica test posters/*.{webp,jpg,jpeg,png}', { eager: true });

interface ImageData {
  src: string;
  fileName: string;
  date: string;
  event: string;
  timestamp: number;
}

const Corsica: React.FC = () => {
  const [corsicaData, setCorsicaData] = useState<ImageData[]>([]);
  const [isTimeline, setIsTimeline] = useState(false);
  const [zoom, setZoom] = useState(0.5);
  const [timelineStats, setTimelineStats] = useState({ min: 0, max: 0, range: 0 });
  const [zoomLimits, setZoomLimits] = useState({ min: 0.2, max: 3 });

  useEffect(() => {
    const data = Object.entries(corsicaFiles)
      .map(([path, mod]: any) => {
        const fileName = path.split('/').pop()!;
        const fileData = datesData[fileName as keyof typeof datesData];
        const dateStr = typeof fileData === 'string' ? fileData : fileData?.date || '2020-01-01';
        const eventName = typeof fileData === 'string' ? `event${Math.random()}` : fileData?.event || 'unknown';
        const timestamp = new Date(dateStr).getTime();
        return {
          src: mod.default,
          fileName,
          date: dateStr,
          event: eventName,
          timestamp,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
    
    setCorsicaData(data);
    
    if (data.length > 0) {
      const min = data[0].timestamp;
      const max = data[data.length - 1].timestamp;
      const range = max - min;
      
      setTimelineStats({ min, max, range });
      
      // Calculate minimum zoom to fit entire timeline on one screen
      const screenHeight = window.innerHeight - 150;
      const daysDiff = range / (1000 * 60 * 60 * 24);
      
      // Estimate total height: time spacing + image heights (~300px each)
      const timelineSpacing = daysDiff * 2.2; // 2.2px per day
      const estimatedTotalHeight = timelineSpacing + (data.length * 300);
      
      // Calculate minimum zoom needed to fit everything
      const calculatedMinZoom = screenHeight / estimatedTotalHeight;
      
      setZoomLimits({ min: calculatedMinZoom, max: 1 });
      setZoom(calculatedMinZoom);
    }
  }, []);

  const getTimelinePosition = (timestamp: number) => {
    if (timelineStats.range === 0) return 0;
    const daysDiff = (timestamp - timelineStats.min) / (1000 * 60 * 60 * 24);
    return daysDiff * 2.2; // 2.2px per day for proper time scaling
  };

  return (
    <div className="corsica-grid-container">
      <div className="corsica-grid-controls">
        <button
          onClick={() => setIsTimeline(prev => !prev)}
          className={`toggle-btn ${isTimeline ? 'active' : ''}`}
        >
          {isTimeline ? 'Timeline View' : 'Grid View'}
        </button>
      </div>

      {isTimeline && (
        <div className="zoom-slider-container">
          <label htmlFor="timeline-zoom">Zoom:</label>
          <input
            id="timeline-zoom"
            type="range"
            min={zoomLimits.min}
            max={zoomLimits.max}
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="zoom-slider"
          />
          <span className="zoom-value">{Math.round((zoom / zoomLimits.min) * 100)}%</span>
        </div>
      )}

      {isTimeline ? (
        <div className="timeline" style={{ transform: `scale(${zoom})` }}>
          {/* Year markers */}
          {Array.from({ length: 25 }, (_, i) => 2002 + i).map((year) => {
            const yearDate = new Date(`${year}-01-01`).getTime();
            if (yearDate < timelineStats.min || yearDate > timelineStats.max) return null;
            const topPosition = getTimelinePosition(yearDate);
            return (
              <div
                key={`year-${year}`}
                className="timeline-year-marker"
                style={{ top: `${topPosition}px` }}
              >
                <span>{year}</span>
              </div>
            );
          })}
          
          {corsicaData.map((item, index) => {
            const topPosition = getTimelinePosition(item.timestamp);
            // Generate pseudo-random horizontal offset based on index to reduce overlap
            const seed = index * 73856093 ^ item.timestamp;
            const randomOffset = ((seed ^ (seed >> 15)) * 2654435761) % 900 - 450; // -450 to 450px
            return (
              <div 
                key={index} 
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                style={{ marginTop: `${topPosition}px`, '--item-offset': `translateX(${randomOffset}px)` } as any}
              >
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-date">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="timeline-image">
                    <img src={item.src} alt={item.fileName} />
                    <div className="timeline-event-name">{item.event}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="svg-scroll-grid">
          {corsicaData.map((item, index) => (
            <div key={index} className="svg-box">
              <img src={item.src} alt={item.fileName} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Corsica;
