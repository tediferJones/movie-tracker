type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'

export default function easyFetch<T>(
  route: string,
  method: Methods,
  body?: any,
  skipJSON?: boolean,
  retryCount = 0,
): Promise<T> {
  const useUrlParams = ['GET'].includes(method) ;
  const params = useUrlParams ? `?${new URLSearchParams(body)}` : '';
  const finalRoute = route + params;
  return fetch(finalRoute, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body && !useUrlParams ? JSON.stringify(body) : undefined,
  }).then(res => skipJSON ? res : res.json())
    .catch((err) => {
      // throw Error(`failed to fetch: ${route}`)
      console.log('fetch failed, attempt', retryCount)
      if(retryCount < 5) return easyFetch(route, method, body, skipJSON, retryCount + 1)
    });
}
