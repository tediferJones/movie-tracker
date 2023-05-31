'use client';
import easyFetch from '@/modules/easyFetch';

export default function updateCachedMovie(props: any) {
  async function update() {
    const res = await easyFetch('/api/movies', 'PUT', { imdbID: props.imdbID })
    // If the request was successful, refresh the page, else do nothing or show some error message
    const { movieHasBeenUpdated } = await res.json();
    if (movieHasBeenUpdated) {
      window.location.reload();
    }
  }

  return (
    <div>
      <button className='p-4 bg-gray-200'
        onClick={update}
      >Update Results (if its cached)</button>
    </div>
  )
}
