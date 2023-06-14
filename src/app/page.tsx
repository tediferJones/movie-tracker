import { currentUser } from '@clerk/nextjs';
import DisplayUserList from '@/components/DisplayUserList';
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
  //    - Do we want users to be able to see other users movieReviews?
  //      - As of now, lets say no
  //      - But if we change our mind all we have to do is write a client component 
  //        this component should fetch all reviews with the same imdbID
  //
  //    - Build a ManageWatched component
  //      - Should interface with /api/watched
  //      - Only needs GET, POST & DELETE functions, no upating is needed
  //      - When we get this working, delete watched from reviews prisma schema, its redundant
  //
  //    - Edit prisma schema for lists table to allow user to select a default list
  //      - Just add an attribute like isDefaultList: true | false @default(false)
  //      - WRONG^, you will need to do something like add an attribute to the /api/lists GET request to specify the favorite
  //
  //    - Rename some components, like AddToMyList and EditListDetails, should be named like so:
  //      - If component modifies data: prefix with Manage[ResourceName]
  //      - If we are just displaying data: prefix with Display[ResouceName]
  //      - Maybe rename UpdateCachedMovie to ManageCachedMovie, it is technically making changes to the DB
  //
  //    - Consider renaming movies table to media, since it contains TV shows and games
  //      FIELDS THAT ALMOST CERTAINLY EXISTS: mongoDB-ID, Title, Year, imdbID, Type, cachedAt 
  //
  //    - Rewrite /movies page, show movies, tv-shows, and games in different categories, like /lists/[username] page
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //    - MONGODB CONNECTION STRING IS POSTED TO GITHUB, move from prismaSchema file to .env
  //

  const user = await currentUser();
  // await prisma.movies.deleteMany({});
  // await prisma.lists.deleteMany({});
  // await prisma.reviews.deleteMany({});

  return (
    <div>
      {!(user?.username) ? <h1>Error: you need to login</h1>
      : <div>
        <h1>THIS IS THE HOME PAGE</h1>
        <div className='text-xl'>Hello, {user.username}</div>
        <DisplayUserList username={user.username}/>
      </div>
      }
    </div>
  )
}
