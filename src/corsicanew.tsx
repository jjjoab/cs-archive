import Corsica from './Corsica';
import CorsicaFilename from './CorsicaFilename';

type CorsicaNewSource = 'json' | 'filename';

interface CorsicaNewProps {
  source?: CorsicaNewSource;
  onShowIndexList?: () => void;
  onShowIndexRegular?: () => void;
  onNextView?: () => void;
  isHorizontalScroll?: boolean;
  setIsHorizontalScroll?: (value: boolean) => void;
  initialTimeline?: boolean;
  onVisibleCountChange?: (count: number) => void;
}

const CorsicaNew: React.FC<CorsicaNewProps> = ({
  source = 'filename',
  onShowIndexList,
  onShowIndexRegular,
  onNextView,
  isHorizontalScroll,
  setIsHorizontalScroll,
  initialTimeline = false,
  onVisibleCountChange,
}) => {
  if (source === 'json') {
    return (
      <Corsica
        onShowIndexList={onShowIndexList}
        onShowIndexRegular={onShowIndexRegular}
        onNextView={onNextView}
        isHorizontalScroll={isHorizontalScroll}
        setIsHorizontalScroll={setIsHorizontalScroll}
        onVisibleCountChange={onVisibleCountChange}
      />
    );
  }

  return (
    <CorsicaFilename
      onShowIndexList={onShowIndexList}
      onShowIndexRegular={onShowIndexRegular}
      onNextView={onNextView}
      isHorizontalScroll={isHorizontalScroll}
      setIsHorizontalScroll={setIsHorizontalScroll}
      initialTimeline={initialTimeline}
      onVisibleCountChange={onVisibleCountChange}
    />
  );
};

export default CorsicaNew;