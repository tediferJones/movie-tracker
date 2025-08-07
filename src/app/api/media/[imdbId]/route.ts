import { db } from '@/drizzle/db';
import { countries, genres, languages, media, people } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { useCache } from '@/lib/cache';
import easyFetch from '@/lib/easyFetch';
import formatMediaInfo from '@/lib/formatMediaInfo';
import { StrIdxRawMedia } from '@/types';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  return await useCache(req, 'GET', 'media', imdbId, 'mediaInfo',
    async () => {
      return await db.select().from(media).where(
        eq(media.imdbId, imdbId)
      ).get();
    }
  );
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  return await useCache(req, 'POST', 'media', imdbId, 'mediaInfo',
    async () => {
      const omdbResult = await easyFetch<StrIdxRawMedia>({
        route: 'https://www.omdbapi.com/',
        method: 'GET',
        params: {
          apikey: process.env.OMDBAPI_KEY,
          i: imdbId,
        }
      });
      if (omdbResult?.Response !== 'True') {
        throw Error('Could not find imdbId');
      }
      const formattedMedia = formatMediaInfo(omdbResult);
      await db.insert(media).values(formattedMedia.mediaInfo);
      await db.insert(genres).values(formattedMedia.genres!);
      await db.insert(countries).values(formattedMedia.countries!);
      await db.insert(languages).values(formattedMedia.languages!);
      await db.insert(people).values(formattedMedia.people!);
    }
  );
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  return await useCache(req, 'DELETE', 'media', imdbId, 'mediaInfo',
    async () => {
      const omdbResult = await easyFetch<StrIdxRawMedia>({
        route: 'https://www.omdbapi.com/',
        method: 'GET',
        params: {
          apikey: process.env.OMDBAPI_KEY,
          i: imdbId,
        }
      });
      if (omdbResult?.Response !== 'True') {
        throw Error('Could not find imdbId');
      }
      const formattedMedia = formatMediaInfo(omdbResult);

      // do not delete, if you delete from media table the action will cascade to other tables (including userData tables)
      await db.update(media).set(formattedMedia.mediaInfo);

      // clear old related mediaInfo
      await db.delete(genres).where(eq(genres.imdbId, imdbId));
      await db.delete(countries).where(eq(countries.imdbId, imdbId));
      await db.delete(languages).where(eq(languages.imdbId, imdbId));
      await db.delete(people).where(eq(people.imdbId, imdbId));

      // insert new related mediaInfo
      await db.insert(genres).values(formattedMedia.genres!);
      await db.insert(countries).values(formattedMedia.countries!);
      await db.insert(languages).values(formattedMedia.languages!);
      await db.insert(people).values(formattedMedia.people!);
    }
  );
}
