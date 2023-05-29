export default function Home() {
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
  //        watched?(bool), 
  //        myRating(0-5 bags of popcorn, ),
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Change some attributes in prismaSchema and Types file to int, why? because you cant sort by runtime if runtime is a string
  //        - i.e. how do you sort ['128 mins', '240 mins', '90 mins' ], its much easier to sort [128, 90, 240]
  //        - Fields to change: Runtime, Year, imdbVotes maybe, maybe the date (store it as UNIX time so its just an int)
  //    - move the function that adds movies to the db automatically from /movies/[id], to an api/movies/ route, its more restful
  //      - You would need to write a client component to do this, cant fetch on the server
  //    - Consider making an easyFetch function so we can just pass this function the method and body, it returns the fetch options
  //    - Rewrite addToMyList component to return one big button with a bunch of nested ternary statements
  //
  
  return (
    <div>
      <h1>THIS IS THE HOME PAGE</h1>
    </div>
  )
}
