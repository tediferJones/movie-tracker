export const cacheDataSymbol = Symbol('isCacheData');
export class CacheData<T> {
  data: T;
  date = Date.now();
  [cacheDataSymbol] = true;

  constructor(data: T) {
    this.data = data;
  }
}
