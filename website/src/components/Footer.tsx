import * as Dialog from '@radix-ui/react-dialog';
import * as i from './Icons';

export function Footer() {
  return (
    <>
      <a
        href='https://github.com/longergrass/visitarandomwebsite'
        className='fixed bottom-3 left-3'
        target='_blank'
        title='Original project by longergrass'
      >
        <i.GitHubIcon />
      </a>
      <Dialog.Root>
        <Dialog.Overlay className='fixed inset-0 bg-black bg-opacity-50 z-40' />
        <Dialog.Content className='DialogContent xl:w-[525px] fixed top-1/2 z-50 -translate-y-1/2 left-7 right-7 md:left-1/2 md:-translate-x-1/2 bg-gray-950 px-7 py-8 rounded-3xl gap-4 flex flex-col border border-gray-900'>
          <div className='flex justify-between'>
            <Dialog.Title className='text-3xl text-white'>
              About
            </Dialog.Title>
            <Dialog.Close>
              <i.CloseIcon />
            </Dialog.Close>
          </div>

          <Dialog.Description asChild>
            <div className='xl:text-lg flex gap-3 flex-col'>
              <p>
                Original project by{' '}
                <a
                  href='https://github.com/longergrass/visitarandomwebsite'
                  target='_blank'
                  className='underline text-accent'
                >
                  longergrass
                </a>
              </p>
              <p>
                Forked &amp; redesigned by{' '}
                <a
                  href='https://github.com/folankagne/visitarandomwebsite'
                  target='_blank'
                  className='underline text-accent'
                >
                  folankagne
                </a>
              </p>
            </div>
          </Dialog.Description>
          <Dialog.Close
            type='button'
            className='bg-gray-900 border border-gray-700 rounded py-3'
          >
            Close
          </Dialog.Close>
          <Dialog.Close></Dialog.Close>
        </Dialog.Content>
        <Dialog.Trigger className='fixed underline text-gray-500 bottom-3 right-3'>
          about this site
        </Dialog.Trigger>
      </Dialog.Root>
    </>
  );
}
