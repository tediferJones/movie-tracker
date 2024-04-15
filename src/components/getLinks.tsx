import { keyToLink } from '@/lib/formatters'
import Link from 'next/link'

export default function GetLinks({ type, arr }: { type: string, arr?: string[] }) {
  return !arr || arr.length === 0 ? <span>N/A</span> : arr.map((str, i) => {
    const revIndex = arr.length - 1 - i;
    return (
      <span key={`${type}-${str}`}>
        <Link href={`/${keyToLink[type]}/${str}`}>
          {str}
        </Link>
        <span>
          {revIndex === 1 ? ' and ' : revIndex === 0 ? '' : ', '}
        </span>
      </span>
    )
  })
}
