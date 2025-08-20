import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

import { Fragment } from 'react';

type Breadcrumb = { name: string, link: string }

export default function GetBreadcrumbs({ crumbs }: { crumbs: Breadcrumb[] }) {
  return (
    <Breadcrumb className='px-2'>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          return (
            <Fragment key={`${crumb.name}-${crumb.link}-${i}`}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={crumb.link}>{crumb.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {i < crumbs.length - 1 ? <BreadcrumbSeparator /> : []}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
