import { db } from '@/drizzle/db';
import { lists, reviews, watched } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

let zeroDate = new Date('January 1, 2025, 12:00 AM').getTime();
function getNextDate() {
  return zeroDate += 1;
}

export async function GET() {
  const allWatched = await db.select().from(watched);
  const allReviews = await db.select().from(reviews);
  const allListRecs = await db.select().from(lists);

  // add time stamps to reviews, if watch record exists, just use that timestamp
  const fixedReviews = allReviews.map(review => {
    const matchingWatchRec = allWatched.find(watchRec => 
      watchRec.username === review.username && watchRec.imdbId === review.imdbId
    );
    return {
      ...review,
      date: matchingWatchRec?.date || getNextDate(),
    }
  });

  const fixedListRecs = allListRecs.map(listRec => {
    return {
      ...listRec,
      date: getNextDate(),
    }
  });

  // await Promise.all(fixedReviews.map(review => {
  //   return db.update(reviews).set({
  //     date: review.date
  //   }).where(
  //     and(
  //       eq(reviews.username, review.username),
  //       eq(reviews.imdbId, review.imdbId),
  //     )
  //   );
  // }));

  // await Promise.all(fixedListRecs.map(listRec => {
  //   if (!listRec.username) throw Error('no username')
  //   if (!listRec.listname) throw Error('no listname')
  //   return db.update(lists).set({
  //     date: listRec.date
  //   }).where(
  //       and(
  //         eq(lists.username, listRec.username),
  //         eq(lists.imdbId, listRec.imdbId),
  //         eq(lists.listname, listRec.listname),
  //       )
  //     );
  // }));

  return NextResponse.json({
    msg: 'Operation completed successfully',
    fixedReviews,
    fixedListRecs,
  })
}
