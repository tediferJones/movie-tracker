'use client';

import { useState, useRef } from "react";
import DisplayMiniMediaInfo from "@/components/DisplayMiniMediaInfo";

export default function DisplayDropDown({
  header,
  content,
} : {
  header: string,
  content: string[],
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
      > {header} ({content.length})
        <span>{displayContent ? '-' : '+'}</span>
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
