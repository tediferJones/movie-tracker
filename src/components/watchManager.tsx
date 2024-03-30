import { watched } from "@/drizzle/schema"
import easyFetch from "@/lib/easyFetch"
import { useEffect, useState } from "react"
import Loading from "./loading";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

type WatchRecord = typeof watched.$inferSelect;

export default function WatchManger({ imdbId }: { imdbId: string }) {
  const [watched, setWatched] = useState<WatchRecord[]>()
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<WatchRecord[]>('/api/watched', 'GET', { imdbId })
      .then(data => setWatched(data));
  }, [refreshTrigger])

  return (
    <div className='flex w-1/2 flex-col justify-between gap-4 p-4 text-center showOutline'>
      <h1 className='text-xl'>Watch Manager</h1>
      {!watched ? <Loading /> : 
        <div className='flex flex-col gap-4 overflow-y-auto'>
          {!watched.length ? 'No records found' : watched.map(record => {
            const date = new Date(record.date)
            return <span key={record.date} className='flex items-center justify-center gap-2'>
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} at {date.toLocaleTimeString()}
              <Trash2 className='min-h-6 min-w-6 text-red-700'
                onClick={() => {
                  easyFetch('/api/watched', 'DELETE', { id: record.id }, true)
                    .then(() => setRefreshTrigger(!refreshTrigger))
                }}
              />
            </span>
          })}
        </div>
      }
      <Button onClick={() => {
        easyFetch('/api/watched', 'POST', { imdbId }, true)
          .then(() => setRefreshTrigger(!refreshTrigger))
      }}>New Record</Button>
    </div>
  )
}