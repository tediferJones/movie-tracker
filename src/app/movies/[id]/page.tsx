export default async function Movie({ params }: { params: any }) {
  // Search for param ID in DB before fetching from omdbapi
  const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`)
  const data = await res.json();
  // const data = fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`).then((res: any) => res.json())
  
  // This is where we add the movie to our account's list
  //    - Check the DB movie list, if it already exists, just link to that ID or whatever
  //    - If it doesn't exist, add it to our db movie list
  //
  // ADD AN UPDATE BUTTON, when pressed it will fetch a new copy of the movie
  // With the above in mind, we should probably have an indicator on each page to show if the data being shown is from the DB, or omdbAPI

  return (
    <div>
      <h1>Individual movie really this time</h1>
      <div>{JSON.stringify(data)}</div>
      <button className='p-4 bg-gray-200'>Add to my list</button>
      <button className='p-4 bg-gray-200'>Update Results (if its cached)</button>
    </div>
  )
}
