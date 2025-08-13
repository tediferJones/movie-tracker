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

// Is this really any simpler than the original?
type TableNames = 'media' | 'genres' | 'countries' | 'languages' | 'people'
type TableReturnTypes<T extends TableNames> = {
  media: typeof media.$inferSelect,
  genres: typeof genres.$inferSelect,
  countries: typeof countries.$inferSelect,
  languages: typeof languages.$inferSelect,
  people: typeof people.$inferSelect,
}[T]

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

type Positions = 'actor' | 'writer' | 'director';
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

function groupPeopleByImdbId(data: TableReturnTypes<'people'>[]) {
  return data.reduce((positions, item) => {
    if (!positions[item.imdbId]) positions[item.imdbId] = {
      actor: [],
      writer: [],
      director: [],
    };
    positions[item.imdbId][item.position as Positions].push(item.name);
    return positions;
  }, {} as { [imdbId: string]: { [P in Positions]: string[] } })
}

export async function getManyExistingMediaV2(imdbIds: string[])/*: Promise<ExistingMediaInfo[]>*/ {
  const notCachedImdbIds = imdbIds.filter(imdbId => {
    return !cache.get('media', imdbId, 'mediaInfo');
  });

  if (notCachedImdbIds.length) {
    const typedKeys = getTypedKeys(tables);
    const tableData = Object.fromEntries(
      await Promise.all(
        typedKeys.map(async tableName => {
          return [
            tableName,
            await getTableData(tableName, notCachedImdbIds),
          ];
        })
      )
    ) as { [K in keyof typeof tables]: TableReturnTypes<K>[] };

    const aggregated = {
      media: tableData.media.reduce((obj, media) => {
        obj[media.imdbId] = media;
        return obj;
      }, {} as { [imdbId: string]: TableReturnTypes<'media'> }),
      genres: groupByImdbId(tableData.genres, 'genre'),
      languages: groupByImdbId(tableData.languages, 'language'),
      countries: groupByImdbId(tableData.countries, 'country'),
      // this might be easier if we had a table for each position
      // But then we would need a people table, link ids between people table and position tables
      // could end up just being worse
      people: groupPeopleByImdbId(tableData.people),
    }

    notCachedImdbIds.forEach(imdbId => {
      const mediaInfo: ExistingMediaInfo = {
        ...aggregated.media[imdbId],
        ...aggregated.people[imdbId],
        genre: aggregated.genres[imdbId],
        country: aggregated.countries[imdbId],
        language: aggregated.languages[imdbId],
      }
      cache.set('media', imdbId, 'mediaInfo', mediaInfo);
    });
  }

  return imdbIds.map(imdbId => {
    const mediaInfo = cache.get('media', imdbId, 'mediaInfo');
    if (!mediaInfo) throw Error('could not find mediaInfo');
    return mediaInfo;
  });
}
