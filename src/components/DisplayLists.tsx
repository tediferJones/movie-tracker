'use client';

import { useEffect, useState } from 'react';
import { userLists } from '@/types';
import DisplayMiniMediaInfo from '@/components/DisplayMiniMediaInfo';
import easyFetch from '@/modules/easyFetch';

export default function DisplayLists(props: { username: string }) {
  const { username } = props;
  const [userLists, setUserLists] = useState<{ [key: string]: string[] }>({})
  // console.log(username)
  //
  //
  // RIGHT NOW THIS COMPONENT ONLY RENDERS THE LOGGED IN USERS LISTS,
  // We want this component to display info based on a certain username
  // i.e. we need to setup /api/lists GET to return info related to username, if username is given

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { username })
        .then((res: Response) => res.json())
        .then((data: userLists) => setUserLists(data.lists))
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
                <DisplayMiniMediaInfo key={imdbID} imdbID={imdbID} display={['Title', 'Poster']}/>
              )
            })}
          </div>
        )
      })}
    </div>
  )

}
