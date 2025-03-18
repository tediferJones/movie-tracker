type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'
type Args = {
  route: string,
  method: Methods,
  data?: any,
  useBody?: boolean,
  skipJSON?: boolean,
  retryCount?: number,
}

export default function easyFetchV2<T>({
  route,
  method,
  data,
  useBody,
  skipJSON,
  retryCount = 0
}: Args): Promise<T> {
  const params = data && !useBody ? `?${new URLSearchParams(data)}` : ''
  return fetch(route + params, {
    method,
    headers: useBody ? { 'content-type': 'application/json' } : undefined, 
    body: useBody ? JSON.stringify(data) : undefined,
  }).then(res => skipJSON ? res : res.json())
    .catch((err) => {
      console.log('fetch failed, attempt', retryCount)
      if(retryCount < 5) return easyFetchV2({
        route,
        method,
        data,
        skipJSON,
        retryCount: retryCount + 1
      })
    });
}
