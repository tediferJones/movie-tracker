const cache: Record<string, { data: any, date: number }> = {};
// const maxTime = 1000 * 60 * 15; // 15 minutes
const maxTime = 1000 * 60; // For testing purposes

setInterval(() => {
  console.log('checking for outdated');
  const currentTime = Date.now();
  Object.keys(cache).forEach(key => {
    const timeDiff = currentTime - cache[key].date;
    if (timeDiff > maxTime) {
      console.log(`clearing ${key} from cache`);
      delete cache[key];
    }
  });
}, maxTime);

export default cache;
