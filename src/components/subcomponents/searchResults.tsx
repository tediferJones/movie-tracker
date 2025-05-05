import Link from 'next/link';
import { MouseEvent } from 'react';
import { OmdbSearchResult } from '@/types';

export default function SearchResults(
  {
    results,
    onLinkClick,
  }: {
    results: OmdbSearchResult[]
    onLinkClick?: (e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => void
  }
) {
  return (
    results.length === 0 ? <div className='bg-secondary w-full p-2 text-center'>No Results</div> :
      results.map(item => (
        <Link className='showOutline flex w-full flex-wrap bg-primary-foreground p-2 hover:underline ring-offset-2 ring-offset-background hover:ring-ring hover:ring-2'
          href={`/media/${item.imdbID}`}
          key={item.imdbID}
          onClick={onLinkClick}
        >
          <p className='m-auto flex-[2]'>{item.Title}</p>
          <p className='m-auto flex-1 text-center'>{item.Year}</p>
        </Link>
      ))
  )
}
