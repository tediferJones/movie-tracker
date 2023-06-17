'use client';

import { useEffect, useState } from 'react';
import DisplayMiniMovieInfo from '@/components/DisplayMiniMovieInfo';
import easyFetch from '@/modules/easyFetch';

export default function DisplayLists(props: { username: string }) {
  const [userLists, setUserLists] = useState<{ [key: string]: string[] }>({})
  const { username } = props;
  // console.log(username)
  //
  //
  // RIGHT NOW THIS COMPONENT ONLY RENDERS THE LOGGED IN USERS LISTS,
  // We want this component to display info based on a certain username
  // i.e. we need to setup /api/lists GET to return info related to username, if username is given

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { username })
        .then((res: any) => res.json())
        .then((data: any) => setUserLists(data))
  }, []);


  return (
    <div>
      <h1>{username}'s List</h1>
      {Object.keys(userLists).map((listname: string) => {
        return (
          <div key={listname}>
            <h1 className='text-2xl'>{listname}</h1>
            {userLists[listname].map((imdbID: string) => {
              return (
                <DisplayMiniMovieInfo key={imdbID} imdbID={imdbID}/>
              )
            })}
          </div>
        )
      })}
    </div>
  )

}
