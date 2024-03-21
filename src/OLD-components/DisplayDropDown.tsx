'use client';

import { useState, useRef } from "react";

export default function DisplayDropDown({
  header,
  content,
  username,
  hideContentCount,
} : {
  header: string,
  content: JSX.Element[],
  username?: string,
  hideContentCount?: boolean,
}) {
  const [displayContent, setDisplayContent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className='bg-gray-700 m-4 p-4'>
      <h1 className='flex cursor-pointer justify-between text-2xl'
        onClick={() => {
          ref.current?.classList.toggle('hidden')
          setDisplayContent(!displayContent);
        }}
      > <div className='my-auto'>
          {header} {hideContentCount ? [] : `(${content.length})` }
        </div>

        <div className='flex'>
          {!username ? [] : 
            <a className='mr-4 bg-blue-400 p-2'
              href={`/lists/${username}/${header}`}
            >Go To List</a>
          }
          <div className='m-auto w-4'>
            {displayContent ? '-' : '+'}
          </div>
        </div>
      </h1>

      <div ref={ref} className='hidden'>
        {content}
      </div>
    </div>
  )
}
