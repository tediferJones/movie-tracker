import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className='flex justify-center items-center colorPrimary m-auto p-4'>
      <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
    </div>
  )
}
