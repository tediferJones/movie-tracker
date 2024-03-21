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
    <>
      {userData === null ? <h1>Loading...</h1> :
        <div className='m-4 mx-auto flex w-4/5 justify-between bg-gray-700 p-4'>
          <h1 className='my-auto w-1/4 text-center'>
            Your default list is: {userData.defaultListname ? userData.defaultListname : 'No Default List Found'}
          </h1>

          <select className='flex w-1/4 text-center text-black' 
            onChange={(e) => setUserData({ ...userData, newDefaultListname: e.target.value })} 
            value={userData.newDefaultListname}
          >
            {userData.listnames.map((listname: string) => <option value={listname} key={listname}>{listname}</option>)}
          </select>

          <button className='w-1/4 bg-blue-500 p-2'
            onClick={async() => {
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
    </>
  )
}
