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

const tables = {
  media,
  genres,
  countries,
  languages,
  people,
}

async function getTableData(
  tableName: keyof typeof tables,
  imdbIds: string[]
) {
  const table = tables[tableName];
  return await db.select().from(table).where(inArray(table.imdbId, imdbIds));
}

function getTypedKeys<T extends { [key: string]: any }>(obj: T) {
  return Object.keys(obj) as (keyof T)[]
}

function groupByImdbId<
  T extends { imdbId: string },
  K extends keyof T,
>(data: T[], field: K) {
  return data.reduce((obj, item) => {
    if (!obj[item.imdbId]) obj[item.imdbId] = [];
    obj[item.imdbId].push(item[field]);
    return obj;
  }, {} as { [imdbId: string]: T[K][] });
}

export async function getManyExistingMediaV2(imdbIds: string[]): Promise<ExistingMediaInfo[]> {
  const notCachedImdbIds = imdbIds.filter(imdbId => {
    return !cache.get('media', imdbId, 'mediaInfo');
  });
  if (notCachedImdbIds.length) {
    const typedKeys = getTypedKeys(tables);
    // This needs to have an actual type
    const tableData = Object.fromEntries(
      await Promise.all(
        typedKeys.map(async tableName => {
          return [
            tableName,
            await getTableData(tableName, notCachedImdbIds),
          ];
        })
      )
    ) as { [K in keyof typeof tables]: any[] };

    // notCachedImdbIds.forEach(imdbId => {
    //   const mediaInfo: ExistingMediaInfo = {
    //     ...tableData.media,
    //     genre: groupByImdbId(tableData.genres, 'genre'),
    //   }
    //   cache.set('media', imdbId, 'mediaInfo', mediaInfo);
    // });
  }

  return imdbIds.map(imdbId => {
    const mediaInfo = cache.get('media', imdbId, 'mediaInfo');
    if (!mediaInfo) throw Error('could not find mediaInfo');
    return mediaInfo;
  })
}
