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
// import OptionalScrollArea from '@/components/subcomponents/optionalScrollArea';
import TableView from '@/components/table/tableView';
import ListView from '@/components/table/listView';
import SliderView from '@/components/table/sliderView';
import SortAndFilter from '@/components/subcomponents/SortAndFilter';
import { fromCamelCase } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

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
  const [sortedAndFiltered, setSortedAndFiltered] = useState(data);
  // const [loadingText, setLoadingText] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 25;

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

  // useEffect(() => {
  //   setLoadingText(`Searching ${fromCamelCase(searchCol)} for "${searchTerm}"`)
  //   setSortedAndFiltered(shallowSort(data));
  //   setLoadingText('');
  // }, [searchTerm, searchCol]);

  // useEffect(() => {
  //   setLoadingText(`Sorting ${fromCamelCase(sortCol)} in ${fullSortType[sortType]} order`)
  //   setSortedAndFiltered(shallowSort(data));
  //   setLoadingText('');
  // }, [sortType, sortCol]);

  // function search(mediaInfo: ExistingMediaInfo) {
  //   if (!searchTerm) return true;
  //   if (!mediaInfo[searchCol]) return false;
  //   if (typeof(mediaInfo[searchCol]) === 'string') {
  //     return mediaInfo[searchCol].toLowerCase().includes(searchTerm.toLowerCase());
  //   }
  //   return mediaInfo[searchCol].some((str: string) => str.toLowerCase().includes(searchTerm.toLowerCase()));
  // }

  // function shallowSort(arr: ExistingMediaInfo[]): ExistingMediaInfo[] {
  //   const cacheStr = `${searchCol},${searchTerm}`;
  //   if (!searchCache[cacheStr]) {
  //     searchCache[cacheStr] = arr.filter(search);
  //   }
  //   const filtered = searchCache[cacheStr];
  //   if (!sortCol) return filtered;

  //   const sortFunc: SortFuncs = {
  //     string: {
  //       asc: (a, b) => {
  //         if (!a[sortCol]) return -1;
  //         if (!b[sortCol]) return 1;
  //         return a[sortCol].toLowerCase()?.localeCompare(b[sortCol].toLowerCase());
  //       },
  //       desc: (a, b) => {
  //         if (!b[sortCol]) return -1;
  //         if (!a[sortCol]) return 1;
  //         return b[sortCol].toLowerCase()?.localeCompare(a[sortCol].toLowerCase());
  //       }
  //     },
  //     number: {
  //       asc: (a, b) => a[sortCol] - b[sortCol],
  //       desc: (a, b) => b[sortCol] - a[sortCol],
  //     }
  //   }

  //   const dataType = ['title', 'rated'].includes(sortCol) ? 'string' : 'number';
  //   return [...filtered].sort(sortFunc[dataType][sortType]);
  // }

  const tableData = {
    sorted: sortedAndFiltered.slice(0, page * pageSize),
    totalLength: sortedAndFiltered.length,
    linkPrefix,
    setPage,
  }

  const metadata = useRef(
    data.reduce((metadata, item) => {
      if (!metadata.ratingOpts.has(item.rated)) {
        metadata.ratingOpts.add(item.rated);
      }
      if (item.runtime && item.runtime > metadata.maxRuntime) {
        metadata.maxRuntime = item.runtime;
      }
      return metadata
    }, {
        ratingOpts: new Set(),
        maxRuntime: 0,
      } as {
        ratingOpts: Set<string | null>
        maxRuntime: number,
      })
  )

  // useEffect(() => {
  //   console.log('checking for excluded')
  //   const subset = new Set(sortedAndFiltered.map(item => item.imdbId));
  //   data.forEach(item => {
  //     if (!subset.has(item.imdbId)) console.log(item);
  //   });
  // }, [sortedAndFiltered]);

  // these are pretty generic, might be worth trying to stuff them into SortAndFilter
  // make sort func optional, if provided use it, otherwise determine type and use one of these generic functions
  function sortChars(a: string | null, b: string | null) {
    return (a || '').toLowerCase().localeCompare((b || '').toLowerCase());
  }

  function sortNums(a: number | null, b: number | null) {
    return (a || 0) - (b || 0);
  }

  // <OptionalScrollArea className='max-h-[90vh] m-2 pr-2'
  //   orientation='vertical'
  //   scrollEnabled={useScrollArea}
  //   // FIX ME
  //   key={sortedAndFiltered.map(item => item.imdbId).join(',')}
  // >
  //   {{
  //     table: <TableView {...tableData} /*sortCol={sortCol}*/ />,
  //     list: <ListView {...tableData} />,
  //     slider: <SliderView {...tableData} />,
  //   }[viewType]}
  // </OptionalScrollArea>

  return (
    <div className={`flex flex-col ${useScrollArea ? '' : 'gap-4'}`} ref={ref}>
      {sortedAndFiltered && 
        <div className={`${useScrollArea ? 'pb-4' : ''}`}>
          <SortAndFilter<ExistingMediaInfo>
            allData={data}
            searchable={[
              'title',
              'director',
              'writer',
              'actor',
              'genre',
              'country',
              'language',
            ]}
            sortable={{
              updatedAt: sortNums,
              title: sortChars, 
              rated: sortChars,
              startYear: sortNums,
              runtime: sortNums,
              imdbRating: sortNums,
              metaRating: sortNums,
              tomatoRating: sortNums,
            }}
            filterable={{
              rated: {
                values: [ ...metadata.current.ratingOpts ],
                names: [ ...metadata.current.ratingOpts ] as string[],
                // FIX ME
                // This was probably like this for a reason,
                // but I cannot tell what reason that is
                // names: [ ...metadata.current.ratingOpts ].with(
                //   [ ...metadata.current.ratingOpts ].indexOf(null),
                //   'N/A'
                // ) as string[],
              }
            }}
            rangeable={{
              runtime: { min: 0, max: metadata.current.maxRuntime },
              imdbRating: { min: 0, max: 100, step: 0.1, factor: 10 },
              metaRating: { min: 0, max: 100 },
              tomatoRating: { min: 0, max: 100 },
            }}
            subsetState={[sortedAndFiltered, setSortedAndFiltered as any]}
            prefix={
              <>
                {children}
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
              </>
            }
            keyPrefix={`mediaTable`}
            randomizer
          />
        </div>
      }
      {/*
      <div className={`flex justify-center gap-4 flex-wrap ${useScrollArea ? 'p-2' : ''}`}>
        {children}
        <FancyInput className='flex-1 min-w-48 w-fit'
          inputState={[searchTerm, setSearchTerm]}
          delay={250}
          inputProps={{
            placeholder: `Search by ${searchCol}`
          }}
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
      */}
      <div className='overflow-auto max-h-[90vh] pr-2'>
        {{
          table: <TableView {...tableData} /*sortCol={sortCol}*/ />,
          list: <ListView {...tableData} />,
          slider: <SliderView {...tableData} />,
        }[viewType]}
      </div>
    </div>
  )
}
