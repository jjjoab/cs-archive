import React, { useEffect, useRef, useState } from 'react';
import icon1 from './assets/icons/timelineicon1.png';
import icon2 from './assets/icons/timelineicon2.png';
import indexTextIcon from './assets/icons/index-text.png';
import indexArtIcon from './assets/icons/index-art.png';
import indexTimelineIcon from './assets/icons/index-timeline.png';
import controlsMenuIcon from './assets/icons/galleryswitch.png';
import datesData from './assets/corsica test posters/dates.json';
import AudioPlayer from './components/AudioPlayer';
import { useSearch } from './contexts/SearchContext';
import searchIndex from './utils/search';

// Vite glob import for corsica test posters
const corsicaFiles = import.meta.glob('/src/assets/corsica test posters/*.{webp,jpg,jpeg,png}', { eager: true });

const stripImageExtension = (fileName: string) => fileName.replace(/\.(webp|jpg|jpeg|png)$/i, '');

const datesDataByStem = Object.entries(datesData).reduce((acc, [fileName, value]) => {
  acc[stripImageExtension(fileName)] = value;
  return acc;
}, {} as Record<string, (typeof datesData)[keyof typeof datesData]>);

interface ImageData {
  src: string;
  fileName: string;
  date: string;
  event: string;
  timestamp: number;
}

interface CorsicaProps {
  onShowIndexList?: () => void;
  onShowIndexRegular?: () => void;
  isHorizontalScroll?: boolean;
  setIsHorizontalScroll?: (value: boolean) => void;
  onVisibleCountChange?: (count: number) => void;
}

const Corsica: React.FC<CorsicaProps> = ({ onShowIndexList, onShowIndexRegular, isHorizontalScroll: propIsHorizontalScroll, setIsHorizontalScroll, onVisibleCountChange }) => {
  const zoomLevels = [2.5, 5, 7.5, 10, 12.5, 15]; // 250%, 500%, 750%, 1000%, 1250%, 1500%
  const [corsicaData, setCorsicaData] = useState<ImageData[]>([]);
  const [isTimeline, setIsTimeline] = useState(false);
  const [desiredTimelineTimestamp, setDesiredTimelineTimestamp] = useState<number | null>(null);
  const [zoomIndex, setZoomIndex] = useState(2); // Default zoom to 750%
  const [gridColumns, setGridColumns] = useState(() => (typeof window !== 'undefined' && window.innerWidth <= 768 ? 3 : 6));
  const [rowSize, setRowSize] = useState(200); // Default row height for horizontal scroll
  const [timelineStats, setTimelineStats] = useState({ min: 0, max: 0, range: 0 });
  const [baseZoom, setBaseZoom] = useState(0.01);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [iconToggle, setIconToggle] = useState(false);
  const [showRightIcons, setShowRightIcons] = useState(false);
  const [localIsHorizontalScroll] = useState(false);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeCenterByYear, setActiveCenterByYear] = useState<Record<string, number>>({});
  
  // Use prop if provided, otherwise use local state
  const isHorizontalScroll = propIsHorizontalScroll !== undefined ? propIsHorizontalScroll : localIsHorizontalScroll;
  
  const { debouncedQuery, setQueryImmediate } = useSearch();

  const changeTimelineZoom = (delta: number) => {
    const lockedScrollY = window.scrollY;
    setZoomIndex((prev) => {
      const next = prev + delta;
      return Math.max(0, Math.min(zoomLevels.length - 1, next));
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: lockedScrollY, left: window.scrollX, behavior: 'auto' });
      });
    });
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isTimeline) return;
    if (!event.ctrlKey) return; // only zoom on pinch gesture
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    changeTimelineZoom(direction);
  };

  useEffect(() => {
    // track desktop vs mobile for click behavior (side preview on desktop)
    const updateIsDesktop = () => setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 769);
    updateIsDesktop();
    window.addEventListener('resize', updateIsDesktop);
    return () => window.removeEventListener('resize', updateIsDesktop);
  }, []);

  useEffect(() => {
    const data = Object.entries(corsicaFiles)
      .map(([path, mod]: any) => {
        const fileName = path.split('/').pop()!;
        const fileData = datesDataByStem[stripImageExtension(fileName)];
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
      
      // Set a fixed reasonable base zoom for the timeline
      setBaseZoom(0.027);
    }
  }, []);

  const getTimelinePosition = (timestamp: number) => {
    if (timelineStats.range === 0) return 0;
    const daysDiff = (timestamp - timelineStats.min) / (1000 * 60 * 60 * 24);
    return daysDiff * 20; // 20px per day (20% of 100px)
  };

  const getIndexYearLabel = (item: ImageData) => {
    const year = new Date(item.date).getFullYear();
    return Number.isNaN(year) ? 'Unknown' : String(year);
  };

  const visibleData = debouncedQuery ? searchIndex(corsicaData, debouncedQuery, ['event', 'details', 'fileName', 'date']) : corsicaData;

  useEffect(() => {
    onVisibleCountChange?.(visibleData.length);
  }, [visibleData.length, onVisibleCountChange]);

  const indexGroups = [...visibleData]
    .sort((a, b) => b.timestamp - a.timestamp)
    .reduce((groups, item) => {
      const yearLabel = getIndexYearLabel(item);
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.year !== yearLabel) {
        groups.push({ year: yearLabel, items: [item] });
      } else {
        lastGroup.items.push(item);
      }
      return groups;
    }, [] as { year: string; items: ImageData[] }[])
    .sort((a, b) => {
      if (a.year === 'Unknown') return 1;
      if (b.year === 'Unknown') return -1;
      return Number(b.year) - Number(a.year);
    });

  const handleGridDensity = (delta: number) => {
    if (isHorizontalScroll) {
      setRowSize((prev) => Math.max(120, Math.min(400, prev + delta * 20)));
    } else {
      setGridColumns((prev) => Math.max(2, Math.min(12, prev - delta)));
    }
  };

  const updateActiveCenterForYear = (year: string) => {
    const row = rowRefs.current[year];
    if (!row) return;

    const items = Array.from(row.querySelectorAll<HTMLElement>('.carousel-item'));
    if (!items.length) return;

    const containerCenter = row.scrollLeft + row.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(itemCenter - containerCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveCenterByYear((prev) => (prev[year] === nearestIndex ? prev : { ...prev, [year]: nearestIndex }));
  };

  useEffect(() => {
    if (!isHorizontalScroll) return;
    const raf = requestAnimationFrame(() => {
      indexGroups.forEach((group) => updateActiveCenterForYear(group.year));
    });
    return () => cancelAnimationFrame(raf);
  }, [isHorizontalScroll, indexGroups, rowSize]);

  // When timeline is activated and we have a desired timestamp, scroll to it
  useEffect(() => {
    if (!isTimeline) return;
    if (!desiredTimelineTimestamp) return;
    const el = timelineRef.current;
    if (!el) return;

    const scale = baseZoom * zoomLevels[zoomIndex] * 1.1;
    const topPos = getTimelinePosition(desiredTimelineTimestamp);
    const elRect = el.getBoundingClientRect();
    const elTopAbs = window.scrollY + elRect.top;
    const itemVisualTop = elTopAbs + topPos * scale;
    const target = Math.max(0, itemVisualTop - window.innerHeight / 2);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'smooth' });
      // clear desired timestamp after scrolling
      setDesiredTimelineTimestamp(null);
    });
  }, [isTimeline, desiredTimelineTimestamp, zoomIndex, baseZoom]);

  return (
    <div className="corsica-grid-container">
      <AudioPlayer />
      <button
        onClick={() => setShowRightIcons((prev) => !prev)}
        className={`toggle-view-btn controls-menu-btn ${showRightIcons ? 'active' : ''}`}
        aria-label="Toggle right-side controls"
      >
        <img src={controlsMenuIcon} alt="Controls" />
      </button>

      <div className="corsica-grid-controls">
        <div className={`controls-icons-stack ${showRightIcons ? 'show' : ''}`}>
          {onShowIndexList && (
            <button
              onClick={onShowIndexList}
              className="toggle-view-btn"
            >
              <img src={indexTextIcon} alt="INDEX(LIST)" />
            </button>
          )}
          <button
            onClick={() => setIsTimeline(false)}
            className={`toggle-view-btn ${!isTimeline ? 'active' : ''}`}
          >
            <img src={indexArtIcon} alt="Index" />
          </button>
          <button
            onClick={() => setIsTimeline(true)}
            className={`toggle-view-btn ${isTimeline ? 'active' : ''}`}
          >
            <img src={indexTimelineIcon} alt="Timeline" />
          </button>
          {setIsHorizontalScroll && (
            <button
              onClick={() => {
                if (!isTimeline) {
                  // capture center poster timestamp before switching
                  const centerTimestamp = (() => {
                    try {
                      const centerY = window.scrollY + window.innerHeight / 2;
                      let bestDist = Infinity;
                      let bestTs: number | null = null;
                      corsicaData.forEach((item) => {
                        const img = document.querySelector(`img[alt="${item.fileName}"]`) as HTMLImageElement | null;
                        if (!img) return;
                        const rect = img.getBoundingClientRect();
                        const imgCenter = window.scrollY + rect.top + rect.height / 2;
                        const d = Math.abs(imgCenter - centerY);
                        if (d < bestDist) {
                          bestDist = d;
                          bestTs = item.timestamp;
                        }
                      });
                      return bestTs;
                    } catch (e) {
                      return null;
                    }
                  })();
                  setDesiredTimelineTimestamp(centerTimestamp ?? null);
                  setIsTimeline(true);
                } else if (onShowIndexList) {
                  onShowIndexList();
                } else {
                  setIsTimeline(false);
                }
              }}
              className={`toggle-view-btn ${isTimeline ? 'active' : ''}`}
              aria-label={isTimeline ? 'Go to index list' : 'Go to timeline view'}
            >
              <img src={isTimeline ? indexTextIcon : indexTimelineIcon} alt={isTimeline ? 'Index list' : 'Timeline'} />
            </button>
          )}
        </div>
      </div>

      {isTimeline && (
        <div className="zoom-buttons-container">
          <button 
            className="zoom-btn"
            onClick={() => changeTimelineZoom(-1)}
            disabled={zoomIndex === 0}
          >
            −
          </button>
          <button 
            className="zoom-btn"
            onClick={() => changeTimelineZoom(1)}
            disabled={zoomIndex === zoomLevels.length - 1}
          >
            +
          </button>
          <div className="zoom-value">{(zoomLevels[zoomIndex] * 100).toFixed(0)}%</div>
          <button
            className="icon-toggle-btn"
            onClick={() => setIconToggle(prev => !prev)}
          >
            <img src={iconToggle ? icon2 : icon1} alt="toggle icon" />
          </button>
        </div>
      )}

      {isTimeline ? (
        <div
          ref={timelineRef}
          className="timeline"
          onWheel={handleWheelZoom}
          style={{ transform: `scale(${baseZoom * zoomLevels[zoomIndex] * 1.1})`, transformOrigin: 'top center' }}
        >
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
          
          {(visibleData && visibleData.length ? visibleData : [])
            .filter(i => i.event && i.event !== 'unknown')
            .map((item, index) => {
            const topPosition = getTimelinePosition(item.timestamp);
            // Generate pseudo-random horizontal offset based on index to reduce overlap
            const seed = index * 73856093 ^ item.timestamp;
            // generate a positive horizontal offset so posters stay to the right of the line
            const raw = (((seed ^ (seed >> 15)) * 2654435761) >>> 0) % 400; // 0..399
            const randomOffset = 40 + raw; // ensure min gap from the line
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
                  <div className="timeline-image" style={{ transform: `translateX(${randomOffset}px)` }}>
                    <img src={item.src} alt={item.fileName} onClick={() => setSelectedImage(item)} />
                    <div className="timeline-event-name">{item.event}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="index-year-list">
          <div className="zoom-buttons-container">
            <button 
              className="zoom-btn"
              onClick={() => handleGridDensity(-1)}
              disabled={isHorizontalScroll ? rowSize <= 120 : gridColumns >= 12}
              aria-label={isHorizontalScroll ? "Decrease row size" : "Increase grid density"}
            >
              −
            </button>
            <button 
              className="zoom-btn"
              onClick={() => handleGridDensity(1)}
              disabled={isHorizontalScroll ? rowSize >= 400 : gridColumns <= 2}
              aria-label={isHorizontalScroll ? "Increase row size" : "Decrease grid density"}
            >
              +
            </button>
            <div className="zoom-value">{isHorizontalScroll ? `${rowSize}px` : `${gridColumns} cols`}</div>
          </div>
          {indexGroups.map((group) => (
            <div
              key={group.year}
              className="index-year-row"
              style={{ position: 'relative' }}
            >
              <div
                className="index-year-meta"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              >
                <div className="index-year-label">{group.year}</div>
              </div>
              <div
                className={isHorizontalScroll ? "svg-scroll-grid index-year-grid scroll-horizontal carousel-scroll" : "svg-scroll-grid index-year-grid"}
                ref={isHorizontalScroll ? (el) => { rowRefs.current[group.year] = el; } : undefined}
                onScroll={isHorizontalScroll ? () => updateActiveCenterForYear(group.year) : undefined}
                style={isHorizontalScroll ? { 
                  display: 'flex', 
                  flexWrap: 'nowrap',
                  overflowX: 'auto', 
                  gap: '0', 
                  paddingBottom: '20px',
                  paddingLeft: '40%',
                  paddingRight: '40%',
                  alignItems: 'center',
                  height: `${rowSize}px`,
                  width: '100%'
                } : { gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`, width: '100%' }}
              >
                {group.items.map((item, index) => {
                  const centerIndex = activeCenterByYear[group.year] ?? Math.floor(group.items.length / 2);
                  const distanceFromCenter = Math.abs(index - centerIndex);
                  const stackOrder = group.items.length - distanceFromCenter;
                  const baseOverlap = rowSize * 0.32;
                  const centerSpacing = rowSize * 0.12;
                  const isCenterItem = index === centerIndex;
                  
                  let marginLeft = 0;
                  if (index === 0) {
                    marginLeft = 0;
                  } else if (isCenterItem) {
                    marginLeft = centerSpacing;
                  } else {
                    // Overlap increases with distance from center for spreading effect
                    const spreadFactor = distanceFromCenter * 0.2;
                    marginLeft = -(baseOverlap + (baseOverlap * spreadFactor));
                  }

                  return (
                  <div 
                    key={`${group.year}-${index}`} 
                    className={isHorizontalScroll ? "svg-box carousel-item" : "svg-box"} 
                    style={isHorizontalScroll ? { 
                      flex: '0 0 auto', 
                      width: `${rowSize * 0.7}px`, 
                      height: `${rowSize}px`,
                      marginLeft: `${marginLeft}px`,
                      transition: 'all 0.3s ease',
                      zIndex: stackOrder,
                      transform: isCenterItem ? 'scale(1.14)' : 'scale(1)'
                    } : {}}
                  >
                    <img src={item.src} alt={item.fileName} onClick={() => setSelectedImage(item)} />
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedImage && isDesktop && (
        <div
          className="image-side-panel"
          style={{
            position: 'fixed',
            right: 0,
            top: 'var(--header-height)',
            height: `calc(100vh - var(--header-height))`,
            width: '36vw',
            maxWidth: '520px',
            background: '#0f0f0f',
            boxShadow: '0 0 40px rgba(0,0,0,0.6)',
            zIndex: 12000,
            padding: 18,
            overflowY: 'auto'
          }}
          onClick={(e) => { e.stopPropagation(); }}
        >
          <button
            aria-label="Close preview"
            onClick={() => setSelectedImage(null)}
            style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '6px 10px', float: 'right', cursor: 'pointer' }}
          >
            Close
          </button>
          <div style={{ clear: 'both' }} />
          <img src={selectedImage.src} alt={selectedImage.fileName} style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 12 }} />
          <div style={{ color: '#ccc', marginBottom: 8, fontWeight: 600 }}>{selectedImage.event}</div>
          <div style={{ color: '#999', marginBottom: 12 }}>{new Date(selectedImage.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style={{ color: '#ccc', marginBottom: 8 }}>{selectedImage.fileName}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(() => {
              const details = selectedImage.event || selectedImage.fileName || '';
              const parts = details.split(/[,;\/\|]+|\s+and\s+|\s*&\s*/i).map(s => s.trim()).filter(Boolean);
              return parts.map((p, i) => (
                <button
                  key={i}
                  className="artist-chip"
                  onClick={() => {
                    setQueryImmediate(p);
                    if (onShowIndexRegular) onShowIndexRegular();
                    else if (onShowIndexList) onShowIndexList();
                    setSelectedImage(null);
                  }}
                >
                  {p}
                </button>
              ));
            })()}
          </div>
        </div>
      )}

      {selectedImage && !isDesktop && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.fileName} />
            <div className="modal-info">
              <div className="modal-event">{selectedImage.event}</div>
              <div className="modal-date">{new Date(selectedImage.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="modal-details">
                <div style={{ color: '#ccc', marginBottom: 10 }}>
                  {selectedImage.event || selectedImage.fileName}
                </div>
                {(() => {
                  const details = selectedImage.event || selectedImage.fileName || '';
                  const parts = details.split(/[,;\/\|]+|\s+and\s+|\s*&\s*/i).map(s => s.trim()).filter(Boolean);
                  if (!parts.length) return null;
                  return (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {parts.map((p, i) => (
                        <button
                          key={i}
                          className="artist-chip"
                          onClick={() => {
                            setQueryImmediate(p);
                            if (onShowIndexRegular) onShowIndexRegular();
                            else if (onShowIndexList) onShowIndexList();
                            setSelectedImage(null);
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Corsica;
