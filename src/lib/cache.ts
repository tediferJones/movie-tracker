class Cache {
  cache: Record<string, { data: any, date: number }>

  constructor(maxTime: number) {
    this.cache = {}
    setInterval(() => {
      console.log('checking for outdated');
      const currentTime = Date.now();
      Object.keys(this.cache).forEach(key => {
        const timeDiff = currentTime - this.cache[key].date;
        if (timeDiff > maxTime) {
          console.log(`clearing ${key} from cache`);
          delete this.cache[key];
        }
      });
    }, maxTime);
  }

  get(key: string) {
    return this.cache[key]?.data
  }

  set(key: string, data: any) {
    return this.cache[key] = { data, date: Date.now() }
  }

  delete(key: string) {
    return delete this.cache[key]
  }

  keys() {
    return Object.keys(this.cache)
  }
}

// const maxTime = 1000 * 60 * 15; // 15 minutes
const maxTime = 1000 * 60; // For testing purposes
const cache = new Cache(maxTime)

export default cache;
