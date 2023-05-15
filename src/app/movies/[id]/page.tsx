export default async function Movie({ params }: { params: any }) {
  // Search for param ID in DB before fetching from omdbapi
  const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`)
  const data = await res.json();
  // Split these strings into arrays of individual names
  ['Actors', 'Writer', 'Director', 'Genre'].forEach((key: any) => data[key] = data[key].split(', '))
  console.log(data);
  delete data.Metascore;
  delete data.imdbRating;
  delete data.imdbVotes;
  data.Ratings.forEach((ratingObj: any) => {
    if (ratingObj.Source === 'Internet Movie Database') { ratingObj.Source = 'IMDB' }
    data[`${ratingObj.Source} Rating`] = ratingObj.Value
  })
  delete data.Ratings;
  // How do we want to handle Ratings?
  //    - We can delete the originals (if they exist) and then iterate over ratings array of objs
  //    - Or you can just deal with not having rotten tomato scores

  // you should probably add a custom field for 'cachedResult' with a value of the current date

  // const data = fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`).then((res: any) => res.json())
  
  // This is where we add the movie to our account's list
  //    - Check the DB movie list, if it already exists, just link to that ID or whatever
  //    - If it doesn't exist, add it to our db movie list
  //
  // ADD AN UPDATE BUTTON, when pressed it will fetch a new copy of the movie
  // With the above in mind, we should probably have an indicator on each page to show if the data being shown is from the DB, or omdbAPI
  // const extractRatings = 0;
  // const ratingsArr = data.Ratings;
  // ratingsArr.forEach((rating: any) => {
  //   // Object.keys(rating).forEach((key: any) => data[key] = rating[key])
  //   data[rating.Source] = rating.Value;
  // })

  return (
    <div>
      <h1>Individual movie really this time</h1>
      <div>{JSON.stringify(data)}</div>
      {Object.keys(data).map((key: any) => {
        return (
          <div>
            {`${key}: ${data[key]}`}
          </div>
        )
      })
      }
      <button className='p-4 bg-gray-200'>Add to my list</button>
      <button className='p-4 bg-gray-200'>Update Results (if its cached)</button>
    </div>
  )
}
