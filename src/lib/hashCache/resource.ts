import { Dependent, EasyFetchData, Matcher } from '@/lib/hashCache/types';
import ClientHashCache from '@/lib/hashCache/client';
import easyFetch from '@/lib/easyFetch';
import { hash } from '@/lib/hashCache/helpers';
import { Methods } from '@/types';

type ResourceArgs = {
  url: string,
  dependent?: Dependent,
  data?: any,
  hash?: string,
  match?: Matcher,
}

type DataHandlers = {
  [M in Methods]?: (extData: any, newData: any, match?: Matcher) => any
}

const dataHandlers: DataHandlers = {
  GET: (_, newData) => newData,
  POST: (extData, newData) => extData.concat(newData),
  PUT: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.map((data: any) => {
      if (match.every(key => data[key] === newData[key])) {
        return newData;
      }
      return data;
    });
  },
  DELETE: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.filter((data: any) => {
      return !match.every(key => data[key] === newData[key]);
    });
  },
  PATCH: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.map((data: any) => {
      if (match.every(key => data[key] === newData[key])) {
        return newData;
      }
      return data;
    })
  }
}

export default class Resource<T = any> {
  data: T;
  hash: string;
  url: string;
  dependent?: Dependent;
  isResource = true;
  lookupObj = {} as { [key: string]: { [key: string]: T } };
  match?: Matcher;

  constructor({ url, dependent, hash, data, match }: ResourceArgs) {
    this.url = url;
    this.dependent = dependent;
    this.hash = hash || '';
    this.data = data;
    this.match = match;
  }

  async update(cache: ClientHashCache, method: Methods, data?: EasyFetchData) {
    cache.isSynced = false;
    cache.setSyncState('notSynced');
    const { params, body } = data || {};
    const result = await easyFetch({
      route: this.url,
      method,
      params: { ...params, useHashCache: true },
      body: body,
    });

    if (this.dependent) {
      if (method === 'POST') {
        console.log('pre key setting', result, this.dependent.key)
        const key = (result as any)[this.dependent.key];
        console.log('key is', key)
        console.log('add dependent', this.dependent)
        const match = cache.config[this.dependent.name].match;
        (cache.cache[this.dependent.name] as any)[key] = new Resource({
          url: `${this.url}/${key}`,
          match
        });
      } else if (method === 'DELETE') {
        console.log('pre key setting', result, this.dependent.key)
        const key = (result as any)[this.dependent.key];
        console.log('key is', key)
        console.log('delete dependent', this.dependent)
        console.log('deleting', this.dependent.name, key)
        delete (cache.cache[this.dependent.name] as any)[key];
      }
    }

    const modFunc = dataHandlers[method];
    if (!modFunc) throw Error(`No modFunc found for ${method}`);
    this.data = modFunc(this.data, result, this.match);
    if (method === 'GET') {
      this.hash = await hash(JSON.stringify(this.data));
    } else {
      this.hash = await hash(
        `${this.hash},${method},${JSON.stringify(result)}`
      );
    }
    if (!cache.deferSync) {
      cache.save();
    }
  }

  lookup(key: string, val: string) {
    if (!this.lookupObj[key]) {
      if (!Array.isArray(this.data)) throw Error('data is not an array');
      console.log(this.data)
      this.lookupObj[key] = this.data.reduce((lookup, val) => {
        console.log(val)
        if (!val[key]) throw Error('key cannot be found');
        lookup[val[key]] = val;
        return lookup;
      }, {} as { [key: string]: T });
    }
    return this.lookupObj[key][val];
  }

  buildDependencies(cache: ClientHashCache) {
    if (!this.dependent) throw Error('no dependent found')
    if (!cache.cache[this.dependent.name]) cache.cache[this.dependent.name] = {};
    (this.data as any[]).forEach(data => {
      if (!this.dependent) throw Error('no dependent found');
      const key = data[this.dependent.key];
      if (!key) throw Error(`key ${this.dependent.key} not found`);
      const match = cache.config[this.dependent.name].match;
      console.log('creating nested', this.dependent.name);
      (cache.cache[this.dependent.name] as any)[key] = new Resource({
        url: `${this.url}/${key}`,
        match
      });
    })
  }
}
