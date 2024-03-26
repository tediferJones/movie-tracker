import { watched } from "@/drizzle/schema"
import easyFetch from "@/lib/easyFetch"
import { useEffect, useState } from "react"
import Loading from "./loading";
import { Trash2 } from "lucide-react";

type WatchRecord = typeof watched.$inferSelect;

export default function WatchManger({ imdbId }: { imdbId: string }) {
  const [watched, setWatched] = useState<WatchRecord[]>()
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<WatchRecord[]>('/api/watched', 'GET', { imdbId })
      .then(data => setWatched(data));
  }, [refreshTrigger])

  return (
    <div className='flex-1 flex flex-col gap-4 text-center border-2 p-4'>
      <h1 className='text-xl'>Watch Manager</h1>
      {!watched ? <Loading /> : 
        <div className='flex flex-col gap-4 max-h-[40vh] overflow-y-auto'>
          {watched.map(record => {
            const date = new Date(record.date)
            return <span key={record.date} className='flex gap-2 justify-center items-center'>
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} at {date.toLocaleTimeString()}
              <Trash2 className='text-red-700 min-h-6 min-w-6'
                onClick={() => {
                  easyFetch('/api/watched', 'DELETE', { id: record.id }, true)
                    .then(() => setRefreshTrigger(!refreshTrigger))
                }}
              />
            </span>
          })}
        </div>
      }
      <button className='colorPrimary'
        onClick={() => {
          easyFetch('/api/watched', 'POST', { imdbId }, true)
            .then(() => setRefreshTrigger(!refreshTrigger))
        }}
      >New Record</button>
    </div>
  )
}
