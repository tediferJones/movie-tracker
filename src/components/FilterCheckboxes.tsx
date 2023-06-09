'use client';

export default function FilterCheckboxes({ 
    selectors, 
    mediaKey,
    filters, 
    setFilters,
  }: { 
    selectors: (string | null)[], 
    mediaKey: string,
    filters: any, 
    setFilters: Function,
  }) {
  console.log('FILTER CHECK BOXES', selectors)

  return (
    <div className='text-white w-full flex gap-4 justify-center'>
      <h1>Filter by {mediaKey}</h1>
      {selectors.map((selector: string | null) => {
        return (
          <div key={selector}>
            <input id={selector ? selector : 'N/A'} 
              name={selector ? selector : 'N/A'} 
              type='checkbox' 
              // defaultChecked={true} 
              checked={filters[mediaKey].includes(selector)} 
              onChange={(e) => {
                if (e.target.checked) {
                  setFilters({ ...filters, [mediaKey]: filters[mediaKey].concat(selector) })
                } else {
                  setFilters({
                    ...filters,
                    [mediaKey]: filters[mediaKey].filter((existingSelectors: string) => existingSelectors !== selector),
                  })
                }
              }}
            />
            <label htmlFor={selector ? selector : 'N/A'}>{selector ? selector : 'N/A'}</label>
          </div>
        )
      })}
    </div>
  )
}
