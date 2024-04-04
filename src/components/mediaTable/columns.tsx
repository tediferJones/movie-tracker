import { ColumnDef } from '@tanstack/react-table';
import GetColumnHeader from '@/components/mediaTable/getColumnHeader';
import { formatRating, formatRuntime } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import Link from 'next/link';

export const columns: ColumnDef<ExistingMediaInfo>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <GetColumnHeader column={column} />,
    cell: ({ row }) => <Link
      className='hover:underline'
      href={`/media/${row.original.imdbId}`}
    >{row.getValue('title')}</Link>
  },
  {
    accessorKey: 'rated',
    header: ({ column }) => <GetColumnHeader column={column} />,
    cell: ({ row }) => <span>{row.getValue('rated') || 'N/A'}</span>
  },
  {
    accessorKey: 'startYear',
    header: ({ column }) => <GetColumnHeader column={column} />,
  },
  {
    accessorKey: 'runtime',
    header: ({ column }) => <GetColumnHeader column={column} />,
    cell: ({ row }) => <div>{formatRuntime(row.getValue('runtime'))}</div>,
  },
  {
    accessorKey: 'imdbRating',
    header: ({ column }) => <GetColumnHeader column={column} />,
    cell: ({ row }) => formatRating['imdbRating'](row.getValue('imdbRating')),
  },
  {
    accessorKey: 'metaRating',
    header: ({ column }) => <GetColumnHeader column={column} />,
    cell: ({ row }) => formatRating['metaRating'](row.getValue('metaRating')),
  },
  {
    accessorKey: 'tomatoRating',
    header: ({ column }) => <GetColumnHeader column={column} />,
    cell: ({ row }) => formatRating['tomatoRating'](row.getValue('tomatoRating')),
  },
  {
    accessorKey: 'genre',
    header: 'Genre',
    cell: ({ row }) => <div className='flex flex-col'>
      {row.original.genre.map(genre => 
        <span key={`${row.original.imdbId}-${genre}`}>
          <Link
            href={`/genres/${genre}`}
            className='hover:underline'
          >{genre}</Link>, </span>
      )}
    </div>,
    filterFn: (row, colId, searchTerm: string) => row.original[colId].some(
      (genre: string) => genre.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  },
  {
    accessorKey: 'actor',
    header: 'Actors',
    cell: ({ row }) => <div className='flex flex-col'>
      {row.original.actor.map(actor => <Link 
        className='hover:underline'
        key={`${row.original.imdbId}-actor-${actor}`}
        href={`/people/${actor}`}
      >{actor}</Link>)}
    </div>,
  }
]
