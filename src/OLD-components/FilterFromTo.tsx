'use client';

export default function FilterFromTo({ 
  mediaKey,
  filters,
  setFilters,
  initialFilters,
}: { 
  mediaKey: string ,
  filters: any,
  setFilters: Function,
  initialFilters: any,
}) {
  let factor = 1;
  if (mediaKey === 'IMDBRating') {
    factor = 10;
  }

  const specialCases: { [key: string]: string } = { 
    IMDBRating: 'IMDB Rating', 
    RottenTomatoesRating: 'Rotten Tomatoes Rating',
    MetacriticRating: 'Metacritic Rating'
  }

  return (
    <div className='text-white'>
      {/*
      <h1>FILTER FROM TO</h1>
      */}
      <div>Filter {Object.keys(specialCases).includes(mediaKey) ? specialCases[mediaKey] : mediaKey}</div>
      {/* MINIMUM INPUT */}
      <label htmlFor={'min' + mediaKey}>From</label>
      <input className='text-black mx-2' 
        id={'min' + mediaKey}
        type='number' 
        step={1 / factor} 
        min={initialFilters['min' + mediaKey] / factor} 
        max={filters['max' + mediaKey] / factor} 
        value={(filters['min' + mediaKey] / factor).toFixed(mediaKey === 'IMDBRating' ? 1 : 0)} 
        onChange={(e) => setFilters({ ...filters, ['min' + mediaKey]: Number(e.target.value) * factor })}
      />
      {/* MAXIMUM INPUT */}
      <label htmlFor={'max' + mediaKey}>to</label>
      <input className='text-black mx-2' 
        id={'max' + mediaKey}
        type='number' 
        step={1 / factor} 
        min={filters['min' + mediaKey] / factor} 
        max={initialFilters['max' + mediaKey]/ factor} 
        value={(filters['max' + mediaKey] / factor).toFixed(mediaKey === 'IMDBRating' ? 1 : 0)}
        onChange={(e) => setFilters({ ...filters, ['max' + mediaKey]: Number(e.target.value) * factor})}
      />
    </div>
  )
}

// <div className='text-white'>IMDBRating Filter</div>
// <input type='number' step={0.1} min={getMinValue('IMDBRating') / 10} max={filters.maxIMDBRating / 10} value={(filters.minIMDBRating / 10).toFixed(1)} onChange={(e) => setFilters({ ...filters, minIMDBRating: Number(e.target.value) * 10 })}/>
// <input type='number' step={0.1} min={filters.minIMDBRating / 10} max={getMaxValue('IMDBRating') / 10} value={(filters.maxIMDBRating / 10).toFixed(1)} onChange={(e) => setFilters({ ...filters, maxIMDBRating: Number(e.target.value) * 10 })}/>

// <div className='text-white'>Runtime Filter</div>
// <input type='number' step={1} min={getMinValue('Runtime')} max={filters.maxRuntime} value={filters.minRuntime} onChange={(e) => setFilters({ ...filters, minRuntime: Number(e.target.value) })}/>
// <input type='number' step={1} min={filters.minRuntime} max={getMaxValue('Runtime')} value={filters.maxRuntime} onChange={(e) => setFilters({ ...filters, maxRuntime: Number(e.target.value) })}/>

// <div className='text-white'>Year Filter:</div>
// <input type='number' step={1} min={Math.min(...media.map(item => item.Year))} max={filters.maxYear} value={filters.minYear} onChange={(e) => setFilters({ ...filters, minYear: Number(e.target.value) })}/>
// <input type='number' step={1} min={filters.minYear} max={Math.max(...media.map(item => item.Year))} value={filters.maxYear} onChange={(e) => setFilters({ ...filters, maxYear: Number(e.target.value) })}/>
