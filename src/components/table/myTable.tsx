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

import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowDownAz,  ArrowUpZa, Lock } from 'lucide-react';
import OptionalScrollArea from '@/components/subcomponents/optionalScrollArea';
import DesktopView from '@/components/table/desktopView';
import MobileView from '@/components/table/mobileView';
import SliderView from '@/components/table/sliderView';
import { fromCamelCase } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

type SortType = 'asc' | 'desc';
type SortFuncs = {
  [key in 'string' | 'number']: {
    [key in SortType]: (a: ExistingMediaInfo, b: ExistingMediaInfo) => number
  }
}
export type ColumnType = typeof columns[number]
type ViewTypes = typeof views[number]

export const columns = ['title', 'rated', 'startYear', 'runtime', 'imdbRating', 'metaRating', 'tomatoRating', ''];
export const details = ['director', 'writer', 'actor', 'genre', 'country', 'language'];
const views = ['desktop', 'mobile', 'slider']

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
  const searchCache: Record<string, ExistingMediaInfo[]> = {};
  let searchTimeout: NodeJS.Timeout;

  const [sortType, setSortType] = useState<SortType>('asc');
  const [sortCol, setSortCol] = useState('');
  const [searchCol, setSearchCol] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedAndFiltered, setSortedAndFiltered] = useState(data);

  const [viewType, setViewType] = useState<ViewTypes>('desktop');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const isDesktop = ref.current.clientWidth > 650;
    setViewType(isDesktop ? 'desktop' : 'mobile');
  }, [ref.current]);

  useEffect(() => {
    setSortedAndFiltered(shallowSort(data));
  }, [searchTerm, searchCol, sortType, sortCol]);

  function search(mediaInfo: ExistingMediaInfo) {
    if (!searchTerm) return true;
    if (!mediaInfo[searchCol]) return false;
    if (typeof(mediaInfo[searchCol]) === 'string') {
      return mediaInfo[searchCol].toLowerCase().includes(searchTerm.toLowerCase());
    }
    return mediaInfo[searchCol].some((str: string) => str.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  function shallowSort(arr: ExistingMediaInfo[]): ExistingMediaInfo[] {
    const cacheStr = `${searchCol},${searchTerm}`;
    if (!searchCache[cacheStr]) {
      searchCache[cacheStr] = arr.filter(search);
    }
    const filtered = searchCache[cacheStr];
    if (!sortCol) return filtered;

    const sortFunc: SortFuncs = {
      string: {
        asc: (a, b) => {
          if (!a[sortCol]) return -1;
          if (!b[sortCol]) return 1;
          return a[sortCol].toLowerCase()?.localeCompare(b[sortCol].toLowerCase());
        },
        desc: (a, b) => {
          if (!b[sortCol]) return -1;
          if (!a[sortCol]) return 1;
          return b[sortCol].toLowerCase()?.localeCompare(a[sortCol].toLowerCase());
        }
      },
      number: {
        asc: (a, b) => a[sortCol] - b[sortCol],
        desc: (a, b) => b[sortCol] - a[sortCol],
      }
    }

    const dataType = ['title', 'rated'].includes(sortCol) ? 'string' : 'number';
    return [...filtered].sort(sortFunc[dataType][sortType]);
  }

  const tableData = {
    sorted: sortedAndFiltered,
    totalLength: data.length,
    linkPrefix,
  }

  return (
    <div className={`flex flex-col ${useScrollArea ? '' : 'gap-4'}`} ref={ref}>
      <div className={`flex justify-center gap-4 flex-wrap ${useScrollArea ? 'p-2' : ''}`}>
        {children}
        <Input placeholder={`Search by ${searchCol}`} 
          onChange={e => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              setSearchTerm(e.target.value);
            }, 250);
          }}
          className='flex-1 min-w-48'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='sm:w-auto w-full'>
              {`Search By: ${fromCamelCase(searchCol)}`}
            </Button>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>View</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select View</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={viewType} onValueChange={setViewType}>
              {views.map(view => (
                <DropdownMenuRadioItem key={view} value={view}>
                  {fromCamelCase(view)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className='flex gap-4 sm:w-min w-full'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='sm:w-auto w-full'>
                {sortCol ? `Sort By: ${fromCamelCase(sortCol)}` : 'Sort By'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by Column</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortCol} onValueChange={(col) => {
                setSortCol(col !== sortCol ? col : '');
              }}>
                <DropdownMenuRadioItem value={''}>None</DropdownMenuRadioItem>
                {columns.filter(col => col).map(col => (
                  <DropdownMenuRadioItem value={col}>{fromCamelCase(col)}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <OptionalScrollArea className={`${viewType === 'slider' ? '' : 'max-h-[90vh]'} m-2 pr-2`}
        orientation={viewType === 'slider' ? 'horizontal' : 'vertical'}
        scrollEnabled={useScrollArea}
      >
        {{
          desktop: <DesktopView {...tableData} sortCol={sortCol} />,
          mobile: <MobileView {...tableData} />,
          slider: <SliderView {...tableData} />,
        }[viewType]}
      </OptionalScrollArea>
    </div>
  )
}
