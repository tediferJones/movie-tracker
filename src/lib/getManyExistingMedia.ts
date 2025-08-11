import { db } from '@/drizzle/db';
import { inArray } from 'drizzle-orm';
import { countries, genres, languages, media, people } from '@/drizzle/schema';
import { cache } from '@/lib/dataCache/config';
import { ExistingMediaInfo } from '@/types';

type ImdbId = string
type ProcessedData = {
  mediaObj: Record<ImdbId, typeof media.$inferSelect>,
  genreObj: Record<ImdbId, string[]>,
  countryObj: Record<ImdbId, string[]>,
  languageObj: Record<ImdbId, string[]>,
  peopleObj: Record<ImdbId, Record<string, string[]>>
}

export async function getManyExistingMedia(imdbIds: string[]): Promise<ExistingMediaInfo[]> {
  const notCachedImdbIds = imdbIds.filter(imdbId => {
    return !cache.get('media', imdbId, 'mediaInfo');
  });
  const processedData = {} as ProcessedData;
  if (notCachedImdbIds.length) {
    const mediaInfo = await db.select().from(media).where(inArray(media.imdbId, notCachedImdbIds));
    const genreInfo = await db.select().from(genres).where(inArray(genres.imdbId, notCachedImdbIds));
    const countryInfo = await db.select().from(countries).where(inArray(countries.imdbId, notCachedImdbIds));
    const languageInfo = await db.select().from(languages).where(inArray(languages.imdbId, notCachedImdbIds));
    const peopleInfo = await db.select().from(people).where(inArray(people.imdbId, notCachedImdbIds));

    // FIX ME, clean this up
    processedData.mediaObj = mediaInfo.reduce((mediaObj, media) => {
      mediaObj[media.imdbId] = media;
      return mediaObj;
    }, {} as Record<string, typeof media.$inferSelect>);
    processedData.genreObj = genreInfo.reduce((genreObj, genre) => {
      if (!genreObj[genre.imdbId]) genreObj[genre.imdbId] = [];
      genreObj[genre.imdbId].push(genre.genre);
      return genreObj;
    }, {} as Record<string, string[]>);
    processedData.countryObj = countryInfo.reduce((countryObj, country) => {
      if (!countryObj[country.imdbId]) countryObj[country.imdbId] = [];
      countryObj[country.imdbId].push(country.country);
      return countryObj;
    }, {} as Record<string, string[]>);
    processedData.languageObj = languageInfo.reduce((languageObj, language) => {
      if (!languageObj[language.imdbId]) languageObj[language.imdbId] = [];
      languageObj[language.imdbId].push(language.language);
      return languageObj;
    }, {} as Record<string, string[]>);
    processedData.peopleObj = peopleInfo.reduce((peopleObj, person) => {
      if (!peopleObj[person.imdbId]) peopleObj[person.imdbId] = {};
      if (!peopleObj[person.imdbId][person.position]) peopleObj[person.imdbId][person.position] = [];
      peopleObj[person.imdbId][person.position].push(person.name);
      return peopleObj;
    }, {} as Record<string, Record<string, string[]>>);
  }

  return await Promise.all(
    imdbIds.map(async imdbId => {
      return await cache.getSet('media', imdbId, 'mediaInfo', () => ({
        ...processedData.mediaObj[imdbId],
        genre: processedData.genreObj[imdbId] || [],
        country: processedData.countryObj[imdbId] || [],
        language: processedData.languageObj[imdbId] || [],
        ...processedData.peopleObj[imdbId],
      } as ExistingMediaInfo), { body: undefined, params: {} });
    })
  );
}
