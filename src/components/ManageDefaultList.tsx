'use client';

import { useEffect, useState } from 'react';
import easyFetch from '@/modules/easyFetch';

export default function ManageDefaultList() {
  const [defaultList, setDefaultList] = useState<string | null>(null)
  const [lists, setLists] = useState<string[] | null>(null)
  const [newDefaultList, setNewDefaultList] = useState<string>('')

  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)

  // WHAT HAPPENS IF WE DELETE DEFAULT LIST?
  // Answer: Then we need to update the record, and we default to PUT anyways so i guess we're just fine?

  useEffect(() => {
    easyFetch('/api/lists', 'GET', {})
      .then((res: Response) => res.json())
      .then((data: any) => {
        console.log('hello')
        console.log(data)
        setDefaultList(data.defaultList)
        setLists(Object.keys(data.lists))
        setNewDefaultList(Object.keys(data.lists)[0])
      })
  }, [refreshTrigger])

  return (
    <div>
      <h1>THIS IS THE ManageDefaultList Component</h1>
      {lists === null ? <h1>Loading...</h1> :
        <div className='bg-gray-700 p-4'>
          <h1>Your default list is: {defaultList ? defaultList : 'No Default List Found'}</h1>
          <h1>NEW DEFAULT LIST: {newDefaultList}</h1>
          {/* This button will pretty much always show "set this list as default list", 
          unless the selected list is already the default list, then it should show "remove as defaultList" and delete user's record,
          This will leave the program with assigning defaultList by alphabetical order*/}
          <select className='text-black' onChange={(e) => setNewDefaultList(e.target.value)} value={newDefaultList}>
            {lists.map((listname: string) => <option value={listname} key={listname}>{listname}</option>)}
          </select>
          <button onClick={async() => {
            console.log(newDefaultList)
            let method = 'PUT';
            if (defaultList === null) method = 'POST';
            if (defaultList === newDefaultList) method = 'DELETE';
            // if (defaultList && !Object.keys(lists).includes(defaultList)) method = 'PUT'
            await easyFetch('/api/defaultList', method, { defaultListname: newDefaultList })
            setRefreshTrigger(!refreshTrigger)
          }}>{defaultList === newDefaultList ? 'Remove default list' : `Make ${newDefaultList} my default list`}</button>
        </div>
      }
    </div>
  )
}
