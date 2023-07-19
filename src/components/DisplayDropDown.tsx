'use client';

import { useState, useRef } from "react";
import DisplayMiniMediaInfo from "@/components/DisplayMiniMediaInfo";

export default function DisplayDropDown({
  header,
  content,
  username,
} : {
  header: string,
  content: string[],
  username?: string,
}) {
  const [displayContent, setDisplayContent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <h1 className='flex cursor-pointer justify-between text-2xl'
        onClick={() => {
          ref.current?.classList.toggle('hidden')
          setDisplayContent(!displayContent);
        }}
      > <div className='my-auto'>
          {header} ({content.length})
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
        {content.map((imdbID: string) => {
          return <DisplayMiniMediaInfo className='flex p-4' 
            key={imdbID} 
            imdbID={imdbID} 
            display={['Title', 'Poster']}
          />
        })}
      </div>
    </div>
  )
}
