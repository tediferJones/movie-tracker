'use client';
import easyFetch from '@/modules/easyFetch';

export default function ManageMovieInfo({ imdbID }: { imdbID: string }) {
  async function update() {
    const res = await easyFetch('/api/media', 'PUT', { imdbID: imdbID })
    // If the request was successful, refresh the page, else do nothing or show some error message
    const { movieHasBeenUpdated } = await res.json();
    if (movieHasBeenUpdated) {
      window.location.reload();
    }
  }

  return (
    <button className='p-4 bg-blue-400'
      onClick={update}
    >Update Info</button>
  )
}
