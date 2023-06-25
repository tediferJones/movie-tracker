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
  //    - Do we want users to be able to see other users movieReviews?
  //      - As of now, lets say no
  //      - But if we change our mind all we have to do is write a client component 
  //        this component should fetch all reviews with the same imdbID
  //
  //    - Find some way for users to assign a defaul list,
  //      as of now, it "usually" return the most recently added list as the default
  //        - STORE DEFAULT LIST IN USER OBJ, i.e. put it in the clerk data
  //        - Look at publicMetaData and privateMetaData, https://clerk.com/docs/users/overview
  //        OR
  //        - create a table called DefaultList, 
  //          record = { username: string, listname: string }
  //          unique = username and/or username&listname
  //        - then just get record from prisma.DefaultList in /api/lists GET (or whatever returns the users lists)
  //          and move that list name to the start or end of the array used to create the selector options
  //          - this may involve controlling the order of the fields in the lists obj
  //
  //    - Rewrite /movies page, each media type should have its own section, 
  //      i.e. 'Games' section will show all games in the DB
  //
  //      FIELDS THAT ALMOST CERTAINLY EXISTS: mongoDB-ID, Title, Year, imdbID, Type, cachedAt 
  //
  //    - WRITE SOME TESTS, try to test most components and modules
  //
  //    - Add a text field to review prisma schema, so users can write a little text review
  //
  //    - Setup/Post project to vercel, as we push changes to github the website should update
  //      - Vercel will use its own database, so make sure prisma schemas are correct before setup
  //
  //    - Error in ManageWatched Component
  //
  //    - Add individual season to /media/[imdbID] if media.Type = 'episode', 
  //      i.e. if viewing Archer S01E04, page should show season 1 in a drop down
  //
  //    - Edit searchBar component, only show drop once the input has been selected at least once
  //      - We want user searches to be preserved (if we search star wars and click the first link, star wars will be in the input on the next page)
  //        We want to preserve this behavior, without having the drop down over lap important media info
  //
  //    - Edit ManageLists: where it shows what lists already contain this movie, each of those options should present its own delete button
  //      - When clicked, delete movie and refresh userLists data
  //      - Button exists, but doesn't do anything yet
  //
  //    - Consider editing ManageLists component, by default it should display all users list, and the button should be add or remove depending on if it exists or not
  //
  //    - Add a loading state to ManageLists component,
  //      - As of now we assign a default state of {}, set to null by default, if null then display loading diaglog
  //        Once useEffect completes, assign the fetch result to state, even if its empty obj thats okay
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //    - Consider making all PUT and DELETE requests based on id and username(like /api/watched).  This makes API requests more restFUL
  //      - If we dont end up doing this, change the delete function in ManageWatched to match how we handle things everywhere else
  //    - Add proper type to sliderHandler func in ManageReview
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
