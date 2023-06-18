import { currentUser } from '@clerk/nextjs';
import DisplayLists from '@/components/DisplayLists';
// import prisma from '@/client'

export default async function Home() {
  // USE OMDBAPI: https://www.omdbapi.com/
  // See .env file for omdb API key
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
  //    - move auth from ./layout to individual components
  //      - if done properly, users can still browse/filter the whole DB, and search for movies
  //      - But if they try to do anything related a user (i.e. add/removing a movie a list), then require the login
  //
  //    - Everytime a user visits a movie page a blank review for that user/movie is created, this is bad practice
  //      The record should only be created if the user clicks 'Update my rating' button
  //
  //    - Do we want users to be able to see other users movieReviews?
  //      - As of now, lets say no
  //      - But if we change our mind all we have to do is write a client component 
  //        this component should fetch all reviews with the same imdbID
  //
  //    - Edit prisma schema for lists table to allow user to select a default list
  //      - Just add an attribute like isDefaultList: true | false @default(false)
  //      - WRONG^, you will need to do something like add an attribute to the /api/lists GET request to specify the favorite
  //
  //    - Rewrite /movies page, each media type should have its own section, 
  //      i.e. 'Games' section will show all games in the DB
  //    - Consider renaming movies table to media, since it contains TV shows and games
  //      FIELDS THAT ALMOST CERTAINLY EXISTS: mongoDB-ID, Title, Year, imdbID, Type, cachedAt 
  //
  //    - TV-Shows have individual episodes, make sure we can add episodes to the movies/media table
  //      - Theoretically all we have to do is add a LinkToMovie component 
  //        for each episodes imdbID in /components/DisplayEpisodes,
  //        - LinkToMovie component should take care of linking or adding to db and then linking to imdbID
  //      - Also configure prisma schema to accept episode info, 
  //        might need to add some fields or make others optional
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //    - Consider making all PUT and DELETE requests based on id and username(like /api/watched).  This makes API requests more restFUL
  //

  const user = await currentUser();
  // await prisma.media.deleteMany({});
  // await prisma.lists.deleteMany({});
  // await prisma.reviews.deleteMany({});
  // await prisma.watched.deleteMany({});

  return (
    <div>
      {!(user?.username) ? <h1>Error: you need to login</h1>
      : <div>
        <h1>THIS IS THE HOME PAGE</h1>
        <div className='text-xl'>Hello, {user.username}</div>
        <DisplayLists username={user.username}/>
      </div>
      }
    </div>
  )
}
