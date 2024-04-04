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
import { useState } from 'react';

type SortType = 'asc' | 'desc' | '';

export default function MyTable({ data }: { data: ExistingMediaInfo[] }) {
  const columns = ['title', 'rated', 'startYear', 'runtime', 'imdbRating', 'metaRating', 'tomatoRating', ''];
  const details = ['genre', 'actor', 'writer', 'director', 'country', 'language'];

  const [sortType, setSortType] = useState<SortType>('');
  const [sortCol, setSortCol] = useState('');
  const [searchCol, setSearchCol] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');

  function search(mediaInfo: ExistingMediaInfo) {
    if (!mediaInfo[searchCol]) return false;
    if (typeof(mediaInfo[searchCol]) === 'string') {
      return mediaInfo[searchCol].toLowerCase().includes(searchTerm.toLowerCase()) 
    }
    return mediaInfo[searchCol].some((str: string) => str.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const sortSetter: { [key in SortType]: { next: SortType, class: string } } = {
    '': { next: 'asc', class: '' },
    'asc': { next: 'desc', class: 'bg-secondary' },
    'desc': { next: '', class: 'bg-neutral-800' }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-4'>
        <Input placeholder='Search table' 
          onChange={e => setSearchTerm(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>{fromCamelCase(searchCol)}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 max-h-[60vh] overflow-auto'>
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={searchCol} onValueChange={setSearchCol}>
              {['title', 'rated'].concat(details).filter(str => str).map(key => {
                return <DropdownMenuRadioItem key={key} value={key}>{fromCamelCase(key)}</DropdownMenuRadioItem>
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='showOutline overflow-hidden'>
        <table className='w-full table-auto'>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={`colHeader-${col}`}
                  className={`text-muted-foreground p-2 ${sortCol === col ? sortSetter[sortType].class : ''}`}
                >
                  <button onClick={() => {
                    console.log(sortCol, sortType)
                    if (col !== sortCol) {
                      setSortCol(col)
                      setSortType('asc')
                    } else {
                      setSortType(sortSetter[sortType].next)
                    }
                  }}>{fromCamelCase(col)}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? <div>No Data</div> :
              data.filter(mediaInfo => searchTerm ? search(mediaInfo) : true)
              .map(mediaInfo => <TableRow
                mediaInfo={mediaInfo}
                keys={columns}
                details={details}
                key={mediaInfo.imdbId}
              />)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
