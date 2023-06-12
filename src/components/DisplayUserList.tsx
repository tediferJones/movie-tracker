'use client';

import { useEffect, useState } from 'react';
import DisplayMovieInfo from '@/components/DisplayMovieInfo';
import easyFetch from '@/modules/easyFetch';

export default function DisplayUserList(props: { username: string }) {
  const [movies, setMovies] = useState([])
  const { username } = props;
  // console.log(username)

  useEffect(() => {
    // easyFetch('/api/lists', 'GET', {})
    //     .then((res: any) => res.json())
    //     .then((data: any) => setMovies(data))
  }, []);


  return (
    <div>
      <h1>{username}'s List</h1>
      {movies.map((item: any) => {
        return (
          <DisplayMovieInfo key={item.id} imdbID={item.imdbID}/>
        )
      })}
    </div>
  )

}
