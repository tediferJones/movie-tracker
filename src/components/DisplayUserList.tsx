'use client';

import { useEffect, useState } from 'react';
import DisplayMovieInfo from '@/components/DisplayMovieInfo';
import easyFetch from '@/modules/easyFetch';

export default function DisplayUserList(props: { username: string }) {
  const [movies, setMovies] = useState([])
  const { username } = props;
  // console.log(username)

  // To get this all properly sorted:
  // 1. [ DONE ] get /api/lists HEAD request working (should return 200 if it exists, 404 if it doesnt)
  // 2. [ DONE ] Replace GET requests in AddToMyList with head request
  // 3. [ DONE ] Verify AddToMyList button functions as it did before
  // 4. Rewrite /api/lists GET request, it should return a single users list, or null if the user has no list

  useEffect(() => {
    // THIS SHOULD USE A GET REQUEST, but we're gunna test the HEAD request here while working on the HEAD api routes
    easyFetch('/api/lists', 'GET', {})
        .then((res: any) => res.json())
        .then((data: any) => setMovies(data))
    // console.log(movies);
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
