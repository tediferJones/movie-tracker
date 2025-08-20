import { Dispatch, SetStateAction } from 'react';
import { ColumnType, columns, details } from '@/components/table/myTable';
import TableRow from '@/components/table/tableRow';
import AutoPaging from '@/components/subcomponents/AutoPaging';
import { fromCamelCase } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

// FIX ME if we dont use sortCol any more then delete it
export default function DesktopView(
  {
    sorted,
    linkPrefix,
    totalLength,
    sortCol,
    setPage,
  }: {
    sorted: ExistingMediaInfo[],
    linkPrefix: string,
    totalLength: number,
    sortCol?: ColumnType[number],
    setPage: Dispatch<SetStateAction<number>>,
  }
) {
  // return Array(500).fill(0).map((_, i) => {
  //   return <div className='h-64 w-64 bg-red-500'>{i}</div>
  // })

  return (
    <div className='showOutline overflow-x-auto w-full'>
      <table className='w-full'>
        <thead>
          <tr>
            {columns.map(col => (
              <th className={`text-muted-foreground p-2 ${col !== '' && sortCol === col ? 'bg-muted' : ''}`}
                key={`colHeader-${col}`}
              >
                {fromCamelCase(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {totalLength === 0 ? <tr>
              <td className='text-center py-8 text-muted-foreground'
                colSpan={100}
              >No Data Found</td>
            </tr>
            : sorted.length === 0 ? <tr>
              <td className='text-center py-8 text-muted-foreground'
                colSpan={100}
              >No Results Found</td>
            </tr>
              : sorted.map(mediaInfo => (
                <TableRow
                  mediaInfo={mediaInfo}
                  keys={columns}
                  details={details}
                  key={mediaInfo.imdbId}
                  linkPrefix={linkPrefix}
                />
              )
              )
          }
        </tbody>
      </table>
      <AutoPaging
        setPage={setPage}
        currentCount={sorted.length}
        maxCount={totalLength}
      />
    </div>
  )
}
