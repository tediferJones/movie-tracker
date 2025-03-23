'use client';

import MediaPage from "@/components/pages/mediaPage";
import ListManager from "@/components/pages/mediaPage/listManager";
import MediaInfo from "@/components/pages/mediaPage/mediaInfo";
import ReviewManager from "@/components/pages/mediaPage/reviewManager";
import WatchManger from "@/components/pages/mediaPage/watchManager";
import GetBreadcrumbs from "@/components/subcomponents/getBreadcrumbs";
import Loading from "@/components/subcomponents/loading";
import easyFetchV3 from "@/lib/easyFetchV3";
import { useEffect, useState } from "react";

type Params = { username: string, listname: string, imdbId: string }

export default function UserListItem({ params }: { params: Params }) {
  const username = decodeURIComponent(params.username);
  const listname = decodeURIComponent(params.listname);
  const imdbId = decodeURIComponent(params.imdbId);
  const [title, setTitle] = useState('');

  useEffect(() => {
    easyFetchV3<string>({
      route: `/api/media/${imdbId}/title`,
      method: 'GET'
    }).then(data => setTitle(data))
  }, [])

  return (
    !title ? <Loading /> :
      <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
        <GetBreadcrumbs links={{
          home: '/',
          users: '/users',
          [username]: `/users/${username}`,
          [listname]: `/users/${username}/${listname}`,
          [title]: `/users/${username}/${listname}/${imdbId}`
        }}/>
        <MediaPage imdbId={imdbId} />
      </div>
  )
}

