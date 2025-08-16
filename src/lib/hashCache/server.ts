import {
  DataCache,
  ServerResponse,
  ServerResource,
  Config,
  Resources,
} from '@/lib/hashCache/types';
import {
  hash,
  reverseDependencies
} from '@/lib/hashCache/helpers';
import { ServerTypes } from '@/lib/hashCache/config';

export default class ServerHashCache {
  cache: { [username: string]: DataCache<ServerResource> | undefined };
  reverseDependencies: ReturnType<typeof reverseDependencies>;

  constructor(config: Config) {
    this.cache = {};
    this.reverseDependencies = reverseDependencies(config);
  }

  getHashes(username: string): ServerResponse {
    return this.cache[username] || null;
  }

  async update<
    R extends Resources,
    M extends keyof ServerTypes[R]
  >(
    req: Request,
    username: string,
    data: ServerTypes[R][M],
    method: M,
    resource: R,
    ...keys: (string | number)[]
  ) {
    if (!this.cache[username]) this.cache[username] = {};
    const userHashes = this.cache[username]!;
    if (!userHashes[resource]) userHashes[resource] = {};
    let res: ServerResource = (
      keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return (obj as any)[key];
      }, userHashes[resource] as any)
    );

    console.log('SETTING', res, resource, keys)
    if (res.isResource) {
      // RESOURCE ALREADY EXISTS
      if (method === 'GET') {
        res.hash = await hash(JSON.stringify(data));
      } else {
        res.hash = await hash(
          `${res.hash},${method.toString()},${JSON.stringify(data)}`
        );
        if (res.dependent) {
          const key = (data as any)[res.dependent.key];
          if (method === 'POST') {
            console.log('adding dependent')
            if (!userHashes[res.dependent.name]) {
              userHashes[res.dependent.name] = {};
            }
            (userHashes[res.dependent.name] as any)[key] = {
              isResource: true,
              url: `${res.url}/${key}`,
              hash: '',
            }
          } else if (method === 'DELETE') {
            console.log('deleting dependent')
            delete (userHashes[res.dependent.name] as any)[key];
          }
        }
      }
    } else {
      // MAKE RESOURCE
      if (method !== 'GET') {
        throw Error('new resources must be created with GET method');
      }
      res.isResource = true;
      res.url = new URL(req.url).pathname;
      res.dependent = this.reverseDependencies.revDeps[resource];
      res.hash = await hash(JSON.stringify(data));
    }
  }
}
