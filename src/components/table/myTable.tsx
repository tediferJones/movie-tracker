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
import TableView from '@/components/table/tableView';
import ListView from '@/components/table/listView';
import SliderView from '@/components/table/sliderView';
import SortAndFilter from '@/components/subcomponents/SortAndFilter';
import { fromCamelCase } from '@/lib/formatters';
import { ExistingMediaInfo, MediaStringArrKeys } from '@/types';

export type ColumnType = typeof columns
type ViewTypes = typeof views[number]
type ScreenTypes = 'desktop' | 'mobile'

export const columns: (keyof ExistingMediaInfo | '')[] = [
  'title',
  'rated',
  'startYear',
  'runtime',
  'imdbRating',
  'metaRating',
  'tomatoRating',
  ''
] as const;
export const details: MediaStringArrKeys = [
  'director',
  'writer',
  'actor',
  'genre',
  'country',
  'language'
];
const views = ['table', 'list', 'slider'] as const;

export default function MyTable(
  {
    data,
    children,
    linkPrefix,
    useScrollArea,
    listItem,
  }: {
    data: ExistingMediaInfo[],
    children?: ReactNode,
    linkPrefix: string,
    useScrollArea?: boolean,
    listItem?: boolean,
  }
) {
  const [sortedAndFiltered, setSortedAndFiltered] = useState(data);

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

  // these are pretty generic, might be worth trying to stuff them into SortAndFilter
  // make sort func optional, if provided use it, otherwise determine type and use one of these generic functions
  function sortChars(a: string | null, b: string | null) {
    return (a || '').toLowerCase().localeCompare((b || '').toLowerCase());
  }

  function sortNums(a: number | null, b: number | null) {
    return (a || 0) - (b || 0);
  }

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
              ...(listItem ? { dateAdded: sortNums } : {}),
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
      <div className='overflow-auto max-h-[90vh] pr-2'>
        {{
          table: <TableView {...tableData} />,
          list: <ListView {...tableData} />,
          slider: <SliderView {...tableData} />,
        }[viewType]}
      </div>
    </div>
  )
}
