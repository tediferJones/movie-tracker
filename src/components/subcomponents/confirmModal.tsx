import { X } from 'lucide-react';
import { ReactNode } from 'react';

export default function confirmModal(
  {
    visible,
    setVisible,
    action,
    children,
    acceptText,
  }: {
    visible: boolean,
    setVisible: Function,
    action: Function,
    children: ReactNode,
    acceptText?: string,
  }
) {
  const toggleClass = visible ? 'opacity-100 z-10 backdrop-blur-lg' : 'pointer-events-none opacity-0 backdrop-blur-none';
  return (
    <div className={`${toggleClass} transition-all duration-300 fixed top-0 left-0 w-screen h-screen flex justify-center items-center`}
      onClick={() => setVisible(false)}
    >
      <div className='relative max-w-[90vw] max-h-[90vh] overflow-y-auto showOutline m-4 p-4 bg-background flex flex-col gap-4 h-min'>
        <div className='hover:ring-2 rounded-lg p-1 ml-auto'>
          <X className='cursor-pointer' onClick={() => setVisible(false)} />
        </div>
        {children}
        <div className='flex gap-4 justify-end'>
          <button className='py-2 px-4 bg-primary rounded-lg'
            type='button'
            onClick={() => setVisible(false)}
          >Back</button>
          <button className={`py-2 px-4 rounded-lg ${acceptText ? 'bg-primary' : 'bg-red-600'}`}
            type='button'
            onClick={() => {
              setVisible(false)
              action()
            }}
          >{acceptText || 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}
