'use client';

export default function updateCachedMovie(props: any) {
  async function update() {
    // This should use PUT not POST
    const res = await fetch('/api/movies', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imdbID: props.imdbID })
    })
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
