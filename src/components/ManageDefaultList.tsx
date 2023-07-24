'use client';

import { useEffect, useState } from 'react';
import { userLists, newDefaultList } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function ManageDefaultList() {
  const [userData, setUserData] = useState<newDefaultList | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)

  useEffect(() => {
    easyFetch('/api/lists', 'GET')
      .then((data: userLists) => {
        const listnames = Object.keys(data.lists);
        setUserData({
          defaultListname: data.defaultListname,
          listnames,
          newDefaultListname: data.defaultListname && listnames.includes(data.defaultListname) 
            ? data.defaultListname : Object.keys(data.lists)[0],
        })
      })
  }, [refreshTrigger])

  return (
    <div>
      <h1>THIS IS THE ManageDefaultList Component</h1>
      {userData === null ? <h1>Loading...</h1> :
        <div className='bg-gray-700 p-4'>
          <h1>Your default list is: {userData.defaultListname ? userData.defaultListname : 'No Default List Found'}</h1>

          <select className='text-black' 
            onChange={(e) => setUserData({ ...userData, newDefaultListname: e.target.value })} 
            value={userData.newDefaultListname}
          >
            {userData.listnames.map((listname: string) => <option value={listname} key={listname}>{listname}</option>)}
          </select>

          <button onClick={async() => {
            let method = 'PUT';
            if (!userData.defaultListname) method = 'POST';
            if (userData.defaultListname === userData.newDefaultListname) method = 'DELETE';

            await easyFetch('/api/defaultList', method, { defaultListname: userData.newDefaultListname })
            setRefreshTrigger(!refreshTrigger)
          }}>{userData.defaultListname === userData.newDefaultListname ? 
              'Remove default list' : `Make ${userData.newDefaultListname} my default list`}
          </button>
        </div>
      }
    </div>
  )
}
