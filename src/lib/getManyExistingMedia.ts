import { db } from '@/drizzle/db';
import { inArray } from 'drizzle-orm';
import { countries, genres, languages, media, people } from '@/drizzle/schema';

export async function getManyExistingMedia(imdbIds: string[]) {
  const mediaInfo = await db.select().from(media).where(inArray(media.imdbId, imdbIds))
  const genreInfo = await db.select().from(genres).where(inArray(genres.imdbId, imdbIds))
  const countryInfo = await db.select().from(countries).where(inArray(countries.imdbId, imdbIds))
  const languageInfo = await db.select().from(languages).where(inArray(languages.imdbId, imdbIds))
  const peopleInfo = await db.select().from(people).where(inArray(people.imdbId, imdbIds))

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

  return imdbIds.map(imdbId => {
    return {
      ...mediaObj[imdbId],
      genre: genreObj[imdbId] || [],
      country: countryObj[imdbId] || [],
      language: languageObj[imdbId] || [],
      ...peopleObj[imdbId],
    }
  })
}
