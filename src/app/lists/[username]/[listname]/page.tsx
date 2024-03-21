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
  const username = decodeURI(params.username)
  const listname = decodeURI(params.listname)

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

  return (
    <div>
      <h1>Specific list page</h1>
      <h1>Put a SortFilterMedia component here and read in list data</h1>
      <SortFilterMedia mediaArr={mediaArr} columns={{}}/>
    </div>
  )
}
