import { currentUser } from '@clerk/nextjs';

export default async function Home() {
  // USE OMDBAPI: https://www.omdbapi.com/
  // apikey=8e1df54b
  // Format: http://www.omdbapi.com/?apikey=8e1df54b&<ENTER SEARCH PARAMS HERE>
  // Search Terms:
  //    TITLE/ID LOOK-UP
  //      i=IMDB-ID             Request by specific IMDB-ID, which would probably be pulled from some other request
  //      t=SOMETHING           Request specific title
  //      y=YEAR                Additional param
  //    SEARCHING
  //      s=SOMETHING           Request search of term (returns multiple, use this for searchbar)
  //      y=YEAR                Additional param

  // How to delay fetch until user is done typing: 
  // https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing

  // This would be a good place to have filters for movies in the list attached to "this" account
  //   For Example: 
  //      - Show recent movies added to my list
  //      - Pick a random movie for me
  //      - Show movies with rating above 6.0 and length less than 120 mins


  // The master TO-DO list
  //
  // Feature additions:
  //    - add more fields to the lists table? like 
  //        watched?      (bool) 
  //        myRating      (0-5 bags of popcorn)
  //        watchAgain?   (bool)
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Change some attributes for movies in prismaSchema and Types file to int, 
  //      why? because you cant sort by runtime if runtime is a string
  //      - i.e. how do you sort ['128 mins', '240 mins', '90 mins' ], its much easier to sort [128, 90, 240]
  //      - Fields to change: Year, Runtime, imdbVotes, 
  //        - maybe the date (store it as UNIX time so its just an int)
  //      - Consider also making certain fields unique, like title
  //    - Update prisma schema fields to make appropiate fields unique
  //      - Is this even possible? both the username and imdbID will be repeated
  //      - Maybe consider a different table structure, this one seems repetitive
  //    - Add a Display UserList component,
  //      - Put that here (on the home page), and in /lists/[username]
  //    - Look over API routes, especially /api/movies, 
  //      make sure it is impossible to add anything that isnt from omdbAPI
  //      - I.e. what happens if we go to /movies/NotAnImdbID
  //      - and if there is a problem in the api route, send back a meaningful error message
  //      - What happens if the omdb reponse fails?  Make sure that data isnt pushed to the DB
  //    - Move apikey into .env file, that info should probably be private 
  //      - Keep in mind, right now it is posted to github
  //

  const user = await currentUser();
  
  return (
    <div>
      <h1>THIS IS THE HOME PAGE</h1>
      <div className='text-xl'>Hello, {user?.username}</div>
      <h1>User: {JSON.stringify(user)}</h1>
    </div>
  )
}
