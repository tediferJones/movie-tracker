'use client';

import { useState } from 'react';

export default function ExpandableList({ arr }: { arr: JSX.Element[] }) {
  const [length, setLength] = useState<number>(5);

  return (
    <div className='flex flex-col'>
      {arr.slice(0, length)}

      <div className='flex'>
        {length >= arr.length ? [] :
          <button className='p-4 bg-gray-700 m-2 flex-1'
            onClick={() => length + 5 < arr.length ? setLength(length + 5) : setLength(arr.length)}
          >More</button>
        }

        {length <= 5 ? [] :
          <button className='p-4 bg-gray-700 m-2 flex-1' 
            onClick={() => length - 5 > 5 ? setLength(length - 5) : setLength(5)}
          >Less</button>
        }
      </div>
    </div>
  )
}
