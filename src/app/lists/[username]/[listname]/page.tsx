import prisma from "@/client";
import { lists, media } from "@prisma/client";
import SortFilterMedia from "@/components/SortFilterMedia";

type listMediaID = Pick<lists, 'imdbID'>

export default async function listname({
  params,
}: {
  params: {
    username: string,
    listname: string,
  },
}) {
  let { username, listname } = params;
  username = decodeURI(username);
  listname = decodeURI(listname);
  

  const listMediaIDs: listMediaID[] = await prisma.lists.findMany({
    select: {
      imdbID: true
    },
    where: {
      username,
      listname,
    }
  });
  const mediaArr: media[] = await prisma.media.findMany({ 
    where: {
      imdbID: {
        in: listMediaIDs.map((listMedia: listMediaID) => listMedia.imdbID),
      },
    },
  });

  console.log(username, decodeURI(listname))

  // See /media/page for SortFilterMedia setup
  // We need to get an array of all media data associated with the imdbIDs in the given list
  //
  // Do we want to individually request each imdbID?  That seems pretty stupid
  // Should probably just edit /api/media to return multiple imdbIDs if requested
  // imdbID url prop should be extracted in the api as an array,
  // however, if the request only has one imdbID, dont return an array with a single item, just return the item
  //
  // OR DONT USE THE API AT ALL, just hit the DB directly from this file, this page will use SSR anyways

  // {JSON.stringify(listMediaIDs)}
  // <hr/>
  // {JSON.stringify(mediaArr)}
  return (
    <div>
      <h1>Specific list page</h1>
      <h1>Put a SortFilterMedia component here and read in list data</h1>
      <SortFilterMedia mediaArr={mediaArr} columns={{
        Title: 'string',
        Type: 'array',
        Rated: 'array',
        Year: 'number',
        Runtime: 'number',
        IMDBRating: 'number',
        RottenTomatoesRating: 'number',
        MetacriticRating: 'number',
      }}/>
    </div>
  )
}
