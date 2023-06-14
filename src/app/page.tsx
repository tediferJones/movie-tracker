import { currentUser } from '@clerk/nextjs';
import DisplayUserList from '@/components/DisplayUserList';
// import prisma from '@/client'

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
  // General Notes to self:
  //    - Use easyFetch for all fetch requests, be consistent
  //    - Replace 2 line methods for fetching url params with the 1 line method (see /api/lists for examples)
  //    - Always be careful of the inputs we accept from the user, 
  //      Solution: just DONT use HTML value attribute to hold/pass important information, 
  //      
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
  //    - Users will watch the same movie multiple times, 
  //      we should save the date for each time a movie is watched
  //      i.e. change watched attribute in reviews table to an array 
  //           or make another table called watched, each record contains { username, imdbID, dateWatched }
  //      - if we make a new table, remove 'watched' from review table, it is kind of irrelevant to the review anyways
  //      - Should probably make a ManageWatched component, that takes care of everything related to the watched table
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
  //    - OMDBAPI CAN RETURN DIFFERENT TYPES OF MEDIA, i.e. movie, series, game, episode(EPISODE DOES NOT WORK)
  //      - add a drop menu to search bar that allows user to select media type, default should be movie
  //      - CANT ADD TVSHOWS TO DB, they dont have boxOffice attribute, 
  //        thus we need to adapt cleanMovieInfo to assign 0 if boxOffice === undefined
  //      - SHOULD PROBABLY MAKE A SEPERATE TABLE FOR TV-SHOWS
  //      - And maybe a seperate one for games too
  //      - Do we want seperate tables for games and TV-shows?  or just throw them all in a table called Media?
  //        - If we go with one table, we can still sort by 'Type' which should be either movie, series, game
  //        - differences between tv-show and movie info:
  //          tv-show: totalSeasons
  //          movie & game: DVD, BoxOffice, Production, Website
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //      - Try adding a third type to the types file,
  //      - One type needs to be a pure version of rawMovieInfo, no optional fields
  //      - Second type need to be a transitional object, should have lots of optional fields
  //      - Third type is cleanMovieInfo, which is already pure
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
