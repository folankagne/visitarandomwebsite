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
          <p style={{ marginBottom: '0.6rem', color: '#333' }}>URL sources:</p>
          <ul className='retro-source-list'>
            <li>– <a href='https://indieblog.page/' target='_blank' rel='noreferrer'>indieblog.page</a> — ~6 000 personal blogs</li>
            <li>– <a href='https://blogroll.org/' target='_blank' rel='noreferrer'>blogroll.org</a> — ~1 200 curated links</li>
            <li>– <a href='https://ooh.directory/' target='_blank' rel='noreferrer'>ooh.directory</a> — 670+ across 42 categories</li>
            <li>– <a href='https://512kb.club/' target='_blank' rel='noreferrer'>512kb.club</a> — sites under 512 KB</li>
            <li>– <a href='https://indieweb.org/blogroll' target='_blank' rel='noreferrer'>indieweb.org/blogroll</a> — IndieWeb members</li>
            <li>– <a href='https://tranco-list.eu/' target='_blank' rel='noreferrer'>Tranco top-1M</a> — top 50 000 by traffic</li>
          </ul>
          <p style={{ marginTop: '0.8rem' }}>
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
            Built with the help of{' '}
            <a href='https://claude.ai/code' target='_blank' rel='noreferrer'>
              Claude Code
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
