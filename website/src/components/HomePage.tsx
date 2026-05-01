import { usePageContext } from '../context/PageContext';
import { useInstantModeEnabled } from '../context/InstantModeEnabledContext';

export function HomePage() {
  const { setPage, setBlogOnly } = usePageContext();
  const { isEnabled } = useInstantModeEnabled();

  const handleClick = () => {
    setBlogOnly(false);
    if (isEnabled) {
      setPage('instant');
      return;
    }
    setPage('find-url');
  };

  const handleBlogClick = () => {
    setBlogOnly(true);
    setPage('find-url');
  };

  return (
    <div className='retro-wrapper'>
      <main className='retro-main'>
        <pre className='retro-ascii'>{`+----------------------------------+
|   visit a random website  [v2]   |
+----------------------------------+`}</pre>

        <p className='retro-desc'>
          96.55% of pages receive no organic search traffic.
          <br />
          Explore the forgotten corners of the internet.
        </p>

        <button type='button' className='retro-button' onClick={handleClick}>
          [ visit a random site ]
        </button>

        <button type='button' className='retro-button-secondary' onClick={handleBlogClick}>
          [ visit a random blog ]
        </button>

        <p className='retro-counter'>[ websites indexed: 13,338,557 ]</p>

        <div className='retro-credit'>
          <p>
            Original project by{' '}
            <a href='https://github.com/longergrass/visitarandomwebsite' target='_blank' rel='noreferrer'>
              longergrass
            </a>
          </p>
          <p>
            Fork &amp; redesign by{' '}
            <a href='https://github.com/folankagne/visitarandomwebsite' target='_blank' rel='noreferrer'>
              folankagne
            </a>
          </p>
          <p>
            Built with{' '}
            <a href='https://claude.ai/code' target='_blank' rel='noreferrer'>
              Claude Code
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
