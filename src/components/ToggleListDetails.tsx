'use client';

import { useEffect, useState } from 'react';
import easyFetch from '@/modules/easyFetch';

export default function ToggleListDetails(props: any) {
  console.log('THIS IS THE PROPS')
  console.log(props)
  const { imdbID } = props;
  // Make a type for this kind of output in the types file, import it here instead of using any
  const [listDetails, setListDetails] = useState<null | any>(null)

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setListDetails(data))
  }, [])

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  return (
    <div>
      <h1>This is the ToggleListDetails Component</h1>
      {!listDetails ? [] :
        <div>{JSON.stringify(listDetails)}</div>
      }
    </div>
  )
}
