import { db } from '@/drizzle/db';
import { listnames, lists, reviews, watched } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

let zeroDate = new Date('January 1, 2025, 12:00 AM').getTime();
function getNextDate() {
  return zeroDate += 1;
}

export async function GET() {
  console.log('FIX DB ROUTE')
  const allWatched = await db.select().from(watched);
  const allReviews = await db.select().from(reviews);
  const allListRecs = await db.select().from(lists);
  const allListnameRecs = await db.select().from(listnames);

  // console.log({ allReviews })
  console.log(allReviews.length)
  console.log(allListRecs.length)
  console.log(allListnameRecs.length)

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

  const fixedListnameRecs = allListnameRecs.map(listnameRec => {
    return {
      ...listnameRec,
      date: getNextDate(),
    }
  });

  // avoid flooding db with requests
  // for (let i = 0; i < fixedReviews.length; i++) {
  //   console.log(`reviews ${i + 1}/${fixedReviews.length}`)
  //   const review = fixedReviews[i];
  //   await db.update(reviews).set({
  //     date: review.date
  //   }).where(
  //     and(
  //       eq(reviews.username, review.username),
  //       eq(reviews.imdbId, review.imdbId),
  //     )
  //   );
  // }

  // for (let i = 0; i < fixedListRecs.length; i++) {
  //   console.log(`listRecs ${i + 1}/${fixedListRecs.length}`)
  //   const listRec = fixedListRecs[i];
  //   if (!listRec.username) throw Error('no username');
  //   if (!listRec.listname) throw Error('no listname');
  //   await db.update(lists).set({
  //     date: listRec.date
  //   }).where(
  //       and(
  //         eq(lists.username, listRec.username),
  //         eq(lists.imdbId, listRec.imdbId),
  //         eq(lists.listname, listRec.listname),
  //       )
  //     );
  // }

  // for (let i = 0; i < fixedListnameRecs.length; i++) {
  //   console.log(`listnames ${i + 1}/${fixedListnameRecs.length}`)
  //   const listnameRec = fixedListnameRecs[i];
  //   await db.update(listnames).set({
  //     date: listnameRec.date,
  //   }).where(
  //     and(
  //       eq(listnames.username, listnameRec.username),
  //       eq(listnames.listname, listnameRec.listname),
  //       eq(listnames.defaultList, listnameRec.defaultList),
  //     )
  //   );
  // }

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
    fixedListnameRecs,
  })
}
