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

import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowDownAz,  ArrowUpZa, Lock } from 'lucide-react';
import FancyInput from '@/components/subcomponents/fancyInput';
import OptionalScrollArea from '@/components/subcomponents/optionalScrollArea';
import TableView from '@/components/table/tableView';
import ListView from '@/components/table/listView';
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
type ScreenTypes = 'desktop' | 'mobile'

export const columns = ['title', 'rated', 'startYear', 'runtime', 'imdbRating', 'metaRating', 'tomatoRating', ''];
export const details = ['director', 'writer', 'actor', 'genre', 'country', 'language'];
const views = ['table', 'list', 'slider'] as const;

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
  const searchCache: Record<string, ExistingMediaInfo[]> = {};

  const [sortType, setSortType] = useState<SortType>('asc');
  const [sortCol, setSortCol] = useState('');
  const [searchCol, setSearchCol] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedAndFiltered, setSortedAndFiltered] = useState(data);
  const [loadingText, setLoadingText] = useState('');
  const fullSortType: Record<SortType, string> = {
    asc: 'ascending',
    desc: 'descending',
  }

  const [viewType, setViewType] = useState<ViewTypes>('table');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const defaultView: Record<ScreenTypes, ViewTypes> = {
      desktop: 'table',
      mobile: 'list',
    }

    const screenType = getScreenType();
    if (!screenType) return;
    const key = `${screenType}View`;
    const savedView = localStorage.getItem(key) as ViewTypes | null;
    if (!savedView) {
      localStorage.setItem(key, defaultView[screenType]);
      setViewType(defaultView[screenType]);
    } else {
      setViewType(savedView);
    }
  }, [ref.current]);

  function getScreenType() {
    if (!ref.current) return;
    return ref.current.clientWidth > 650 ? 'desktop' : 'mobile';
  }

  useEffect(() => {
    setLoadingText(`Searching ${fromCamelCase(searchCol)} for "${searchTerm}"`)
    setSortedAndFiltered(shallowSort(data));
    setLoadingText('');
  }, [searchTerm, searchCol]);

  useEffect(() => {
    setLoadingText(`Sorting ${fromCamelCase(sortCol)} in ${fullSortType[sortType]} order`)
    setSortedAndFiltered(shallowSort(data));
    setLoadingText('');
  }, [sortType, sortCol]);

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
        <FancyInput className='flex-1 min-w-48 w-fit'
          inputState={[searchTerm, setSearchTerm]}
          delay={250}
          inputProps={{
            placeholder: `Search by ${searchCol}`
          }}
        />
        {/*
        <Input placeholder={`Search by ${searchCol}`} 
          onChange={e => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              setSearchTerm(e.target.value);
            }, 250);
          }}
          className='flex-1 min-w-48'
        />
        */}
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
              {['title', 'rated'].concat(details).filter(str => str).map(key => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {fromCamelCase(key)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='sm:w-auto w-full'>{`View: ${fromCamelCase(viewType)}`}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select View</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={viewType} onValueChange={(val) => {
              if ((views as readonly string[]).includes(val)) {
                const key = `${getScreenType()}View`
                localStorage.setItem(key, val)
                setViewType(val as ViewTypes)
              }
            }}>
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
          <div className={`relative my-auto bg-secondary rounded-full h-8 min-w-16 max-w-16 transition-all duration-1000 ${sortCol ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (!sortCol) return;
              setSortType(sortType === 'asc' ? 'desc': 'asc');
            }}
          >
            <div className={`absolute flex items-center justify-center bg-primary h-full aspect-square rounded-full transition-all duration-1000 ${!sortCol ? 'left-4 right-4 opacity-50 cursor-none' : sortType === 'asc' ? 'left-0 right-8' : 'left-8 right-0'}`}>
              <Lock className={`h-3/4 cursor-default ${!sortCol ? 'w-full' : 'w-0'}`} />
              <ArrowDownAz className={`h-3/4 transition-all duration-1000 ${sortCol && sortType === 'asc' ? 'w-full' : 'w-0'}`} />
              <ArrowUpZa className={`h-3/4 transition-all duration-1000 ${sortCol && sortType === 'desc' ? 'w-full' : 'w-0'}`} />
            </div>
          </div>
        </div>
        <div className='my-auto text-nowrap text-muted-foreground'>{sortedAndFiltered.length} / {data.length}</div>
      </div>
      <OptionalScrollArea className='max-h-[90vh] m-2 pr-2'
        orientation='vertical'
        scrollEnabled={useScrollArea}
      >
        {loadingText ? <div className='text-center h-full'>{loadingText}</div> : {
          table: <TableView {...tableData} sortCol={sortCol} />,
          list: <ListView {...tableData} />,
          slider: <SliderView {...tableData} />,
        }[viewType]}
      </OptionalScrollArea>
    </div>
  )
}
