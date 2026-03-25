import Corsica from './Corsica';
import CorsicaFilename from './CorsicaFilename';

type CorsicaNewSource = 'json' | 'filename';

interface CorsicaNewProps {
  source?: CorsicaNewSource;
  onShowIndexList?: () => void;
  onShowIndexRegular?: () => void;
  isHorizontalScroll?: boolean;
  setIsHorizontalScroll?: (value: boolean) => void;
  initialTimeline?: boolean;
}

const CorsicaNew: React.FC<CorsicaNewProps> = ({
  source = 'filename',
  onShowIndexList,
  onShowIndexRegular,
  isHorizontalScroll,
  setIsHorizontalScroll,
  initialTimeline = false,
}) => {
  if (source === 'json') {
    return (
      <Corsica
        onShowIndexList={onShowIndexList}
        onShowIndexRegular={onShowIndexRegular}
        isHorizontalScroll={isHorizontalScroll}
        setIsHorizontalScroll={setIsHorizontalScroll}
      />
    );
  }

  return (
    <CorsicaFilename
      onShowIndexList={onShowIndexList}
      onShowIndexRegular={onShowIndexRegular}
      isHorizontalScroll={isHorizontalScroll}
      setIsHorizontalScroll={setIsHorizontalScroll}
      initialTimeline={initialTimeline}
    />
  );
};

export default CorsicaNew;