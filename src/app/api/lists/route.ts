import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/drizzle/db';
import { countries, genres, languages, listnames, lists, media, people } from '@/drizzle/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
// import getExistingMedia from '@/lib/getExistingMedia';
import { isValid } from '@/lib/inputValidation';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const imdbId = searchParams.get('imdbId');
  const listname = searchParams.get('listname');
  
  if (listname && !isValid({ listname })) {
    return NextResponse.json('inputs are not valid', { status: 422 })
  }

  // existingMedia structure: {
  //  ...mediaInfo,
  //  genre: string[],
  //  country: string[],
  //  language: string[],
  //  ...{ personPosition: string[] }
  // }
  // table.$inferSelect

  // TESTING JOINS
  // const joinTest = await db.select({ imdbId: lists.imdbId }).from(lists).where(
  // const joinTest = await db.select({
  //   ...media,
  //   names: sql`GROUP_CONCAT(${people.name}, ', ')`.as('names'),
  // }).from(lists).where(
  //   and(
  //     eq(lists.username, 'tedifer_jones'),
  //     eq(lists.listname, 'Anime')
  //   )
  // )
  //   // .leftJoin(media, eq(lists.imdbId, media.imdbId))
  // .leftJoin(media, eq(lists.imdbId, media.imdbId))
  // .leftJoin(people, eq(lists.imdbId, people.imdbId))
  // .groupBy(lists.imdbId)

  // await db.select({ ...lists }).from(lists)

  // .rightJoin(people, eq(lists.imdbId, people.imdbId))
  // .groupBy(media.imdbId, lists.imdbId)
  // console.log('JOIN TEST', joinTest)

  // if (!listname) throw Error('no listname')
  let betterResult
  if (listname) {
    const imdbIds = (await db.select({ imdbId: lists.imdbId }).from(lists).where(
      and(
        eq(lists.username, username || user.username),
        eq(lists.listname, listname)
      )
    )).map(rec => rec.imdbId)

    // NEW QUERY: await db.select().from(myTable).where(inArray(myTable.id, ids));
    // This works very well but is kind of a mess, trying using a JOIN statement
    //  - JOIN statement might allow us to greatly simplify or eliminate the manual merging of media data
    const mediaInfo = await db.select().from(media).where(inArray(media.imdbId, imdbIds))
    const genreInfo = await db.select().from(genres).where(inArray(genres.imdbId, imdbIds))
    const countryInfo = await db.select().from(countries).where(inArray(countries.imdbId, imdbIds))
    const languageInfo = await db.select().from(languages).where(inArray(languages.imdbId, imdbIds))
    const peopleInfo = await db.select().from(people).where(inArray(people.imdbId, imdbIds))
    // console.log('GOT INFO WITH INARRAY METHOD')

    const mediaObj = mediaInfo.reduce((mediaObj, media) => {
      mediaObj[media.imdbId] = media
      return mediaObj
    }, {} as Record<string, typeof media.$inferSelect>)
    const genreObj = genreInfo.reduce((genreObj, genre) => {
      if (!genreObj[genre.imdbId]) genreObj[genre.imdbId] = []
      genreObj[genre.imdbId].push(genre.genre)
      return genreObj
    }, {} as Record<string, string[]>)
    const countryObj = countryInfo.reduce((countryObj, country) => {
      if (!countryObj[country.imdbId]) countryObj[country.imdbId] = []
      countryObj[country.imdbId].push(country.country)
      return countryObj
    }, {} as Record<string, string[]>)
    const languageObj = languageInfo.reduce((languageObj, language) => {
      if (!languageObj[language.imdbId]) languageObj[language.imdbId] = []
      languageObj[language.imdbId].push(language.language)
      return languageObj
    }, {} as Record<string, string[]>)
    const peopleObj = peopleInfo.reduce((peopleObj, person) => {
      if (!peopleObj[person.imdbId]) peopleObj[person.imdbId] = {}
      if (!peopleObj[person.imdbId][person.position]) peopleObj[person.imdbId][person.position] = []
      peopleObj[person.imdbId][person.position].push(person.name)
      return peopleObj
    }, {} as Record<string, Record<string, string[]>>)

    betterResult = imdbIds.map(imdbId => {
      return {
        ...mediaObj[imdbId],
        genre: genreObj[imdbId] || [],
        country: countryObj[imdbId] || [],
        language: languageObj[imdbId] || [],
        ...peopleObj[imdbId],
      }
    })
  }
  // console.log('BETTER RESULT DONE')

  // use .limit(num).offset(num) for paging
  // where limit = pageSize and offset = startCount
  // return NextResponse.json({
  //   allMediaInfo: !listname ? undefined : await Promise.all(
  //     (await db.select({ imdbId: lists.imdbId }).from(lists).where(
  //       and(
  //         eq(lists.username, username || user.username),
  //         eq(lists.listname, listname),
  //       )
  //     ).limit(25)).map(async rec => getExistingMedia(rec.imdbId))
  //   ),
  // })

  // we need to replace getExistingMedia call with one big query,
  // if we have 300 imdbIds, that will turn into 1000+ db queries
  // NEW QUERY: await db.select().from(myTable).where(inArray(myTable.id, ids));
  //
  // if (!listname) throw Error('no listname')
  // let listResult = []
  // try {
  //   const dbResult = await db.select({ imdbId: lists.imdbId }).from(lists).where(
  //     and(
  //       eq(lists.username, username || user.username),
  //       eq(lists.listname, listname)
  //     )
  //   )
  //   // return NextResponse.json(dbResult.map(rec => rec.imdbId))
  //   // console.log('got db result', dbResult.length)
  //   for (let i = 0; i < dbResult.length; i++) {
  //     console.log(i)
  //     listResult.push(await getExistingMedia(dbResult[i].imdbId))
  //     if (JSON.stringify(listResult[i]) !== JSON.stringify(betterResult[i])) {
  //       console.log('BEEP BEEP ITS FUCKED')
  //       console.log('ORIGINAL', listResult[i])
  //       console.log('NEW', betterResult[i])
  //       throw Error('mismatch')
  //     }
  //   }
  //   // THIS IS WHERE THE PROBLEM IS, WE NEED TO DO THIS MORE EFFICIENTLY
  //   // do something like this for each table, then aggregate data by id
  //   // const records = await db.select().from(myTable).where(inArray(myTable.id, ids));

  //   // listResult = await Promise.all(dbResult.map(async rec => getExistingMedia(rec.imdbId)))
  //   console.log('processed db result')
  // } catch {
  //   console.log('db req failed')
  //   return NextResponse.json('db req failed', { status: 500 })
  // }
  // console.log('MATCH?', JSON.stringify(listResult) === JSON.stringify(betterResult))
  // return NextResponse.json({ allMediaInfo: listResult })

  // We need to be able to do a few things:
  //  - Return all list names
  //  - If imdbId is given, return all list names that contain imdbId
  //  - If listname is given, get all media info for listname and either specified user or self
  // WORKING
  return NextResponse.json({
    allListnames: (
      await db.select({ listname: listnames.listname }).from(listnames)
      .where(eq(listnames.username, username || user.username))
    ).map(rec => rec.listname),
    containsImdbId: !imdbId ? undefined : (
      await db.select({ listname: lists.listname }).from(lists).where(
        and(
          eq(lists.username, username || user.username),
          eq(lists.imdbId, imdbId)
        )
      )
    ).map(rec => rec.listname),
    allMediaInfo: betterResult,
    // allMediaInfo: !listname ? undefined : await Promise.all(
    //   (await db.select({ imdbId: lists.imdbId }).from(lists).where(
    //     and(
    //       eq(lists.username, username || user.username),
    //       eq(lists.listname, listname),
    //     )
    //   )).map(async rec => getExistingMedia(rec.imdbId))
    // ),
    defaultList: (
      await db.select({ listname: listnames.listname }).from(listnames).where(
        and(
          eq(listnames.username, username || user.username),
          eq(listnames.defaultList, true)
        )
      ).get()
    )?.listname,
  })
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, listname } = await req.json();
  if (!imdbId || !listname) return NextResponse.json('Bad request', { status: 400 })

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  const listExists = await db.select().from(listnames).where(
    and(
      eq(listnames.username, user.username),
      eq(listnames.listname, listname)
    )
  ).get();
  if (!listExists) {
    await db.insert(listnames).values({
      username: user.username,
      listname: listname,
      defaultList: false,
    })
  }

  await db.insert(lists).values({
    imdbId,
    listname,
    username: user.username,
  })

  return new NextResponse
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { listname } = await req.json();
  if (!listname) return NextResponse.json('Bad request', { status: 400 })

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  await db.update(listnames).set({ defaultList: false }).where(eq(listnames.username, user.username))
  await db.update(listnames).set({ defaultList: true }).where(
    and(
      eq(listnames.username, user.username),
      eq(listnames.listname, listname),
    )
  )

  return new NextResponse
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, listname } = await req.json();
  if (!listname) return NextResponse.json('Bad request', { status: 400 })

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  if (!imdbId) {
    // Table is setup so that this should automatically cascade the delete in lists table
    await db.delete(listnames).where(
      and(
        eq(listnames.username, user.username),
        eq(listnames.listname, listname),
      )
    );
    return new NextResponse;
  }

  await db.delete(lists).where(
    and(
      eq(lists.username, user.username),
      eq(lists.listname, listname),
      eq(lists.imdbId, imdbId),
    )
  )

  const listContents = await db.select().from(lists).where(
    and(
      eq(lists.username, user.username),
      eq(lists.listname, listname),
    )
  ).get();
  if (!listContents) {
    db.delete(listnames).where(
      and(
        eq(lists.username, user.username),
        eq(lists.listname, listname)
      )
    )
  }

  return new NextResponse
}
