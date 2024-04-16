import Link from 'next/link';

export default function Footer() {
  return (
    <div className='flex-1 flex flex-col justify-end'>
      <div className='border-t flex flex-wrap justify-center p-4 gap-1'>
        <span>All media info is provided by</span>
        <Link className='underline'
          href='https://www.omdbapi.com/'
        >OMDB API</Link>
      </div>
    </div>
  )
}
