import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromCamelCase } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import TableRow from '@/components/myTable/tableRow';
import { ReactNode, useState } from 'react';

type SortType = 'asc' | 'desc';

export default function MyTable({ data, children }: { data: ExistingMediaInfo[], children?: ReactNode }) {
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

  type SortFuncs = {
    [key in 'string' | 'number']: {
      [key in SortType]: (a: ExistingMediaInfo, b: ExistingMediaInfo) => number
    }
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
      <div className='showOutline overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={`colHeader-${col}`}
                  className={`text-muted-foreground p-2 ${col === '' ? '' : sortCol !== col ? '' : sortType === 'asc' ? 'bg-secondary' : 'bg-neutral-800'}`}
                >
                  <button onClick={() => {
                    console.log(sortCol, sortType)
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
    </div>
  )
}
