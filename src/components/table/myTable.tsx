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
import { ArrowDownAz,  ArrowUpZa, Lock } from 'lucide-react';
import OptionalScrollArea from '../subcomponents/optionalScrollArea';

type SortType = 'asc' | 'desc';
type SortFuncs = {
  [key in 'string' | 'number']: {
    [key in SortType]: (a: ExistingMediaInfo, b: ExistingMediaInfo) => number
  }
}

export default function MyTable(
  {
    data,
    children,
    linkPrefix,
    useScrollArea,
  }: {
    data: ExistingMediaInfo[],
    children?: ReactNode,
    linkPrefix: string,
    useScrollArea?: boolean,
  }
) {
  data = data.map((_, i, arr) => arr[arr.length - 1 - i]);
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
      return mediaInfo[searchCol].toLowerCase().includes(searchTerm.toLowerCase());
    }
    return mediaInfo[searchCol].some((str: string) => str.toLowerCase().includes(searchTerm.toLowerCase()));
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

  return (
    <div className='flex flex-col gap-4'>
      <div className={`flex gap-4 flex-wrap ${useScrollArea ? 'px-2 pt-2' : ''}`}>
        {children}
        <Input placeholder={`Search by ${searchCol}`} 
          onChange={e => setSearchTerm(e.target.value)}
          className='flex-1'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='sm:w-auto w-full'>Search By</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 max-h-[60vh] overflow-auto'>
            <DropdownMenuLabel>Search column</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={searchCol} onValueChange={setSearchCol}>
              {['title', 'rated'].concat(details).filter(str => str).map(key => {
                return <DropdownMenuRadioItem key={key} value={key}>
                  {fromCamelCase(key)}
                </DropdownMenuRadioItem>
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className='flex gap-4 sm:w-min w-full'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='sm:w-auto w-full'>Sort By</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by Column</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortCol} onValueChange={(col) => {
                setSortCol(col !== sortCol ? col : '');
              }}>
                {columns.filter(col => col).map(col => (
                  <DropdownMenuRadioItem value={col}>{fromCamelCase(col)}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* or just use shadcnui switch */}
          <div className={`relative my-auto bg-secondary rounded-full h-8 min-w-16 max-w-16 transition-all duration-1000`}
            onClick={() => {
              if (!sortCol) return;
              setSortType(sortType === 'asc' ? 'desc': 'asc');
            }}
          >
            <div className={`absolute flex items-center justify-center bg-primary h-full aspect-square rounded-full transition-all duration-1000 cursor-pointer ${!sortCol ? 'left-4 right-4 opacity-50 cursor-none' : sortType === 'asc' ? 'left-0 right-8' : 'left-8 right-0'}`}>
              <Lock className={`h-3/4 cursor-default ${!sortCol ? 'w-full' : 'w-0'}`} />
              <ArrowDownAz className={`h-3/4 transition-all duration-1000 ${sortCol && sortType === 'asc' ? 'w-full' : 'w-0'}`} />
              <ArrowUpZa className={`h-3/4 transition-all duration-1000 ${sortCol && sortType === 'desc' ? 'w-full' : 'w-0'}`} />
            </div>
          </div>
        </div>
      </div>
      <OptionalScrollArea scrollEnabled={useScrollArea} className='max-h-[90vh] m-2 pr-2'>
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
                <tr><td colSpan={100} className='text-center py-8 text-muted-foreground'>No Data Found</td></tr> :
                shallowSort(data.filter(search)).map(mediaInfo => (
                  <TableRow
                    mediaInfo={mediaInfo}
                    keys={columns}
                    details={details}
                    key={mediaInfo.imdbId}
                    linkPrefix={linkPrefix}
                  />))
              }
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <Accordion type='multiple' className='block sm:hidden'>
          {shallowSort(data.filter(search)).map(mediaInfo => {
            return (
              <AccordionItem value={mediaInfo.imdbId} key={mediaInfo.imdbId}>
                <AccordionTrigger className='hover:no-underline px-2 flex gap-2'>
                  <div className='flex flex-col gap-2 w-full'>
                    <Link className='w-fit m-auto' href={`${linkPrefix}/${mediaInfo.imdbId}`}>
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
                  <img src={mediaInfo.poster || undefined} />
                  {details.map(key => (
                    <div className='grid grid-cols-4' key={`${mediaInfo.imdbId}-${key}`}>
                      <span className='col-span-1 text-center m-auto text-muted-foreground'>{fromCamelCase(key)}:</span>
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
      </OptionalScrollArea>
    </div>
  )
}
