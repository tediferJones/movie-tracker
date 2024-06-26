import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import { Fragment } from 'react';
import { fromCamelCase } from '@/lib/formatters';

export default function GetBreadcrumbs({ links }: { links: { [key: string]: string } }) {
  const keys = Object.keys(links)
  const ignoreCase: RegExp[] = [
    /\/users\/.+/,
    /\/media\/.+/,
  ]

  return (
    <Breadcrumb className='px-2'>
      <BreadcrumbList>
        {keys.map((key, i) => {
          return (
            <Fragment key={`${key}-${links[key]}`}>
              <BreadcrumbItem>
                <BreadcrumbLink href={links[key]}>
                  {ignoreCase.some(regex => links[key].match(regex)) ? key : fromCamelCase(key)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {i < keys.length - 1 ? <BreadcrumbSeparator /> : []}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
