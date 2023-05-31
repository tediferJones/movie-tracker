'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LinkToMovie(props: any) {
  // Idk i guess this whole component is useless, you can probably delete it
  // There is still hope: see dbChecker comments

  console.log(props)
  const { imdbID } = props;
  // const router = useRouter();
  // router.push('/movies/tt0072021')
  const [state, setState] = useState<null | true | false>(null)
  const router = useRouter();

  if (state !== null) {
    if (state) {
      console.log('found movie redirecting')
      router.push(`/movies/${imdbID}`)
    } else {
      console.log('add movie to db via fetch req to api POST route for movies')
    }
  }

  async function checkDb(e: any) {
    const test = await fetch('/api/movies?' + new URLSearchParams({ imdbID: e.target.value }), { method: 'HEAD' });
    console.log(test.status);
    if (test.status === 200) {
      setState(true);
      // const router = useRouter();
      // console.log('REDIRECTING')
      // router.push(`/movies/${e.target.value}`)
      // return
      
    }
    // If status === 200, send to movie page
    // if status === 404, add movie to DB
    // if status === 400, do nothing, something is very broken
    //
    // TO DO THIS WITH API ROUTES
    // if status === 200, GET request to /movies/[imdbID]
    // if status === 404, POST request to /movies/[imdbID] then send a get request with the same imdbID
    // if status === 400, still do nothing
  }

  return (
    <button onClick={checkDb} value={imdbID}>NEW LINK</button>
  )

}
