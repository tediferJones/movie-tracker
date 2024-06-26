import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import GetLinks from '@/components/subcomponents/getLinks';
import TableRow from '@/components/table/tableRow';
import { fromCamelCase, getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

type SortType = 'asc' | 'desc';
type SortFuncs = {
  [key in 'string' | 'number']: {
    [key in SortType]: (a: ExistingMediaInfo, b: ExistingMediaInfo) => number
  }
}

export default function MyTable({ data, children }: { data: ExistingMediaInfo[], children?: ReactNode }) {
  data = data.map((rec, i, arr) => arr[arr.length - 1 - i])
  const columns = ['title', 'rated', 'startYear', 'runtime', 'imdbRating', 'metaRating', 'tomatoRating', ''];
  const details = ['director', 'writer', 'actor', 'genre', 'country', 'language'];

  const [sortType, setSortType] = useState<SortType>('asc');
  const [sortCol, setSortCol] = useState('');
  const [searchCol, setSearchCol] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');

  function search(mediaInfo: ExistingMediaInfo) {
    if (!searchTerm) return true;
    if (!mediaInfo[searchCol]) return false;
    if (typeof(mediaInfo[searchCol]) === 'string') {
      return mediaInfo[searchCol].toLowerCase().includes(searchTerm.toLowerCase()) 
    }
    return mediaInfo[searchCol].some((str: string) => str.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  function shallowSort(arr: ExistingMediaInfo[]): ExistingMediaInfo[] {
    if (!sortCol) return arr;

    const sortFunc: SortFuncs = {
      string: {
        asc: (a, b) => a[sortCol]?.toLowerCase()?.localeCompare(b[sortCol]?.toLowerCase()),
        desc: (a, b) => b[sortCol]?.toLowerCase()?.localeCompare(a[sortCol]?.toLowerCase())
      },
      number: {
        asc: (a, b) => a[sortCol] - b[sortCol],
        desc: (a, b) => b[sortCol] - a[sortCol],
      }
    }

    const dataType = ['title', 'rated'].includes(sortCol) ? 'string' : 'number';
    return [...arr].sort(sortFunc[dataType][sortType]);
  }

  function formatCell(key: string, val: any) {
    return val ? 'N/A' : getKeyFormatter[key] ? getKeyFormatter[key](val) : val
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-4'>
        {children}
        <Input placeholder={`Search by ${searchCol}`} 
          onChange={e => setSearchTerm(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>{fromCamelCase(searchCol)}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 max-h-[60vh] overflow-auto'>
            <DropdownMenuLabel>Search column</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={searchCol} onValueChange={setSearchCol}>
              {['title', 'rated'].concat(details).filter(str => str).map(key => {
                return <DropdownMenuRadioItem key={key} value={key}>{fromCamelCase(key)}</DropdownMenuRadioItem>
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='showOutline overflow-x-auto hidden sm:table'>
        <table className='w-full'>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={`colHeader-${col}`}
                  className={`text-muted-foreground p-2 ${col === '' ? '' : sortCol !== col ? '' : sortType === 'asc' ? 'bg-secondary' : 'bg-neutral-800'}`}
                >
                  <button onClick={() => {
                    if (col !== sortCol) return setSortCol(col)
                    if (sortType === 'desc') setSortCol('')
                    setSortType(sortType === 'asc' ? 'desc' : 'asc')
                  }}>{fromCamelCase(col)}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ?
              <tr><td colSpan={100} className='text-center py-8 text-sm'>No Data Found</td></tr> :
              shallowSort(data.filter(search)).map(mediaInfo => (
                <TableRow
                  mediaInfo={mediaInfo}
                  keys={columns}
                  details={details}
                  key={mediaInfo.imdbId}
                />))
            }
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className='p-2 sm:hidden showOutline flex gap-2'>
        <span className='flex justify-center items-center text-center border-r pr-2'>Sort By</span>
        <div className='flex flex-wrap justify-center gap-2'>
          {columns.filter(col => col).map(col => {
            return (
              <button className={`flex-1 rounded-md text-muted-foreground p-2 ${col === '' ? '' : sortCol !== col ? '' : sortType === 'asc' ? 'bg-secondary' : 'bg-neutral-800'}`}
                key={col}
                onClick={() => {
                  if (col !== sortCol) return setSortCol(col)
                  if (sortType === 'desc') setSortCol('')
                  setSortType(sortType === 'asc' ? 'desc' : 'asc')
                }}>{fromCamelCase(col)}</button>
            )
          })}
        </div>
      </div>
      <Accordion type='multiple' className='block sm:hidden'>
        {shallowSort(data.filter(search)).map(mediaInfo => {
          return (
            <AccordionItem value={mediaInfo.imdbId} key={mediaInfo.imdbId}>
              <AccordionTrigger className='hover:no-underline px-2 flex gap-2'>
                <div className='flex flex-col gap-2 w-full'>
                  <Link className='w-fit m-auto' href={`/media/${mediaInfo.imdbId}`}>
                    {mediaInfo.title}
                  </Link>
                  <div className='flex gap-4 justify-between'>
                    {['rated', 'startYear', 'runtime'].map(key => (
                      <div className='flex-1 text-center'
                        key={`${mediaInfo.imdbId}-${key}`}
                      >
                        {!mediaInfo[key] ? 'N/A' :
                          getKeyFormatter[key] ? getKeyFormatter[key](mediaInfo[key]) : mediaInfo[key]
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className='flex flex-col gap-2'>
                <div className='flex justify-between px-2'>
                  {['imdbRating', 'tomatoRating', 'metaRating'].map(key => (
                    <div className='flex flex-wrap gap-1 justify-center items-center'
                      key={`${mediaInfo.imdbId}-${key}`}
                    >
                      <span>{fromCamelCase(key)}:</span>
                      <span>{getKeyFormatter[key](mediaInfo[key])}</span>
                    </div>
                  ))}
                </div>
                {details.map(key => (
                  <div className='grid grid-cols-4' key={`${mediaInfo.imdbId}-${key}`}>
                    <span className='col-span-1 text-center m-auto'>{fromCamelCase(key)}:</span>
                    <div className='col-span-3 text-center'>
                      <GetLinks type={key} arr={mediaInfo[key]}/>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
