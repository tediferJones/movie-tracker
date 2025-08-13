import {
  DbArgs,
  ExtraKeys,
  InferredParams,
  ParamConfig,
  ParamTypes,
  TypeMap
} from '@/lib/dataCache/types';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { isValid } from '@/lib/inputValidation';
import { ServerTypes, serverHashCache } from '@/lib/hashCache/config';
import { CacheData } from '@/lib/dataCache/cacheData';
import { CacheType, cache } from '@/lib/dataCache/config';
import { ExistingMediaInfo, FillWith, Review, Methods } from '@/types';

// FIX ME
// Maybe try using FillResources here
// Will also have to modify FillResources generic to take resources as an argument
type ResTypes = {
  media: {
    mediaInfo: FillWith<{
      GET: ExistingMediaInfo,
      POST: ExistingMediaInfo,
    }, void>,
    reviews: FillWith<{
      GET: Review[],
    }, void>,
  },
  users: ServerTypes,
}

type GetResType<
  T extends keyof ResTypes,
  R extends keyof ResTypes[T],
  M extends keyof ResTypes[T][R],
> = ResTypes[T][R][M]

const paramConverters: { [K in ParamTypes]: (arg: string) => TypeMap[K] } = {
  string: (arg) => String(arg),
  number: (arg) => Number(arg),
  boolean: (arg) => arg === 'true',
}

const bodyConverters = {
  json: async (req: Request) => await req.json(),
}

export async function useCache<
  M extends Methods & keyof ResTypes[T][R],
  T extends keyof CacheType,
  K extends keyof CacheType[T],
  R extends keyof CacheType[T][K] & keyof ResTypes[T],
  V extends CacheType[T][K][R] & CacheData<unknown>,
  P extends { [param: string]: ParamConfig } = {},
>(
  req: Request,
  method: M,
  type: T,
  key: K,
  resource: R,
  dbQuery: (args: Required<DbArgs<P>>) => Promise<GetResType<T, R, M>>,
  opts: {
    needsAuth?: boolean,
    extraKeys?: ExtraKeys,
    params?: P,
    body?: {
      type: keyof typeof bodyConverters,
      validate?: boolean,
    }
  } = {},
) {
  // types for data and resource should be tied to those of serverHashCache
  // if type === 'users' then key is username

  const user = await currentUser();
  const isSelf = user?.username && user.username === key;
  if (opts.needsAuth && !isSelf) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const useHashCache = searchParams.get('useHashCache') === 'true';
  const extraKeys = opts.extraKeys || [];

  // should probably wrap this in try catch,
  // throw error with reason for failure and status code,
  // return error as NextResponse
  const params = Object.keys(opts.params || {}).reduce((params, param) => {
    const paramObj = opts.params![param];
    const paramStr = searchParams.get(param);
    if (!paramStr) {
      if (paramObj.required) {
        throw Error(`Param ${param} is required`);
      } else {
        // param does not exist but isn't required, so just do nothing
        return params;
      }
    }
    // param exists
    const paramVal = paramConverters[paramObj.type](paramStr);

    // validate
    if (paramObj.validator && !isValid({ [paramObj.validator]: paramVal })) {
      throw Error(`Param ${param} is not valid`);
    }

    params[param] = paramVal;
    return params;
  }, {} as { [param: string]: any }) as InferredParams<P>;
  console.log('ParamsResult', params);

  let parsedBody;
  if (opts.body) {
    const result = await bodyConverters[opts.body.type](req);
    if (opts.body.validate && !isValid(result)) {
      throw Error('body invalid');
    }
    parsedBody = result;
  }

  const dbArgs: Required<DbArgs<P>> = {
    body: parsedBody || undefined,
    params,
  }

  let data: V['data'];
  try {
    if (method === 'GET') {
      data = await cache.getSet(
        type,
        key,
        resource,
        dbQuery as any,
        dbArgs,
        ...extraKeys,
      );
    } else {
      cache.delete(type, key, resource);
      data = await dbQuery(dbArgs);
    }
  } catch (error) {
    console.log('ERROR', error)
    return NextResponse.json(
      'Failed to process request, database error',
      { status: 500 }
    );
  }

  // FIX ME, can we get rid of casting here?
  if (isSelf && useHashCache) {
    await serverHashCache.update(
      req,
      key as string, // if type is 'users' then key is username
      data as any,
      method,
      resource as any,
      ...extraKeys,
    );
  }

  return NextResponse.json(data || 'Operation Successful');
}
