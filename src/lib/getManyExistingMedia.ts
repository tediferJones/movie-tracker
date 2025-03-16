import { db } from '@/drizzle/db';
import { inArray } from 'drizzle-orm';
import { countries, genres, languages, media, people } from '@/drizzle/schema';
import cache from '@/lib/cache';

type ImdbId = string
type ProcessedData = {
  mediaObj: Record<ImdbId, typeof media.$inferSelect>,
  genreObj: Record<ImdbId, string[]>,
  countryObj: Record<ImdbId, string[]>,
  languageObj: Record<ImdbId, string[]>,
  peopleObj: Record<ImdbId, Record<string, string[]>>
}

export async function getManyExistingMedia(imdbIds: string[]) {
  // OLD WORKING
  // const mediaInfo = await db.select().from(media).where(inArray(media.imdbId, imdbIds))
  // const genreInfo = await db.select().from(genres).where(inArray(genres.imdbId, imdbIds))
  // const countryInfo = await db.select().from(countries).where(inArray(countries.imdbId, imdbIds))
  // const languageInfo = await db.select().from(languages).where(inArray(languages.imdbId, imdbIds))
  // const peopleInfo = await db.select().from(people).where(inArray(people.imdbId, imdbIds))

  const cachedImdbIds = new Set(Object.keys(cache))
  const notCachedImdbIds = imdbIds.filter(imdbId => !cachedImdbIds.has(imdbId))
  console.log(`fetching ${notCachedImdbIds.length}/${imdbIds.length}`)
  console.log('checking if cache is shared', cache['shareCheck'])
  // const processedData: Record<string, any> = {}
  const processedData = {} as ProcessedData
  if (notCachedImdbIds.length) {
    const mediaInfo = await db.select().from(media).where(inArray(media.imdbId, notCachedImdbIds))
    const genreInfo = await db.select().from(genres).where(inArray(genres.imdbId, notCachedImdbIds))
    const countryInfo = await db.select().from(countries).where(inArray(countries.imdbId, notCachedImdbIds))
    const languageInfo = await db.select().from(languages).where(inArray(languages.imdbId, notCachedImdbIds))
    const peopleInfo = await db.select().from(people).where(inArray(people.imdbId, notCachedImdbIds))

    processedData.mediaObj = mediaInfo.reduce((mediaObj, media) => {
      mediaObj[media.imdbId] = media
      return mediaObj
    }, {} as Record<string, typeof media.$inferSelect>)
    processedData.genreObj = genreInfo.reduce((genreObj, genre) => {
      if (!genreObj[genre.imdbId]) genreObj[genre.imdbId] = []
      genreObj[genre.imdbId].push(genre.genre)
      return genreObj
    }, {} as Record<string, string[]>)
    processedData.countryObj = countryInfo.reduce((countryObj, country) => {
      if (!countryObj[country.imdbId]) countryObj[country.imdbId] = []
      countryObj[country.imdbId].push(country.country)
      return countryObj
    }, {} as Record<string, string[]>)
    processedData.languageObj = languageInfo.reduce((languageObj, language) => {
      if (!languageObj[language.imdbId]) languageObj[language.imdbId] = []
      languageObj[language.imdbId].push(language.language)
      return languageObj
    }, {} as Record<string, string[]>)
    processedData.peopleObj = peopleInfo.reduce((peopleObj, person) => {
      if (!peopleObj[person.imdbId]) peopleObj[person.imdbId] = {}
      if (!peopleObj[person.imdbId][person.position]) peopleObj[person.imdbId][person.position] = []
      peopleObj[person.imdbId][person.position].push(person.name)
      return peopleObj
    }, {} as Record<string, Record<string, string[]>>)
  }

  return imdbIds.map(imdbId => {
    if (!cache[imdbId]) {
      const mergedData = {
        ...processedData.mediaObj[imdbId],
        genre: processedData.genreObj[imdbId] || [],
        country: processedData.countryObj[imdbId] || [],
        language: processedData.languageObj[imdbId] || [],
        ...processedData.peopleObj[imdbId],
      }
      cache[imdbId] = { data: mergedData, date: Date.now() }
    }
    return cache[imdbId].data
  })

  // return imdbIds.map(imdbId => {
  //   return {
  //     ...mediaObj[imdbId],
  //     genre: genreObj[imdbId] || [],
  //     country: countryObj[imdbId] || [],
  //     language: languageObj[imdbId] || [],
  //     ...peopleObj[imdbId],
  //   }
  // })
}
