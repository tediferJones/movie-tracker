'use client';
import easyFetch from '@/modules/easyFetch';

export default function ManageMovieInfo({ imdbID }: { imdbID: string }) {
  async function update() {
    const { movieHasBeenUpdated } = await easyFetch('/api/media', 'PUT', { imdbID: imdbID });

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
