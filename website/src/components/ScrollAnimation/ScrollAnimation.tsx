import { useEffect, useState } from 'react';
import { DesktopScrollAnimation } from './DesktopScrollAnimation';
import { MobileScrollAnimation } from './MobileScrollAnimation';
import { useURL } from '../../hooks/useURL';
import { Spinner } from '../Spinner';
import { usePageContext } from '../../context/PageContext';

export function ScrollAnimation({ onReroll, blogOnly }: { onReroll: () => void; blogOnly?: boolean }) {
  const url = useURL(blogOnly);
  const { setPage, setBlogOnly } = usePageContext();

  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleBack = () => {
    setBlogOnly(false);
    setPage('home');
  };

  return (
    <div className='retro-find-bg'>
      <button onClick={handleBack} className='retro-back-btn'>
        ← back
      </button>
      {!url || typeof windowWidth !== 'number' ? (
        <div className='fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'>
          <Spinner />
        </div>
      ) : windowWidth > 968 ? (
        <DesktopScrollAnimation url={url} onReroll={onReroll} blogOnly={blogOnly} />
      ) : (
        <MobileScrollAnimation url={url} onReroll={onReroll} blogOnly={blogOnly} />
      )}
    </div>
  );
}
