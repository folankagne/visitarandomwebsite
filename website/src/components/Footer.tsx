import * as Dialog from '@radix-ui/react-dialog';
import * as i from './Icons';

const SOURCES = [
  { label: 'indieblog.page', href: 'https://indieblog.page/', note: '~6 000 personal blogs' },
  { label: 'blogroll.org', href: 'https://blogroll.org/', note: '~1 200 curated links' },
  { label: 'ooh.directory', href: 'https://ooh.directory/', note: '670+ across 42 categories' },
  { label: '512kb.club', href: 'https://512kb.club/', note: 'sites under 512 KB' },
  { label: 'indieweb.org/blogroll', href: 'https://indieweb.org/blogroll', note: 'IndieWeb members' },
  { label: 'Tranco top-1M', href: 'https://tranco-list.eu/', note: 'top 50 000 by traffic' },
];

export function Footer() {
  return (
    <>
      <a
        href='https://github.com/folankagne/visitarandomwebsite'
        className='fixed bottom-3 left-3'
        style={{ zIndex: 60 }}
        target='_blank'
        rel='noreferrer'
        title='View on GitHub'
      >
        <i.GitHubIcon />
      </a>

      <Dialog.Root>
        <Dialog.Overlay className='fixed inset-0 bg-black bg-opacity-40 z-40' />
        <Dialog.Content
          className='DialogContent fixed top-1/2 z-50 -translate-y-1/2 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[520px] px-6 py-7 flex flex-col gap-5'
          style={{
            background: '#f5f0e8',
            border: '1px solid #1a1a1a',
            fontFamily: "'Courier New', Courier, monospace",
            color: '#1a1a1a',
          }}
        >
          <div className='flex justify-between items-center'>
            <Dialog.Title style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>
              [ about this site ]
            </Dialog.Title>
            <Dialog.Close style={{ cursor: 'pointer', fontSize: '1rem', color: '#555' }}>
              [x]
            </Dialog.Close>
          </div>

          <Dialog.Description asChild>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#333' }}>
              <p>
                Sends you to a random personal website, indie blog, or forgotten corner of the
                internet. Hotel, booking, and social-media domains are filtered out.
              </p>
            </div>
          </Dialog.Description>

          <div>
            <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.5rem' }}>
              URL sources:
            </p>
            <ul style={{ fontSize: '0.8rem', lineHeight: 1.9, listStyle: 'none', padding: 0 }}>
              {SOURCES.map(s => (
                <li key={s.href}>
                  <span style={{ color: '#888', marginRight: '0.4rem' }}>–</span>
                  <a
                    href={s.href}
                    target='_blank'
                    rel='noreferrer'
                    style={{ color: '#0000ee', textDecoration: 'underline' }}
                  >
                    {s.label}
                  </a>
                  <span style={{ color: '#888' }}> — {s.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.8rem', fontSize: '0.8rem', color: '#555', lineHeight: 1.8 }}>
            <p>
              Original project:{' '}
              <a
                href='https://github.com/longergrass/visitarandomwebsite'
                target='_blank'
                rel='noreferrer'
                style={{ color: '#0000ee', textDecoration: 'underline' }}
              >
                longergrass
              </a>
            </p>
            <p>
              Fork &amp; redesign:{' '}
              <a
                href='https://github.com/folankagne/visitarandomwebsite'
                target='_blank'
                rel='noreferrer'
                style={{ color: '#0000ee', textDecoration: 'underline' }}
              >
                folankagne
              </a>
            </p>
            <p>
              Built with the help of{' '}
              <a
                href='https://claude.ai/code'
                target='_blank'
                rel='noreferrer'
                style={{ color: '#0000ee', textDecoration: 'underline' }}
              >
                Claude Code
              </a>
            </p>
          </div>

          <Dialog.Close
            type='button'
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '0.9rem',
              background: 'none',
              border: '1px solid #333',
              color: '#1a1a1a',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            [ close ]
          </Dialog.Close>
        </Dialog.Content>

        <Dialog.Trigger
          className='fixed bottom-3 right-3'
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '0.8rem',
            color: '#555',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            zIndex: 60,
          }}
        >
          [ about ]
        </Dialog.Trigger>
      </Dialog.Root>
    </>
  );
}
